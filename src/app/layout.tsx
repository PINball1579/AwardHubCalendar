import "./globals.css";
import type { ReactNode } from "react";
import { Montserrat } from "next/font/google";
import { Providers } from "./providers";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

/**
 * The Figma design uses Gotham (Light / Book / Medium / Bold). Gotham is a
 * proprietary typeface, so we substitute Montserrat — the standard free
 * geometric-sans match — across the same weights. To use licensed Gotham,
 * replace this with a localFont() pointing at the Gotham web-font files;
 * the rest of the styles (sizes/weights) already map 1:1.
 */
const gotham = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata = {
  title: "The Cave — Publicis Groupe Awards",
  description:
    "Home of the lion's most treasured awards. Track submissions, deadlines, and wins across Publicis Groupe Thailand.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={gotham.variable}>
      <body className="min-h-screen bg-ink-950 text-zinc-100">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}
