import { describe, it, expect } from "vitest";
import { loadConfig } from "@/lib/config";

const valid = {
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

describe("loadConfig", () => {
  it("returns a typed config from valid env", () => {
    const cfg = loadConfig(valid);
    expect(cfg.awardsMailbox).toBe("awards@publicisgroupe.com");
    expect(cfg.azure.tenantId).toBe("t");
  });

  it("throws a clear error when a required var is missing", () => {
    const { AZURE_CLIENT_SECRET, ...partial } = valid;
    expect(() => loadConfig(partial)).toThrow(/AZURE_CLIENT_SECRET/);
  });
});
