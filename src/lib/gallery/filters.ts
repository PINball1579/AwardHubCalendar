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
    "New York Festival Advertising",
    "Marketing Excellence (MEA)",
    "One Asia",
    "Campaign Brief The Work",
    "Mad Stars",
    "HR Excellence",
    "Adman",
    "MMA Smarties",
    "London International (LIA)",
    "Agency of The Year",
    "Others",
  ],
  Agency: [
    "Leo Bangkok (LLB)",
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
  Trophy: ["Finalist", "Bronze", "Silver", "Gold", "Grand Prix", "Titanium"],
  Client: [
    "KFC",
    "Vaseline",
    "Sting",
    "Krungsri First Choice",
    "Breeze",
    "Clear",
    "Sunsilk",
    "McDonald's",
  ],
  Category: [
    "Creative & Craft",
    "Digital & Technology",
    "Media",
    "Integrated / Campaign",
    "Strategy & Effectiveness",
    "PR & Social",
    "Experience & Activation",
    "Purpose, Culture & Sustainability",
  ],
  Sector: [
    "Film",
    "Print",
    "Outdoor",
    "Social Media",
    "Influencer",
    "Digital / Web / App",
    "PR / Earned Media",
    "Experiential / Live",
    "Retail / Shopper",
    "Data / Tech-Driven",
  ],
} as const;

export type FilterGroup = keyof typeof FILTER_OPTIONS;

export const FILTER_GROUPS = Object.keys(FILTER_OPTIONS) as FilterGroup[];

/**
 * Selection mode per group.
 * - "multi" → checkbox dropdown (Figma 276:3686): several options at once.
 * - "single" → radio dropdown (Figma 276:3733): one option per group.
 * Year is unspecified by the design brief; kept multi so several years can
 * be combined.
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

/** Substrings that identify each named Award option in the entries table. */
const AWARD_KEYS: Record<string, string[]> = {
  Adfest: ["adfest"],
  "Spikes Asia": ["spikes"],
  "The One Show": ["one show"],
  "The Effie": ["effie"],
  "D&AD": ["d&ad"],
  "Cannes Lions": ["cannes"],
  "New York Festival Advertising": ["new york"],
  "Marketing Excellence (MEA)": ["marketing excellence", "mea"],
  "One Asia": ["one asia"],
  "Campaign Brief The Work": ["campaign brief"],
  "Mad Stars": ["mad stars"],
  "HR Excellence": ["hr excellence"],
  Adman: ["adman"],
  "MMA Smarties": ["smarties"],
  "London International (LIA)": ["london international", "lia"],
  "Agency of The Year": ["agency of the year"],
};

/** Substrings that identify each Agency option in `entry.agency`. */
const AGENCY_KEYS: Record<string, string[]> = {
  "Leo Bangkok (LLB)": ["leo"],
  "Publicis Thailand (PUB)": ["publicis thailand", "publicis, bangkok"],
  "Brilliant & Million (BM)": ["brilliant"],
  "Publicis Media (PUBM)": ["publicis media"],
  "Spark Foundry (PUBM_SP)": ["spark"],
  "Zenith (PUBM_ZOT)": ["zenith"],
  "Starcom (PUBM_STT)": ["starcom"],
  "Pub U (PUBM_PUBU)": ["pub u"],
  "Digitas (DGT)": ["digitas"],
  "Publicis Groupe (PUBTH)": ["publicis groupe"],
};

function matchesAward(entry: AwardEntry, option: string): boolean {
  const rows = entry.entries.map((r) => r.awards.toLowerCase());
  if (option === "Others") {
    const named = Object.values(AWARD_KEYS).flat();
    return rows.some((a) => !named.some((k) => a.includes(k)));
  }
  const keys = AWARD_KEYS[option] ?? [option.toLowerCase()];
  return rows.some((a) => keys.some((k) => a.includes(k)));
}

function matchesTrophy(entry: AwardEntry, option: string): boolean {
  const o = option.toLowerCase();
  return entry.entries.some(
    (r) => r.prizeTier === o || r.prize.toLowerCase().includes(o),
  );
}

function matchesGroupOption(
  entry: AwardEntry,
  group: FilterGroup,
  option: string,
): boolean {
  switch (group) {
    case "Year":
      return entry.year === Number(option);
    case "Award":
      return matchesAward(entry, option);
    case "Agency": {
      const keys = AGENCY_KEYS[option] ?? [option.toLowerCase()];
      const agency = entry.agency.toLowerCase();
      return keys.some((k) => agency.includes(k));
    }
    case "Trophy":
      return matchesTrophy(entry, option);
    case "Client":
      return entry.client.toLowerCase().includes(option.toLowerCase());
    // The mock entries carry no category/sector fields yet, so these filter
    // chips are informational and do not restrict the grid.
    case "Category":
    case "Sector":
      return true;
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
