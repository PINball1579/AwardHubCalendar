/** Prize kinds, ranked best → worst for ordering entries and trophy chips. */
export type PrizeKind =
  | "grandprix"
  | "gold"
  | "silver"
  | "bronze"
  | "shortlisted"
  | "other";

/** Classify a prize/trophy label into a kind (used for color + rank). */
export function prizeKind(text: string): PrizeKind {
  const p = text.toLowerCase();
  if (p.includes("grand prix")) return "grandprix";
  if (p.includes("gold")) return "gold";
  if (p.includes("silver")) return "silver";
  if (p.includes("bronze")) return "bronze";
  if (p.includes("shortlist")) return "shortlisted";
  return "other";
}

const RANK: Record<PrizeKind, number> = {
  grandprix: 0,
  gold: 1,
  silver: 2,
  bronze: 3,
  shortlisted: 4,
  other: 5,
};

/** Sort weight: Grand Prix > Gold > Silver > Bronze > Shortlisted > Others. */
export function prizeRank(text: string): number {
  return RANK[prizeKind(text)];
}

/** Tailwind background class per prize kind (legend colors); text is white. */
export const PRIZE_CHIP_CLASS: Record<PrizeKind, string> = {
  grandprix: "bg-prize-grandprix",
  gold: "bg-prize-gold",
  silver: "bg-prize-silver",
  bronze: "bg-prize-bronze",
  shortlisted: "bg-prize-shortlisted",
  other: "bg-prize-other",
};
