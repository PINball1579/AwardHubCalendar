import { z } from "zod";
import { assertDemoModeAllowed } from "@/lib/demoMode";

/**
 * How the app authenticates to Microsoft Graph for application-permission
 * calls. Prefer "managed-identity" (no secret material at all) or
 * "certificate" over a long-lived client secret. Note this is separate from
 * user sign-in, which always uses the app registration's client secret.
 */
const graphCredentialSchema = z
  .enum(["secret", "certificate", "managed-identity"])
  .default("secret");

const schema = z
  .object({
    DATABASE_URL: z.string().min(1),
    AZURE_TENANT_ID: z.string().min(1),
    AZURE_CLIENT_ID: z.string().min(1),
    AZURE_CLIENT_SECRET: z.string().min(1),
    AWARDS_MAILBOX: z.string().email(),
    NEXTAUTH_URL: z.string().url(),
    NEXTAUTH_SECRET: z.string().min(1),
    PUBLIC_BASE_URL: z.string().url(),
    GRAPH_NOTIFICATION_CLIENT_STATE: z.string().min(1),
    GRAPH_CREDENTIAL: graphCredentialSchema,
    GRAPH_CLIENT_CERTIFICATE_PATH: z.string().min(1).optional(),
    GRAPH_MANAGED_IDENTITY_CLIENT_ID: z.string().min(1).optional(),
    // Object id of the mail-enabled security group that scopes both Graph
    // access and who may use the site. Unset = any tenant user who can sign in.
    ACCESS_GROUP_ID: z.string().min(1).optional(),
  })
  .superRefine((env, ctx) => {
    if (env.GRAPH_CREDENTIAL === "certificate" && !env.GRAPH_CLIENT_CERTIFICATE_PATH) {
      ctx.addIssue({
        code: "custom",
        path: ["GRAPH_CLIENT_CERTIFICATE_PATH"],
        message: "required when GRAPH_CREDENTIAL=certificate",
      });
    }
  });

export type GraphCredentialKind = "secret" | "certificate" | "managed-identity";

export type AppConfig = {
  databaseUrl: string;
  awardsMailbox: string;
  nextAuth: { url: string; secret: string };
  publicBaseUrl: string;
  graphNotificationClientState: string;
  /** When set, sign-in requires membership of this group. */
  accessGroupId?: string;
  azure: {
    tenantId: string;
    clientId: string;
    clientSecret: string;
    graphCredential: GraphCredentialKind;
    certificatePath?: string;
    managedIdentityClientId?: string;
  };
};

export function loadConfig(env: Record<string, string | undefined>): AppConfig {
  // Refuse to hand out config to a production process running in demo mode.
  assertDemoModeAllowed(env as NodeJS.ProcessEnv);

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
    accessGroupId: e.ACCESS_GROUP_ID,
    azure: {
      tenantId: e.AZURE_TENANT_ID,
      clientId: e.AZURE_CLIENT_ID,
      clientSecret: e.AZURE_CLIENT_SECRET,
      graphCredential: e.GRAPH_CREDENTIAL,
      certificatePath: e.GRAPH_CLIENT_CERTIFICATE_PATH,
      managedIdentityClientId: e.GRAPH_MANAGED_IDENTITY_CLIENT_ID,
    },
  };
}

let cached: AppConfig | null = null;
export function getConfig(): AppConfig {
  if (!cached) cached = loadConfig(process.env);
  return cached;
}
