import type { NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import { getConfig } from "@/lib/config";

interface EntraProfile {
  oid?: string;
  email?: string;
  preferred_username?: string;
}

export const authCallbacks = {
  async jwt({
    token,
    profile,
  }: {
    token: Record<string, unknown>;
    profile?: EntraProfile;
  }) {
    if (profile) {
      token.oid = profile.oid;
      token.email = profile.email ?? profile.preferred_username;
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
  return {
    providers: [
      AzureADProvider({
        clientId: cfg.azure.clientId,
        clientSecret: cfg.azure.clientSecret,
        tenantId: cfg.azure.tenantId,
        authorization: { params: { scope: "openid profile email" } },
      }),
    ],
    session: { strategy: "jwt" },
    secret: cfg.nextAuth.secret,
    callbacks: authCallbacks as unknown as NextAuthOptions["callbacks"],
  };
}
