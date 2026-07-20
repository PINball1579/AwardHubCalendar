/** Shared domain types for the mock showcase content. */

export type TrophyTier = "gold" | "silver" | "bronze" | "finalist" | "winner";

export interface Trophy {
  label: string;
  tier: TrophyTier;
}

export interface AwardStat {
  value: string;
  label: string;
}

export interface EntryRow {
  year: number;
  name: string;
  category: string;
  subCategory: string;
  awards: string;
  prize: string;
  prizeTier: TrophyTier;
}

export interface CreditRow {
  company: string;
  location: string;
  role: string;
}

/** A titled block in the Overview tab (Background, Idea, Execution, Outcome, …). */
export interface OverviewSection {
  title: string;
  body: string;
}

export interface AwardEntry {
  slug: string;
  title: string;
  agency: string;
  client: string;
  year: number;
  location: string;
  /** real campaign still from Figma */
  image: string;
  /** key used for the cinematic placeholder tint (fallback only) */
  accent: "amber" | "violet" | "cyan" | "rose";
  trophies: Trophy[];
  stats: AwardStat[];
  overview: OverviewSection[];
  entries: EntryRow[];
  companyCredits: CreditRow[];
  peopleCredits: CreditRow[];
  /** Box folder the Download button opens (entry-kit assets). */
  downloadUrl: string;
}

export interface FeaturedWork {
  slug: string;
  title: string;
  image: string;
  accent: AwardEntry["accent"];
  stats: AwardStat[];
}

export type CategoryColor = "cyan" | "pink" | "teal" | "tan";

/** A slide in the Award Detail media slider (a photo or a video). */
export interface MediaItem {
  type: "image" | "video";
  src: string;
}

/** Award-cycle milestone types; each drives a fixed chip color on the calendar. */
export type MilestoneType =
  | "Open for entry"
  | "Fee increase"
  | "Final Deadline"
  | "Winner Announcement";

export interface CalendarEvent {
  id: string;
  title: string;
  /** ISO date (YYYY-MM-DD) the chip lands on */
  date: string;
  category: string;
  color: CategoryColor;
  /** milestone this deadline represents (drives the chip color) */
  milestone?: MilestoneType;
}

export interface AwardOrg {
  id: string;
  name: string;
  scope: string;
  deadline: string;
  description: string;
  tags: string[];
  entryKitUrl: string;
  /** brand logo asset, when the design supplies one */
  logo?: string;
  /** logo tile background (some logos sit on a colored field) */
  logoBg?: string;
}
