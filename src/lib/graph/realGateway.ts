import type { Client } from "@microsoft/microsoft-graph-client";
import type {
  CalendarGateway,
  DeltaResult,
  CreatedEvent,
} from "@/lib/graph/gateway";
import type { GraphEvent } from "@/lib/graph/types";
import type { GraphEventPayload } from "@/lib/mappers";
import { getConfig } from "@/lib/config";

const SUBSCRIPTION_TTL_MS = 3 * 24 * 60 * 60 * 1000 - 60_000; // ~3 days minus buffer

export class RealGateway implements CalendarGateway {
  constructor(private client: Client) {}

  private mailbox(): string {
    return getConfig().awardsMailbox;
  }

  async getCalendarDelta(deltaLinkOrNull: string | null): Promise<DeltaResult> {
    const start = new Date();
    const end = new Date(Date.now() + 365 * 864e5);
    const initial =
      `/users/${this.mailbox()}/calendarView/delta` +
      `?startDateTime=${start.toISOString()}&endDateTime=${end.toISOString()}`;
    let page = await this.client.api(deltaLinkOrNull ?? initial).get();
    const events: GraphEvent[] = [];
    while (true) {
      events.push(...(page.value as GraphEvent[]));
      if (page["@odata.nextLink"]) {
        page = await this.client.api(page["@odata.nextLink"]).get();
      } else {
        return { events, deltaLink: page["@odata.deltaLink"] };
      }
    }
  }

  async listSourceEvents(startISO: string, endISO: string): Promise<GraphEvent[]> {
    const res = await this.client
      .api(`/users/${this.mailbox()}/calendarView`)
      .query({ startDateTime: startISO, endDateTime: endISO })
      .top(500)
      .get();
    return res.value as GraphEvent[];
  }

  async createUserEvent(userId: string, payload: GraphEventPayload): Promise<CreatedEvent> {
    const res = await this.client.api(`/users/${userId}/events`).post(payload);
    return { id: res.id as string };
  }

  async updateUserEvent(userId: string, eventId: string, payload: GraphEventPayload): Promise<void> {
    await this.client.api(`/users/${userId}/events/${eventId}`).patch(payload);
  }

  async deleteUserEvent(userId: string, eventId: string): Promise<void> {
    try {
      await this.client.api(`/users/${userId}/events/${eventId}`).delete();
    } catch (err: unknown) {
      if ((err as { statusCode?: number }).statusCode !== 404) throw err;
    }
  }

  async createSubscription(notificationUrl: string, clientState: string) {
    const expiry = new Date(Date.now() + SUBSCRIPTION_TTL_MS).toISOString();
    const resource = `/users/${this.mailbox()}/events`;
    const res = await this.client.api("/subscriptions").post({
      changeType: "created,updated,deleted",
      notificationUrl,
      resource,
      expirationDateTime: expiry,
      clientState,
    });
    return { id: res.id as string, expiresAt: res.expirationDateTime as string, resource };
  }

  async renewSubscription(subscriptionId: string) {
    const expiry = new Date(Date.now() + SUBSCRIPTION_TTL_MS).toISOString();
    const res = await this.client.api(`/subscriptions/${subscriptionId}`).patch({
      expirationDateTime: expiry,
    });
    return { expiresAt: res.expirationDateTime as string };
  }
}
