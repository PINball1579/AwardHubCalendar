/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { EntryCard } from "./EntryCard";
import { FilterDropdown } from "./FilterDropdown";
import { AWARD_ENTRIES } from "@/lib/mock/awards";
import {
  FILTER_GROUPS,
  FILTER_MODES,
  FILTER_OPTIONS,
  filterEntries,
  type FilterGroup,
} from "@/lib/gallery/filters";

const SORT_OPTIONS = [
  "Newest to oldest",
  "Oldest to newest",
  "Most Awarded",
  "Title A-Z",
  "Title Z-A",
] as const;
type SortOption = (typeof SORT_OPTIONS)[number];

export function GalleryClient() {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [sort, setSort] = useState<SortOption>("Newest to oldest");
  /** which dropdown is open — only one at a time, "Sort" for the sort menu */
  const [openMenu, setOpenMenu] = useState<FilterGroup | "Sort" | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  // close whichever dropdown is open when clicking outside the filter bar
  useEffect(() => {
    if (!openMenu) return;
    const onDown = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [openMenu]);

  const removeFilter = (f: string) =>
    setActiveFilters((prev) => prev.filter((x) => x !== f));

  const selectFilter = (group: FilterGroup, option: string) =>
    setActiveFilters((prev) => {
      const already = prev.includes(option);
      if (FILTER_MODES[group] === "single") {
        // radio: clear the rest of this group, then toggle the chosen one
        const groupOptions = FILTER_OPTIONS[group] as readonly string[];
        const withoutGroup = prev.filter((x) => !groupOptions.includes(x));
        return already ? withoutGroup : [...withoutGroup, option];
      }
      // checkbox: toggle
      return already ? prev.filter((x) => x !== option) : [...prev, option];
    });

  const entries = useMemo(() => {
    const list = filterEntries([...AWARD_ENTRIES], activeFilters);
    if (sort === "Newest to oldest") list.sort((a, b) => b.year - a.year);
    if (sort === "Oldest to newest") list.sort((a, b) => a.year - b.year);
    if (sort === "Most Awarded")
      list.sort((a, b) => b.entries.length - a.entries.length);
    if (sort === "Title A-Z") list.sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "Title Z-A") list.sort((a, b) => b.title.localeCompare(a.title));
    return list;
  }, [sort, activeFilters]);

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
        <div ref={barRef} className="flex flex-wrap items-center gap-3">
          {FILTER_GROUPS.map((group) => (
            <FilterDropdown
              key={group}
              label={group}
              options={FILTER_OPTIONS[group]}
              selected={activeFilters}
              mode={FILTER_MODES[group]}
              open={openMenu === group}
              onToggleOpen={() =>
                setOpenMenu((cur) => (cur === group ? null : group))
              }
              onSelect={(option) => selectFilter(group, option)}
            />
          ))}

          <div className="ml-auto flex items-center gap-2">
            <span className="font-normal leading-normal text-muted text-[14px]">
              Sort by
            </span>
            <FilterDropdown
              label={sort}
              options={SORT_OPTIONS}
              selected={[sort]}
              mode="single"
              align="right"
              open={openMenu === "Sort"}
              onToggleOpen={() =>
                setOpenMenu((cur) => (cur === "Sort" ? null : "Sort"))
              }
              onSelect={(option) => {
                setSort(option as SortOption);
                setOpenMenu(null);
              }}
            />
          </div>
        </div>

        {/* active filters — all gold; scrolls horizontally when long */}
        {activeFilters.length > 0 && (
          <div className="mt-4 flex items-center gap-2">
            <span className="shrink-0 font-normal leading-normal text-white text-[14px]">
              Selected filters
            </span>
            <div className="flex flex-1 items-center gap-2 overflow-x-auto whitespace-nowrap pb-1">
              {activeFilters.map((f) => (
                <button
                  key={f}
                  onClick={() => removeFilter(f)}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-cave-gold px-3 py-1 font-normal leading-normal text-ink-950 text-[13px]"
                >
                  {f} <span aria-hidden="true">✕</span>
                </button>
              ))}
              <button
                onClick={() => setActiveFilters([])}
                className="shrink-0 font-normal text-muted text-[13px] underline hover:text-zinc-200"
              >
                Clear
              </button>
            </div>
          </div>
        )}

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
