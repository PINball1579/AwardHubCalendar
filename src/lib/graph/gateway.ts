import type { GraphEvent } from "@/lib/graph/types";
import type { GraphEventPayload } from "@/lib/mappers";
export type { GraphEventPayload } from "@/lib/mappers";

export interface DeltaResult {
  events: GraphEvent[];
  deltaLink: string;
}

export interface CreatedEvent {
  id: string;
}

export interface CalendarGateway {
  /** Read changes from the awards@ mailbox since the given deltaLink (or initial). */
  getCalendarDelta(deltaLinkOrNull: string | null): Promise<DeltaResult>;

  /** List current source events (used for the website calendar view fallback). */
  listSourceEvents(startISO: string, endISO: string): Promise<GraphEvent[]>;

  /** Create an event in a specific user's default calendar. Returns its id. */
  createUserEvent(userId: string, payload: GraphEventPayload): Promise<CreatedEvent>;

  /** Update an existing event in a user's calendar. */
  updateUserEvent(userId: string, eventId: string, payload: GraphEventPayload): Promise<void>;

  /** Delete an event from a user's calendar. Ignores 404. */
  deleteUserEvent(userId: string, eventId: string): Promise<void>;

  /** Create a Graph change-notification subscription for the awards@ events. */
  createSubscription(notificationUrl: string, clientState: string): Promise<{ id: string; expiresAt: string; resource: string }>;

  /** Renew an existing subscription's expiry. */
  renewSubscription(subscriptionId: string): Promise<{ expiresAt: string }>;
}
