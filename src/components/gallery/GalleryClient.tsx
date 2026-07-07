/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";
import { EntryCard } from "./EntryCard";
import { AWARD_ENTRIES } from "@/lib/mock/awards";

const FILTER_GROUPS = [
  "Year",
  "Award",
  "Agency",
  "Trophy",
  "Client",
  "Category",
  "Sector",
] as const;

const SORT_OPTIONS = ["Newest to oldest", "Oldest to newest", "A–Z"] as const;

/** Applied-filter chip colors, looping green → pink → blue → gold (Figma). */
const FILTER_CHIP_COLORS = [
  "bg-chip-teal", // #00b0a3
  "bg-chip-pink", // #d93d7a
  "bg-chip-cyan", // #16abe0
  "bg-chip-tan", // #9d833e
] as const;

export function GalleryClient() {
  const [activeFilters, setActiveFilters] = useState<string[]>([
    "Cannes Lions",
    "Spikes Asia",
  ]);
  const [sort, setSort] = useState<(typeof SORT_OPTIONS)[number]>(
    "Newest to oldest",
  );

  const removeFilter = (f: string) =>
    setActiveFilters((prev) => prev.filter((x) => x !== f));

  const entries = useMemo(() => {
    const sorted = [...AWARD_ENTRIES];
    if (sort === "Newest to oldest") sorted.sort((a, b) => b.year - a.year);
    if (sort === "Oldest to newest") sorted.sort((a, b) => a.year - b.year);
    if (sort === "A–Z") sorted.sort((a, b) => a.title.localeCompare(b.title));
    return sorted;
  }, [sort]);

  return (
    <div>
      {/* cinematic hero band */}
      <div className="relative h-[240px] w-full sm:h-[420px]">
        <img
          src="/images/hero-cave.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-hero-fade" />
      </div>

      <div className="cave-container py-8">
        {/* filter bar */}
        <div className="flex flex-wrap items-center gap-3">
          {FILTER_GROUPS.map((group) => (
            <details key={group} className="group relative">
              <summary className="ghost-pill cursor-pointer list-none">
                {group}
                <span className="text-muted">▾</span>
              </summary>
            </details>
          ))}
          <label className="ml-auto flex items-center gap-2 font-normal leading-normal text-muted text-[14px]">
            Sort by
            <select
              value={sort}
              onChange={(e) =>
                setSort(e.target.value as (typeof SORT_OPTIONS)[number])
              }
              className="rounded-full border border-ink-600 bg-ink-850 px-3 py-1.5 font-normal text-zinc-200 text-[14px]"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </label>
        </div>

        {/* active filters */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="font-normal leading-normal text-white text-[14px]">Selected filters</span>
          {activeFilters.map((f, i) => (
            <button
              key={f}
              onClick={() => removeFilter(f)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-normal leading-normal text-white text-[13px] ${
                FILTER_CHIP_COLORS[i % FILTER_CHIP_COLORS.length]
              }`}
            >
              {f} <span aria-hidden="true">✕</span>
            </button>
          ))}
          {activeFilters.length > 0 && (
            <button
              onClick={() => setActiveFilters([])}
              className="font-normal text-muted text-[13px] underline hover:text-zinc-200"
            >
              Clear
            </button>
          )}
        </div>

        {/* grid */}
        <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
          {entries.map((entry) => (
            <EntryCard key={entry.slug} entry={entry} />
          ))}
        </div>
      </div>
    </div>
  );
}
