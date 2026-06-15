interface NotificationItem {
  clientState?: string;
  changeType?: string;
  resourceData?: { id?: string };
}

interface NotificationBody {
  value?: NotificationItem[];
}

export interface ParsedNotification {
  valid: boolean;
  changedIds: string[];
}

export function parseNotification(body: NotificationBody, expectedClientState: string): ParsedNotification {
  const items = body.value ?? [];
  if (items.length === 0) return { valid: false, changedIds: [] };
  const allValid = items.every((i) => i.clientState === expectedClientState);
  if (!allValid) return { valid: false, changedIds: [] };
  const changedIds = items
    .map((i) => i.resourceData?.id)
    .filter((id): id is string => Boolean(id));
  return { valid: true, changedIds };
}
