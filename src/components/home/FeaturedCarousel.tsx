/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import Link from "next/link";
import { FEATURED_WORK } from "@/lib/mock/featured";

export function FeaturedCarousel() {
  const [active, setActive] = useState(0);
  const total = FEATURED_WORK.length;

  const shift = (delta: number) =>
    setActive((prev) => (prev + delta + total) % total);

  return (
    <section className="cave-container py-6">
      <div className="grid grid-cols-2 gap-1 md:grid-cols-4">
        {FEATURED_WORK.map((work, i) => (
          <Link
            key={work.slug}
            href={`/gallery/${work.slug}`}
            onMouseEnter={() => setActive(i)}
            className={`group relative aspect-video overflow-hidden ring-1 transition-all ${
              i === active ? "ring-cave-gold/70" : "ring-ink-800"
            }`}
          >
            <img
              src={work.image}
              alt={work.title}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </Link>
        ))}
      </div>

      {/* Figma BAR: white-bordered chevron circles, solid white track with a
          solid gold segment that slides with the active slide (no fading) */}
      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={() => shift(-1)}
          aria-label="Previous"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white transition-opacity hover:opacity-70 sm:h-16 sm:w-16"
        >
          <img src="/images/chevron-left.svg" alt="" className="h-6 w-6" />
        </button>
        <button
          onClick={() => shift(1)}
          aria-label="Next"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white transition-opacity hover:opacity-70 sm:h-16 sm:w-16"
        >
          <img src="/images/chevron-left.svg" alt="" className="h-6 w-6 rotate-180" />
        </button>
        <div className="relative mx-2 h-px flex-1 bg-white">
          <div
            className="absolute -top-px h-[3px] bg-cave-gold transition-all duration-300"
            style={{
              width: `${100 / total}%`,
              left: `${(active * 100) / total}%`,
            }}
          />
        </div>
        <span className="font-bold tabular-nums leading-normal text-white text-[40px] sm:text-[54px]">
          {String(active + 1).padStart(2, "0")}
        </span>
      </div>
    </section>
  );
}
