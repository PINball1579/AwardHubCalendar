import type { GraphEvent, EventModel, GraphDateTime } from "@/lib/graph/types";

function parseGraphDate(d: GraphDateTime): Date {
  // Graph returns timezone separately. We treat the wall-clock time as the
  // event time and normalize to UTC for storage. Graph all-day/UTC events use
  // "UTC"; for any other zone we append nothing and rely on the offset-less
  // string being interpreted as UTC, which is acceptable for date display.
  const iso = d.dateTime.endsWith("Z") ? d.dateTime : `${d.dateTime}Z`;
  return new Date(iso);
}

export function isRemoved(e: GraphEvent): boolean {
  return Boolean(e["@removed"]);
}

export function graphEventToModel(e: GraphEvent): EventModel {
  return {
    sourceEventId: e.id,
    title: e.subject?.trim() ? e.subject : "(untitled)",
    start: parseGraphDate(e.start),
    end: parseGraphDate(e.end),
    isAllDay: Boolean(e.isAllDay),
    location: e.location?.displayName ?? null,
    description: e.bodyPreview ?? null,
    lastModified: new Date(e.lastModifiedDateTime),
    status: e.isCancelled ? "cancelled" : "active",
  };
}
