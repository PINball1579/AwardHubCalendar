import type {
  CalendarGateway,
  DeltaResult,
  CreatedEvent,
} from "@/lib/graph/gateway";
import type { GraphEvent } from "@/lib/graph/types";
import type { GraphEventPayload } from "@/lib/mappers";

interface StoredUserEvent {
  id: string;
  userId: string;
  payload: GraphEventPayload;
}

export class FakeGateway implements CalendarGateway {
  public userEvents: StoredUserEvent[] = [];
  public sourceEvents: GraphEvent[] = [];
  public deltaQueue: GraphEvent[][] = [];
  private seq = 0;

  async getCalendarDelta(_deltaLinkOrNull: string | null): Promise<DeltaResult> {
    const events = this.deltaQueue.shift() ?? [];
    return { events, deltaLink: `delta-${this.seq++}` };
  }

  async listSourceEvents(): Promise<GraphEvent[]> {
    return this.sourceEvents;
  }

  async createUserEvent(userId: string, payload: GraphEventPayload): Promise<CreatedEvent> {
    const id = `evt-${this.seq++}`;
    this.userEvents.push({ id, userId, payload });
    return { id };
  }

  async updateUserEvent(userId: string, eventId: string, payload: GraphEventPayload): Promise<void> {
    const found = this.userEvents.find((e) => e.userId === userId && e.id === eventId);
    if (!found) throw new Error("not found");
    found.payload = payload;
  }

  async deleteUserEvent(userId: string, eventId: string): Promise<void> {
    this.userEvents = this.userEvents.filter((e) => !(e.userId === userId && e.id === eventId));
  }

  async createSubscription(): Promise<{ id: string; expiresAt: string; resource: string }> {
    return { id: `sub-${this.seq++}`, expiresAt: new Date(Date.now() + 3 * 864e5).toISOString(), resource: "events" };
  }

  async renewSubscription(): Promise<{ expiresAt: string }> {
    return { expiresAt: new Date(Date.now() + 3 * 864e5).toISOString() };
  }
}
