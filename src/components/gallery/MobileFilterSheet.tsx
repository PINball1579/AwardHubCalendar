/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import {
  FILTER_GROUPS,
  FILTER_GROUP_LABELS,
  FILTER_MODES,
  FILTER_OPTIONS,
  SORT_OPTIONS,
  type FilterGroup,
  type SortOption,
} from "@/lib/gallery/filters";

interface MobileFilterSheetProps {
  open: boolean;
  onClose: () => void;
  activeFilters: string[];
  sort: SortOption;
  onApply: (filters: string[], sort: SortOption) => void;
}

function AccordionRow({
  label,
  isOpen,
  onToggle,
  children,
}: {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-white">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-6 py-4 text-left font-normal leading-normal text-white text-[16px]"
      >
        {label}
        <img
          src="/images/chevron-down.svg"
          alt=""
          className={`h-5 w-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && <div className="pb-2">{children}</div>}
    </div>
  );
}

/** Checkbox-style option row (circle marker, left) — used for "multi" groups. */
function MultiOptionRow({
  label,
  selected,
  onToggle,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center gap-3 px-6 py-3 text-left"
    >
      <span
        aria-hidden="true"
        className={`h-6 w-6 shrink-0 rounded-full border ${
          selected ? "border-cave-golddim bg-cave-golddim" : "border-white"
        }`}
      />
      <span
        className={`flex-1 font-normal leading-normal text-[16px] ${
          selected ? "text-cave-golddim" : "text-white"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

/** Radio-style option row (gold check, right) — used for "single" groups and Sort. */
function SingleOptionRow({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full items-center gap-3 px-6 py-3 text-left"
    >
      <span
        className={`flex-1 font-normal leading-normal text-[16px] ${
          selected ? "text-cave-golddim" : "text-white"
        }`}
      >
        {label}
      </span>
      {selected && (
        <img src="/images/check-gold.svg" alt="" className="h-4 w-4 shrink-0" />
      )}
    </button>
  );
}

/**
 * Full-screen mobile "Filters" sheet, faithful to the Figma mobile update
 * (node 623:248): header + close, an accordion per filter group (plus Sort),
 * and a pinned Clear / Apply footer. Selections are staged in local state and
 * only committed to the gallery when Apply is tapped.
 */
export function MobileFilterSheet({
  open,
  onClose,
  activeFilters,
  sort,
  onApply,
}: MobileFilterSheetProps) {
  const [draft, setDraft] = useState<string[]>(activeFilters);
  const [draftSort, setDraftSort] = useState<SortOption>(sort);
  const [openGroup, setOpenGroup] = useState<FilterGroup | "Sort" | null>(null);

  // reset the staged selection from the committed state each time the sheet opens
  useEffect(() => {
    if (!open) return;
    setDraft(activeFilters);
    setDraftSort(sort);
    setOpenGroup(null);
  }, [open, activeFilters, sort]);

  if (!open) return null;

  const toggleOption = (group: FilterGroup, option: string) =>
    setDraft((prev) => {
      const already = prev.includes(option);
      if (FILTER_MODES[group] === "single") {
        const groupOptions = FILTER_OPTIONS[group] as readonly string[];
        const withoutGroup = prev.filter((x) => !groupOptions.includes(x));
        return already ? withoutGroup : [...withoutGroup, option];
      }
      return already ? prev.filter((x) => x !== option) : [...prev, option];
    });

  const toggleSelectAll = (group: FilterGroup) => {
    const groupOptions = FILTER_OPTIONS[group] as readonly string[];
    const allSelected = groupOptions.every((o) => draft.includes(o));
    setDraft((prev) => {
      const withoutGroup = prev.filter((x) => !groupOptions.includes(x));
      return allSelected ? withoutGroup : [...withoutGroup, ...groupOptions];
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black md:hidden">
      <div className="flex items-center justify-between border-b border-ink-800 px-6 py-6">
        <h2 className="font-normal leading-normal text-white text-[20px]">Filters</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close filters"
          className="flex h-12 w-12 items-center justify-center rounded-full border border-cave-golddim"
        >
          <img src="/images/close-icon.svg" alt="" className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {FILTER_GROUPS.map((group) => (
          <AccordionRow
            key={group}
            label={FILTER_GROUP_LABELS[group]}
            isOpen={openGroup === group}
            onToggle={() =>
              setOpenGroup((cur) => (cur === group ? null : group))
            }
          >
            {FILTER_MODES[group] === "multi" ? (
              <>
                <div className="border-b border-ink-800">
                  <MultiOptionRow
                    label="Select all"
                    selected={(FILTER_OPTIONS[group] as readonly string[]).every(
                      (o) => draft.includes(o),
                    )}
                    onToggle={() => toggleSelectAll(group)}
                  />
                </div>
                {FILTER_OPTIONS[group].map((option) => (
                  <MultiOptionRow
                    key={option}
                    label={option}
                    selected={draft.includes(option)}
                    onToggle={() => toggleOption(group, option)}
                  />
                ))}
              </>
            ) : (
              FILTER_OPTIONS[group].map((option) => (
                <SingleOptionRow
                  key={option}
                  label={option}
                  selected={draft.includes(option)}
                  onSelect={() => toggleOption(group, option)}
                />
              ))
            )}
          </AccordionRow>
        ))}

        <AccordionRow
          label={draftSort}
          isOpen={openGroup === "Sort"}
          onToggle={() => setOpenGroup((cur) => (cur === "Sort" ? null : "Sort"))}
        >
          {SORT_OPTIONS.map((option) => (
            <SingleOptionRow
              key={option}
              label={option}
              selected={draftSort === option}
              onSelect={() => setDraftSort(option)}
            />
          ))}
        </AccordionRow>
      </div>

      <div className="flex items-center gap-3 border-t border-ink-800 px-6 py-4">
        <button
          type="button"
          onClick={() => setDraft([])}
          className="h-11 flex-1 rounded-full border-2 border-cave-golddim font-normal leading-normal text-cave-golddim text-[16px]"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={() => onApply(draft, draftSort)}
          className="h-11 flex-1 rounded-full bg-cave-golddim font-normal leading-normal text-white text-[16px]"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
