import { prizeKind, PRIZE_CHIP_CLASS } from "@/lib/gallery/prize";

interface PrizeChipProps {
  /** the prize/trophy label; its color is derived from the prize kind */
  label: string;
  size?: "sm" | "md";
  className?: string;
}

/**
 * A prize badge colored by the design legend (Grand Prix magenta, Gold,
 * Silver, Bronze, Shortlisted teal, Others blue). Used for both the Award
 * Detail entries table and the trophy chips below the title.
 */
export function PrizeChip({ label, size = "md", className = "" }: PrizeChipProps) {
  const sizeClass =
    size === "md"
      ? "px-3 py-1 text-[14px] sm:text-[17px]"
      : "px-2.5 py-1 text-[12px] sm:text-[13px]";
  return (
    <span
      className={`inline-flex items-center rounded-[3px] font-normal leading-normal text-white ${sizeClass} ${PRIZE_CHIP_CLASS[prizeKind(label)]} ${className}`}
    >
      {label}
    </span>
  );
}
