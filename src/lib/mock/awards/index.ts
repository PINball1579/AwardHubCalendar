import type { AwardEntry } from "../types";
import { PATIENT } from "./patient";
import { THE_GIANT } from "./theGiant";
import { VASELINE_HUH } from "./vaselineHuh";
import { IT_MUST_BE_STING } from "./itMustBeSting";
import { CHIZZALULU_CHIZZALALA } from "./chizzaluluChizzalala";
import { THE_MISSING_PIECE } from "./theMissingPiece";
import { THE_UNFLUENCER } from "./theUnfluencer";
import { STAIN_CIAL_MEDIA_PLATFORM } from "./stainCialMediaPlatform";
import { WHERE_AI_MEETS_CONTEXT } from "./whereAiMeetsContext";

/**
 * Award entries powering the Gallery and Award Detail pages, transcribed from
 * the Figma "The Cave" Award Detail pages (3.1–3.8). Ordered by Figma page.
 */
export const AWARD_ENTRIES: AwardEntry[] = [
  PATIENT,
  THE_GIANT,
  VASELINE_HUH,
  IT_MUST_BE_STING,
  CHIZZALULU_CHIZZALALA,
  THE_MISSING_PIECE,
  THE_UNFLUENCER,
  STAIN_CIAL_MEDIA_PLATFORM,
  WHERE_AI_MEETS_CONTEXT,
];

export function getAwardEntry(slug: string): AwardEntry | undefined {
  return AWARD_ENTRIES.find((entry) => entry.slug === slug);
}
