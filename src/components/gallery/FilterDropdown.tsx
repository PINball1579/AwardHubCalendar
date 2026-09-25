/* eslint-disable @next/next/no-img-element */
"use client";

interface FilterDropdownProps {
  label: string;
  options: readonly string[];
  /** currently selected option(s) for this group */
  selected: string[];
  /** "multi" → checkbox (circle marker, left); "single" → radio (check, right) */
  mode: "multi" | "single";
  open: boolean;
  onToggleOpen: () => void;
  onSelect: (option: string) => void;
  /** align the panel to the right edge of the trigger (used for Sort by) */
  align?: "left" | "right";
}

/**
 * Gallery filter dropdown, faithful to Figma:
 *  - trigger: black pill, gold border, chevron that flips when open
 *  - panel:   black, gold border + gold drop-shadow, rounded, 240px wide
 *  - multi:   gold circle marker on the left, gold text when selected
 *  - single:  gold check on the right, gold text when selected
 */
export function FilterDropdown({
  label,
  options,
  selected,
  mode,
  open,
  onToggleOpen,
  onSelect,
  align = "left",
}: FilterDropdownProps) {
  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={onToggleOpen}
        aria-expanded={open}
        className="flex h-9 items-center justify-between gap-2 whitespace-nowrap rounded-full border border-cave-golddim bg-black px-4 font-normal uppercase leading-normal text-white text-[12px]"
      >
        {label}
        <img
          src="/images/chevron-down.svg"
          alt=""
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className={`absolute top-full z-30 mt-2 flex max-h-[70vh] w-[240px] flex-col overflow-y-auto rounded-[12px] border border-cave-golddim bg-black p-1.5 shadow-[0px_4px_6px_rgba(157,131,62,0.1)] ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {options.map((option) => {
            const isSelected = selected.includes(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() => onSelect(option)}
                className={`flex items-center gap-2 rounded-[8px] px-3 py-2.5 text-left font-normal leading-normal text-[14px] transition-colors hover:bg-ink-900 ${
                  isSelected ? "text-cave-golddim" : "text-white"
                }`}
              >
                {mode === "multi" && (
                  <span
                    aria-hidden="true"
                    className={`h-[9px] w-[9px] shrink-0 rounded-full border ${
                      isSelected
                        ? "border-cave-golddim bg-cave-golddim"
                        : "border-white/80"
                    }`}
                  />
                )}
                <span className="flex-1">{option}</span>
                {mode === "single" && isSelected && (
                  <img
                    src="/images/check-gold.svg"
                    alt=""
                    className="h-3.5 w-3.5 shrink-0"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
