import type { NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import CredentialsProvider from "next-auth/providers/credentials";
import { getConfig } from "@/lib/config";
import { assertDemoModeAllowed, isDemoMode } from "@/lib/demoMode";

interface EntraProfile {
  oid?: string;
  email?: string;
  preferred_username?: string;
  /** Group object ids, present when the "groups" optional claim is configured. */
  groups?: string[];
  /** Entra sets these instead of `groups` when the claim would overflow the token. */
  _claim_names?: Record<string, string>;
  _claim_sources?: Record<string, unknown>;
}

export type AccessDecision =
  | { allowed: true }
  | { allowed: false; reason: "not-a-member" | "claim-missing" | "claim-overage" };

/**
 * Authorisation, as distinct from authentication: Entra proves who the user is,
 * this decides whether they may use Award Hub at all.
 *
 * Gated on the same mail-enabled security group that scopes the Graph service
 * principal, so one membership list controls both mailbox access and site
 * access. With no group configured, any tenant user who can sign in is allowed
 * (the previous behaviour).
 *
 * Fails closed: if the group is configured but the token carries no usable
 * `groups` claim, access is denied rather than silently granted. That means the
 * "groups" optional claim MUST be enabled on the app registration — see
 * SECURITY.md.
 */
export function decideAccess(
  profile: EntraProfile | undefined,
  requiredGroupId: string | undefined,
): AccessDecision {
  if (!requiredGroupId) return { allowed: true };
  if (!profile) return { allowed: false, reason: "claim-missing" };

  if (Array.isArray(profile.groups)) {
    return profile.groups.includes(requiredGroupId)
      ? { allowed: true }
      : { allowed: false, reason: "not-a-member" };
  }

  // Too many groups to fit in the token; Entra points at Graph instead. Restrict
  // the optional claim to groups assigned to the application to avoid this.
  if (profile._claim_names?.groups) {
    return { allowed: false, reason: "claim-overage" };
  }

  return { allowed: false, reason: "claim-missing" };
}

const ACCESS_DENIED_LOG: Record<
  Exclude<AccessDecision, { allowed: true }>["reason"],
  string
> = {
  "not-a-member": "user is not a member of ACCESS_GROUP_ID",
  "claim-missing":
    "no 'groups' claim on the token — enable the groups optional claim on the app registration, or unset ACCESS_GROUP_ID",
  "claim-overage":
    "'groups' claim overflowed the token — restrict the optional claim to groups assigned to this application",
};

interface AuthUser {
  id?: string;
  email?: string | null;
}

export const authCallbacks = {
  async signIn({ profile }: { profile?: EntraProfile }) {
    // Demo mode issues a credentials user with no profile; it is dev-only and
    // already blocked in production by assertDemoModeAllowed().
    if (isDemoMode()) return true;

    const decision = decideAccess(profile, getConfig().accessGroupId);
    if (!decision.allowed) {
      console.warn("[auth] sign-in denied:", ACCESS_DENIED_LOG[decision.reason]);
      return false;
    }
    return true;
  },
  async jwt({
    token,
    profile,
    user,
  }: {
    token: Record<string, unknown>;
    profile?: EntraProfile;
    user?: AuthUser;
  }) {
    if (profile) {
      token.oid = profile.oid;
      token.email = profile.email ?? profile.preferred_username;
    } else if (user) {
      token.oid = user.id;
      token.email = user.email;
    }
    return token;
  },
  async session({
    session,
    token,
  }: {
    session: { user?: Record<string, unknown> };
    token: Record<string, unknown>;
  }) {
    if (session.user) {
      session.user.id = token.oid as string;
      session.user.email = token.email as string;
    }
    return session;
  },
};

export function buildAuthOptions(): NextAuthOptions {
  const cfg = getConfig();
  const providers: NextAuthOptions["providers"] = [
    AzureADProvider({
      clientId: cfg.azure.clientId,
      clientSecret: cfg.azure.clientSecret,
      tenantId: cfg.azure.tenantId,
      authorization: { params: { scope: "openid profile email" } },
    }),
  ];

  // Hard stop first: a production build must never reach this branch.
  assertDemoModeAllowed();

  if (isDemoMode()) {
    providers.push(
      CredentialsProvider({
        id: "demo",
        name: "Demo",
        credentials: {},
        async authorize() {
          return {
            id: "demo-user-oid",
            email: "demo.user@publicisgroupe.com",
            name: "Demo User",
          };
        },
      }),
    );
  }

  return {
    providers,
    session: { strategy: "jwt" },
    secret: cfg.nextAuth.secret,
    callbacks: authCallbacks as unknown as NextAuthOptions["callbacks"],
  };
}
