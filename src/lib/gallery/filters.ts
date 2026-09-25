import type { AwardEntry } from "@/lib/mock/types";

/** Gallery filter groups and their options. */
export const FILTER_OPTIONS = {
  Year: [
    "2016", "2017", "2018", "2019", "2020", "2021",
    "2022", "2023", "2024", "2025", "2026",
  ],
  Award: [
    "Adfest",
    "Spikes Asia",
    "The One Show",
    "The Effie",
    "D&AD",
    "Cannes Lions",
    "New York Festivals Advertising",
    "Marketing Excellence (MEA)",
    "One Asia",
    "Campaign Brief The Work",
    "Mad Stars",
    "HR Excellence",
    "Adman",
    "MMA Smarties",
    "London International (LIA)",
    "Agency of The Year",
    "Gerety Awards",
    "White Square Festival",
    "Campaign Asia - Media Awards",
    "Clio Awards",
    "Festival of Media APAC",
    "Others",
  ],
  Agency: [
    "Leo Bangkok (LBB)",
    "Publicis Thailand (PUB)",
    "Brilliant & Million (BM)",
    "Publicis Media (PUBM)",
    "Spark Foundry (PUBM_SP)",
    "Zenith (PUBM_ZOT)",
    "Starcom (PUBM_STT)",
    "Pub U (PUBM_PUBU)",
    "Digitas (DGT)",
    "Publicis Groupe (PUBTH)",
  ],
  Trophy: ["Grand Prix", "Gold", "Silver", "Bronze", "Shortlisted", "Others"],
  Client: [
    "KFC",
    "Vaseline",
    "Sting",
    "Krungsri First Choice",
    "Breeze",
    "Clear",
    "Sunsilk",
    "McDonald's",
    "Visa",
    "Mirinda",
  ],
  Category: [
    "Film",
    "Media",
    "PR",
    "Entertainment",
    "Social / Creator & Influencer",
    "Digital & Social",
    "Film Craft",
    "Brand Experience & Activation",
    "Marketing & Effectiveness",
    "Human Resource",
    "People Awards",
    "Others",
  ],
  Sector: [
    "Technology & Telecommunications",
    "FMCG & Household Products",
    "Food & Beverage",
    "Retail & E-commerce",
    "Automotive & Mobility",
    "Financial Services",
    "Energy / Utilities & Industrial",
    "Healthcare & Wellness",
    "Travel / Hospitality & Leisure",
    "Entertainment / Media & Gaming",
    "Real Estate & Property",
    "Government / NGO & Social Impact",
  ],
} as const;

export type FilterGroup = keyof typeof FILTER_OPTIONS;

export const FILTER_GROUPS = Object.keys(FILTER_OPTIONS) as FilterGroup[];

/** Display label per group — Figma's mobile filter sheet spells "Award" as "Awards". */
export const FILTER_GROUP_LABELS: Record<FilterGroup, string> = {
  Year: "Year",
  Award: "Awards",
  Agency: "Agency",
  Trophy: "Trophy",
  Client: "Client",
  Category: "Category",
  Sector: "Sector",
};

export const SORT_OPTIONS = [
  "Newest to oldest",
  "Oldest to newest",
  "Most Awarded",
  "Title A-Z",
  "Title Z-A",
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number];

/**
 * Selection mode per group.
 * - "multi" → checkbox dropdown (Figma 276:3686): several options at once.
 * - "single" → radio dropdown (Figma 276:3733): one option per group.
 */
export const FILTER_MODES: Record<FilterGroup, "multi" | "single"> = {
  Year: "multi",
  Award: "multi",
  Agency: "multi",
  Trophy: "single",
  Client: "single",
  Category: "single",
  Sector: "single",
};

/** Look up which group an option belongs to. */
export function groupOfFilter(value: string): FilterGroup | undefined {
  return FILTER_GROUPS.find((g) =>
    (FILTER_OPTIONS[g] as readonly string[]).includes(value),
  );
}

/**
 * Does a work match a single filter option? Each work is tagged with the
 * distinct values it won (entry.filters), so matching is exact membership.
 */
function matchesGroupOption(
  entry: AwardEntry,
  group: FilterGroup,
  option: string,
): boolean {
  const f = entry.filters;
  switch (group) {
    case "Year":
      return f.years.includes(Number(option));
    case "Award":
      return f.awards.includes(option);
    case "Agency":
      return f.agencies.includes(option);
    case "Trophy":
      return f.trophies.includes(option);
    case "Client":
      return f.clients.includes(option);
    case "Category":
      return f.categories.includes(option);
    case "Sector":
      return f.sectors.includes(option);
  }
}

/**
 * Apply active filters: OR within a group, AND across groups.
 * Unknown filter values are ignored.
 */
export function filterEntries(
  entries: AwardEntry[],
  active: string[],
): AwardEntry[] {
  const byGroup = new Map<FilterGroup, string[]>();
  for (const value of active) {
    const group = groupOfFilter(value);
    if (!group) continue;
    byGroup.set(group, [...(byGroup.get(group) ?? []), value]);
  }
  if (byGroup.size === 0) return entries;

  return entries.filter((entry) =>
    Array.from(byGroup.entries()).every(([group, options]) =>
      options.some((o) => matchesGroupOption(entry, group, o)),
    ),
  );
}
