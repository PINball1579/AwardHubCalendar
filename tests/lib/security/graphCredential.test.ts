import { describe, it, expect } from "vitest";
import { loadConfig } from "@/lib/config";

const base = {
  DATABASE_URL: "postgresql://localhost/db",
  AZURE_TENANT_ID: "t",
  AZURE_CLIENT_ID: "c",
  AZURE_CLIENT_SECRET: "s",
  AWARDS_MAILBOX: "awards@publicisgroupe.com",
  NEXTAUTH_URL: "http://localhost:3000",
  NEXTAUTH_SECRET: "secret",
  PUBLIC_BASE_URL: "http://localhost:3000",
  GRAPH_NOTIFICATION_CLIENT_STATE: "state",
};

describe("Graph credential configuration", () => {
  it("defaults to client secret for backwards compatibility", () => {
    expect(loadConfig(base).azure.graphCredential).toBe("secret");
  });

  it("accepts managed identity, with an optional user-assigned client id", () => {
    const cfg = loadConfig({
      ...base,
      GRAPH_CREDENTIAL: "managed-identity",
      GRAPH_MANAGED_IDENTITY_CLIENT_ID: "mi-1",
    });
    expect(cfg.azure.graphCredential).toBe("managed-identity");
    expect(cfg.azure.managedIdentityClientId).toBe("mi-1");
  });

  it("accepts a certificate when a path is supplied", () => {
    const cfg = loadConfig({
      ...base,
      GRAPH_CREDENTIAL: "certificate",
      GRAPH_CLIENT_CERTIFICATE_PATH: "/run/secrets/graph.pem",
    });
    expect(cfg.azure.certificatePath).toBe("/run/secrets/graph.pem");
  });

  it("rejects certificate mode without a certificate path", () => {
    expect(() =>
      loadConfig({ ...base, GRAPH_CREDENTIAL: "certificate" }),
    ).toThrow(/GRAPH_CLIENT_CERTIFICATE_PATH/);
  });

  it("rejects an unknown credential kind", () => {
    expect(() => loadConfig({ ...base, GRAPH_CREDENTIAL: "password" })).toThrow(
      /GRAPH_CREDENTIAL/,
    );
  });
});
