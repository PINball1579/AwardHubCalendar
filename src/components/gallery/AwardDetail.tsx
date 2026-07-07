/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { TierChip } from "@/components/ui/TierChip";
import { OverviewTab, EntriesTab, CreditsTab } from "./detailTabs";
import type { AwardEntry } from "@/lib/mock/types";

const TABS = ["Overview", "Entries", "Credits"] as const;
type Tab = (typeof TABS)[number];

interface AwardDetailProps {
  entry: AwardEntry;
}

export function AwardDetail({ entry }: AwardDetailProps) {
  const [tab, setTab] = useState<Tab>("Overview");

  return (
    <div className="cave-container py-10">
      {/* header */}
      <h1 className="font-normal leading-normal text-white text-[44px] sm:text-[80px]">
        {entry.title}
      </h1>
      <p className="mt-2 font-normal uppercase leading-normal text-white text-[16px] sm:text-[24px]">
        {entry.agency} / {entry.client} / {entry.year}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {entry.trophies.map((t) => (
          <TierChip key={t.label} label={t.label} tier={t.tier} />
        ))}
      </div>

      <hr className="my-6 rule-faint" />

      {/* media — Figma: still centered on a black band, no rounding; the
          campaign image already carries its stat overlay */}
      <div className="relative aspect-[1062/709] w-full overflow-hidden bg-black">
        <img
          src={entry.image}
          alt={entry.title}
          className="absolute inset-0 h-full w-full object-contain"
        />
      </div>

      {/* control bar — Figma: Download / Full screen pills left, chevrons,
          divider line, large slide counter right */}
      <div className="mt-5 flex flex-wrap items-center gap-3 sm:gap-4">
        <button className="flex h-9 items-center gap-2 rounded-full border border-ink-600 px-5 font-normal leading-normal text-white text-[14px] sm:text-[16px] hover:border-cave-gold hover:text-cave-gold">
          Download
          <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4 fill-current">
            <path d="M8 1v9.2L4.6 6.8 3.4 8 8 12.6 12.6 8l-1.2-1.2L8 10.2V1H8zM2 14h12v1.5H2z" />
          </svg>
        </button>
        <button className="flex h-9 items-center gap-2 rounded-full border border-ink-600 px-5 font-normal leading-normal text-white text-[14px] sm:text-[16px] hover:border-cave-gold hover:text-cave-gold">
          Full screen
          <svg aria-hidden="true" viewBox="0 0 22 22" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.6">
            <path d="M8 3H3v5M14 3h5v5M8 19H3v-5M14 19h5v-5" />
          </svg>
        </button>

        <div className="ml-auto flex items-center gap-4 sm:ml-16">
          <button
            aria-label="Previous"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white transition-opacity hover:opacity-70 sm:h-16 sm:w-16"
          >
            <img src="/images/chevron-left.svg" alt="" className="h-6 w-6" />
          </button>
          <button
            aria-label="Next"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white transition-opacity hover:opacity-70 sm:h-16 sm:w-16"
          >
            <img src="/images/chevron-left.svg" alt="" className="h-6 w-6 rotate-180" />
          </button>
        </div>

        {/* solid white track + solid gold segment (no fading) */}
        <div className="relative hidden h-px flex-1 bg-white sm:block">
          <div className="absolute -top-px left-0 h-[3px] w-1/2 bg-cave-gold" />
        </div>
        <span className="font-bold leading-normal text-white text-[32px] sm:text-[54px]">
          01
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
