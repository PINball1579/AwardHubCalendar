/**
 * Demo mode replaces Microsoft sign-in with a passwordless account and swaps
 * the real Graph gateway for an in-memory fake. That is fine on a laptop and a
 * critical authentication bypass anywhere else, so production must refuse to
 * start while either flag is set.
 *
 * Both flags are checked: DEMO_MODE drives the server (auth provider, gateway)
 * and NEXT_PUBLIC_DEMO_MODE is inlined into the client bundle.
 */

export const DEMO_FLAGS = ["DEMO_MODE", "NEXT_PUBLIC_DEMO_MODE"] as const;

function isProduction(env: NodeJS.ProcessEnv): boolean {
  return env.NODE_ENV === "production";
}

/** Flags that are switched on in the given environment. */
export function enabledDemoFlags(env: NodeJS.ProcessEnv): string[] {
  return DEMO_FLAGS.filter((flag) => env[flag] === "true");
}

/**
 * Throws when a demo flag is enabled in a production build. Called during
 * config load, from next.config.mjs at startup, and before the demo auth
 * provider is registered.
 */
export function assertDemoModeAllowed(env: NodeJS.ProcessEnv = process.env): void {
  if (!isProduction(env)) return;
  const enabled = enabledDemoFlags(env);
  if (enabled.length === 0) return;
  throw new Error(
    `Refusing to start: ${enabled.join(" and ")} enabled with NODE_ENV=production. ` +
      `Demo mode allows passwordless sign-in and must never run outside local development. ` +
      `Unset ${enabled.join(" and ")} (see .env.example) and redeploy.`
  );
}

/**
 * True only when demo mode is both requested and permitted. Never returns true
 * in production — callers get real auth and the real Graph gateway instead.
 */
export function isDemoMode(env: NodeJS.ProcessEnv = process.env): boolean {
  if (isProduction(env)) return false;
  return env.DEMO_MODE === "true";
}
