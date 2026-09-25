import { describe, it, expect } from "vitest";
import {
  assertDemoModeAllowed,
  enabledDemoFlags,
  isDemoMode,
} from "@/lib/demoMode";

const prod = (extra: Record<string, string> = {}) =>
  ({ NODE_ENV: "production", ...extra }) as unknown as NodeJS.ProcessEnv;
const dev = (extra: Record<string, string> = {}) =>
  ({ NODE_ENV: "development", ...extra }) as unknown as NodeJS.ProcessEnv;

describe("demo mode guard", () => {
  it("refuses to start when DEMO_MODE is on in production", () => {
    expect(() => assertDemoModeAllowed(prod({ DEMO_MODE: "true" }))).toThrow(
      /Refusing to start/i,
    );
  });

  it("refuses to start when only the public flag is on in production", () => {
    expect(() =>
      assertDemoModeAllowed(prod({ NEXT_PUBLIC_DEMO_MODE: "true" })),
    ).toThrow(/NEXT_PUBLIC_DEMO_MODE/);
  });

  it("names both flags when both are set", () => {
    expect(() =>
      assertDemoModeAllowed(
        prod({ DEMO_MODE: "true", NEXT_PUBLIC_DEMO_MODE: "true" }),
      ),
    ).toThrow(/DEMO_MODE and NEXT_PUBLIC_DEMO_MODE/);
  });

  it("allows production when the flags are absent or not exactly 'true'", () => {
    expect(() => assertDemoModeAllowed(prod())).not.toThrow();
    expect(() => assertDemoModeAllowed(prod({ DEMO_MODE: "false" }))).not.toThrow();
    expect(() => assertDemoModeAllowed(prod({ DEMO_MODE: "TRUE" }))).not.toThrow();
    expect(() => assertDemoModeAllowed(prod({ DEMO_MODE: "1" }))).not.toThrow();
  });

  it("allows demo mode outside production", () => {
    expect(() => assertDemoModeAllowed(dev({ DEMO_MODE: "true" }))).not.toThrow();
    expect(isDemoMode(dev({ DEMO_MODE: "true" }))).toBe(true);
  });

  it("never reports demo mode as active in production", () => {
    expect(isDemoMode(prod({ DEMO_MODE: "true" }))).toBe(false);
  });

  it("lists which flags are enabled", () => {
    expect(enabledDemoFlags(prod({ DEMO_MODE: "true" }))).toEqual(["DEMO_MODE"]);
    expect(enabledDemoFlags(prod())).toEqual([]);
  });
});
