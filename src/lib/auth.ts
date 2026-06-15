import type { NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import CredentialsProvider from "next-auth/providers/credentials";
import { getConfig } from "@/lib/config";

interface EntraProfile {
  oid?: string;
  email?: string;
  preferred_username?: string;
}

interface AuthUser {
  id?: string;
  email?: string | null;
}

export const authCallbacks = {
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

  if (process.env.DEMO_MODE === "true") {
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
