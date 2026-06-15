export interface SubRecord {
  id: string;
  userId: string;
  userEmail: string;
  sourceEventId: string;
  copiedEventId: string | null;
  state: "pending" | "synced" | "failed" | "removed";
}

export interface SubscriptionStore {
  findBySourceEvent(sourceEventId: string): Promise<SubRecord[]>;
  setCopiedEvent(id: string, copiedEventId: string): Promise<void>;
  setState(id: string, state: SubRecord["state"], error?: string): Promise<void>;
}
