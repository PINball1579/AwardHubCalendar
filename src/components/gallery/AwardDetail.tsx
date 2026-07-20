/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { PrizeChip } from "@/components/ui/PrizeChip";
import { OverviewTab, EntriesTab, CreditsTab } from "./detailTabs";
import { PROJECT_MEDIA } from "@/lib/mock/projectMedia";
import { prizeRank } from "@/lib/gallery/prize";
import type { AwardEntry, MediaItem } from "@/lib/mock/types";

const TABS = ["Overview", "Entries", "Credits"] as const;
type Tab = (typeof TABS)[number];

interface AwardDetailProps {
  entry: AwardEntry;
}

export function AwardDetail({ entry }: AwardDetailProps) {
  const [tab, setTab] = useState<Tab>("Overview");

  // slider: the folder's "01" subject image is the banner/first slide, then
  // the other photos, then videos (falls back to the still if no folder media)
  const media = PROJECT_MEDIA[entry.slug] ?? [];
  const slides: MediaItem[] =
    media.length > 0 ? media : [{ type: "image", src: entry.image }];
  const [slide, setSlide] = useState(0);
  const total = slides.length;
  const move = (delta: number) =>
    setSlide((prev) => (prev + delta + total) % total);
  const current = slides[slide];

  return (
    <div className="cave-container py-10">
      {/* header */}
      <h1 className="font-normal leading-normal text-white text-[44px] sm:text-[80px]">
        {entry.title}
      </h1>
      <p className="mt-2 font-normal uppercase leading-normal text-white text-[16px] sm:text-[24px]">
        {entry.agency} / {entry.client} / {entry.year}
      </p>
      {/* trophy chips ordered like the Entries table: Grand Prix > Gold >
          Silver > Bronze > Shortlisted > Others */}
      <div className="mt-3 flex flex-wrap gap-2">
        {[...entry.trophies]
          .sort((a, b) => prizeRank(a.label) - prizeRank(b.label))
          .map((t) => (
            <PrizeChip key={t.label} label={t.label} />
          ))}
      </div>

      <hr className="my-6 rule-faint" />

      {/* media slider — banner still, then supporting photos, then videos */}
      <div className="relative aspect-[1062/709] w-full overflow-hidden bg-black">
        {current.type === "image" ? (
          <img
            key={current.src}
            src={current.src}
            alt={entry.title}
            className="absolute inset-0 h-full w-full object-contain"
          />
        ) : (
          <video
            key={current.src}
            src={current.src}
            controls
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-contain"
          />
        )}
      </div>

      {/* control bar — Figma: Download pill left, chevrons, divider line,
          large slide counter right */}
      <div className="mt-5 flex flex-wrap items-center gap-3 sm:gap-4">
        <a
          href={entry.downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-9 items-center gap-2 rounded-full border border-ink-600 px-5 font-normal leading-normal text-white text-[14px] sm:text-[16px] hover:border-cave-gold hover:text-cave-gold"
        >
          Download
          <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4 fill-current">
            <path d="M8 1v9.2L4.6 6.8 3.4 8 8 12.6 12.6 8l-1.2-1.2L8 10.2V1H8zM2 14h12v1.5H2z" />
          </svg>
        </a>

        <div className="ml-auto flex items-center gap-4 sm:ml-16">
          <button
            aria-label="Previous"
            onClick={() => move(-1)}
            disabled={total <= 1}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white transition-opacity hover:opacity-70 disabled:opacity-30 sm:h-16 sm:w-16"
          >
            <img src="/images/chevron-left.svg" alt="" className="h-6 w-6" />
          </button>
          <button
            aria-label="Next"
            onClick={() => move(1)}
            disabled={total <= 1}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white transition-opacity hover:opacity-70 disabled:opacity-30 sm:h-16 sm:w-16"
          >
            <img src="/images/chevron-left.svg" alt="" className="h-6 w-6 rotate-180" />
          </button>
        </div>

        {/* solid white track + solid gold segment that tracks the active slide */}
        <div className="relative hidden h-px flex-1 bg-white sm:block">
          <div
            className="absolute -top-px h-[3px] bg-cave-gold transition-all duration-300"
            style={{ width: `${100 / total}%`, left: `${(slide * 100) / total}%` }}
          />
        </div>
        <span className="font-bold tabular-nums leading-normal text-white text-[32px] sm:text-[54px]">
          {String(slide + 1).padStart(2, "0")}
        </span>
      </div>

      {/* tabs */}
      <div className="mt-6 grid grid-cols-3 overflow-hidden rounded-full border border-ink-700">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`py-2.5 font-normal leading-normal text-[14px] sm:text-[16px] transition-colors ${
              tab === t
                ? "rounded-full bg-cave-gradient text-white"
                : "text-muted hover:text-zinc-200"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === "Overview" && <OverviewTab entry={entry} />}
        {tab === "Entries" && <EntriesTab entry={entry} />}
        {tab === "Credits" && <CreditsTab entry={entry} />}
      </div>
    </div>
  );
}
