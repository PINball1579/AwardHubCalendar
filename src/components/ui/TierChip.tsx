import type { TrophyTier } from "@/lib/mock/types";

const TIER_CLASSES: Record<TrophyTier, string> = {
  gold: "bg-cave-gold text-ink-950",
  silver: "bg-zinc-300 text-ink-950",
  bronze: "bg-chip-bronze text-white",
  finalist: "bg-ink-700 text-white",
  winner: "bg-cave-magenta text-white",
};

interface TierChipProps {
  label: string;
  tier: TrophyTier;
  size?: "sm" | "md";
  className?: string;
}

export function TierChip({
  label,
  tier,
  size = "md",
  className = "",
}: TierChipProps) {
  // Figma trophy chips: Gotham Book 17px, not uppercase.
  const sizeClass =
    size === "md"
      ? "px-3 py-1 text-[14px] sm:text-[17px]"
      : "px-2.5 py-1 text-[12px] sm:text-[13px]";
  return (
    <span
      className={`inline-flex items-center rounded-[3px] font-normal leading-normal ${sizeClass} ${TIER_CLASSES[tier]} ${className}`}
    >
      {label}
    </span>
  );
}
