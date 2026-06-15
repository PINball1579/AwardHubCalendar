import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().min(1),
  AZURE_TENANT_ID: z.string().min(1),
  AZURE_CLIENT_ID: z.string().min(1),
  AZURE_CLIENT_SECRET: z.string().min(1),
  AWARDS_MAILBOX: z.string().email(),
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(1),
  PUBLIC_BASE_URL: z.string().url(),
  GRAPH_NOTIFICATION_CLIENT_STATE: z.string().min(1),
});

export type AppConfig = {
  databaseUrl: string;
  awardsMailbox: string;
  nextAuth: { url: string; secret: string };
  publicBaseUrl: string;
  graphNotificationClientState: string;
  azure: { tenantId: string; clientId: string; clientSecret: string };
};

export function loadConfig(env: Record<string, string | undefined>): AppConfig {
  const parsed = schema.safeParse(env);
  if (!parsed.success) {
    const missing = parsed.error.issues
      .map((i) => i.path.join("."))
      .join(", ");
    throw new Error(`Invalid or missing environment variables: ${missing}`);
  }
  const e = parsed.data;
  return {
    databaseUrl: e.DATABASE_URL,
    awardsMailbox: e.AWARDS_MAILBOX,
    nextAuth: { url: e.NEXTAUTH_URL, secret: e.NEXTAUTH_SECRET },
    publicBaseUrl: e.PUBLIC_BASE_URL,
    graphNotificationClientState: e.GRAPH_NOTIFICATION_CLIENT_STATE,
    azure: {
      tenantId: e.AZURE_TENANT_ID,
      clientId: e.AZURE_CLIENT_ID,
      clientSecret: e.AZURE_CLIENT_SECRET,
    },
  };
}

let cached: AppConfig | null = null;
export function getConfig(): AppConfig {
  if (!cached) cached = loadConfig(process.env);
  return cached;
}
