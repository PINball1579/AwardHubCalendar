"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import type { ReactNode } from "react";

export function SignInGate({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  if (status === "loading") return <p style={{ padding: 24 }}>Loading…</p>;
  if (!session) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Award Hub</h1>
        <p>Sign in with your Publicis account to view the award calendar.</p>
        <button className="button" onClick={() => signIn("azure-ad")}>Sign in with Microsoft</button>
      </div>
    );
  }
  return (
    <div>
      <header style={{ display: "flex", justifyContent: "space-between", padding: "12px 24px", background: "#fff", borderBottom: "1px solid #e3e3ef" }}>
        <strong>Award Hub</strong>
        <span>{session.user?.email} · <button className="button" onClick={() => signOut()}>Sign out</button></span>
      </header>
      {children}
    </div>
  );
}
