import type { CalendarEvent } from "./types";

/**
 * Demo award-deadline events used as a fallback on the Calendar page when no
 * live mailbox events are available (e.g. signed-out showcase view).
 * Dates align with the Figma calendar frames (Oct 2024 – Jan 2025 + May 2024).
 */
export const MOCK_CALENDAR_EVENTS: CalendarEvent[] = [
  // October 2024 (matches the full Calendar frame)
  { id: "m1", title: "Cannes Lion's", date: "2024-10-03", category: "Cannes Lions", color: "cyan" },
  { id: "m2", title: "AOY 2024", date: "2024-10-25", category: "Agency of the Year", color: "pink" },
  { id: "m3", title: "ADS MAN", date: "2024-10-29", category: "Ads Man", color: "teal" },
  { id: "m4", title: "LINE AWARD", date: "2024-10-31", category: "Line Award", color: "tan" },
  // November 2024
  { id: "m5", title: "Spikes Asia", date: "2024-11-14", category: "Spikes Asia", color: "pink" },
  { id: "m6", title: "Clio", date: "2024-11-21", category: "Clio", color: "cyan" },
  // December 2024
  { id: "m7", title: "AdFest", date: "2024-12-05", category: "AdFest", color: "teal" },
  { id: "m8", title: "NYF Early", date: "2024-12-18", category: "New York Festivals", color: "tan" },
  // January 2025
  { id: "m9", title: "AdFest Final", date: "2025-01-15", category: "AdFest", color: "teal" },
  // May 2024 (matches the home mini-calendar widget)
  { id: "m10", title: "Cannes Lion's", date: "2024-05-02", category: "Cannes Lions", color: "cyan" },
  { id: "m11", title: "Spikes Asia", date: "2024-05-24", category: "Spikes Asia", color: "pink" },
  { id: "m12", title: "ADS MAN", date: "2024-05-28", category: "Ads Man", color: "teal" },
  { id: "m13", title: "Line Award", date: "2024-05-31", category: "Line Award", color: "tan" },
];

/** Month the Calendar page opens on so the demo fallback shows content. */
export const DEMO_DEFAULT_MONTH = { year: 2024, month0: 9 }; // October 2024
