// Minimal shape of a Microsoft Graph calendar event we depend on.
export interface GraphDateTime {
  dateTime: string; // e.g. "2026-06-12T00:00:00.0000000"
  timeZone: string; // e.g. "UTC"
}

export interface GraphEvent {
  id: string;
  subject?: string | null;
  isAllDay?: boolean | null;
  isCancelled?: boolean | null;
  start: GraphDateTime;
  end: GraphDateTime;
  location?: { displayName?: string | null } | null;
  bodyPreview?: string | null;
  lastModifiedDateTime: string;
  "@removed"?: { reason: string };
}

// Our internal, storage-friendly representation.
export interface EventModel {
  sourceEventId: string;
  title: string;
  start: Date;
  end: Date;
  isAllDay: boolean;
  location: string | null;
  description: string | null;
  lastModified: Date;
  status: "active" | "cancelled";
}
