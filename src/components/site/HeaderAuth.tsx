"use client";

import { useSession, signIn, signOut } from "next-auth/react";

/**
 * Compact account control in the header. Keeps the showcase public while
 * still offering Microsoft sign-in (needed for calendar sync actions).
 */
export function HeaderAuth() {
  const { data: session, status } = useSession();
  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  if (status === "loading") {
    return <span className="text-xs text-muted-faint">…</span>;
  }

  if (!session) {
    return (
      <button
        onClick={() => signIn(demoMode ? "demo" : "azure-ad", { callbackUrl: "/" })}
        className="rounded-full border border-ink-600 px-4 py-1.5 font-normal uppercase leading-normal text-zinc-200 text-[12px] transition-colors hover:border-cave-gold hover:text-cave-gold"
      >
        Sign in
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="hidden text-[12px] text-muted lg:inline">
        {session.user?.email}
      </span>
      <button
        onClick={() => signOut()}
        className="rounded-full border border-ink-600 px-3 py-1.5 font-normal uppercase leading-normal text-zinc-200 text-[12px] transition-colors hover:border-ink-500"
      >
        Sign out
      </button>
    </div>
  );
}
