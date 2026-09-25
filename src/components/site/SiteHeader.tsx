"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLockup } from "./BrandLockup";
import { HeaderAuth } from "./HeaderAuth";

const NAV_LINKS = [
  { href: "/gallery", label: "Gallery" },
  { href: "/calendar", label: "Calendar" },
  { href: "/awards-info", label: "Awards Info" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-ink-800/70 bg-ink-950/85 backdrop-blur">
      <div className="cave-container flex h-16 items-center gap-6">
        <Link
          href="/"
          className="flex shrink-0 items-center"
          onClick={() => setOpen(false)}
        >
          <BrandLockup height={40} tone="gold" />
        </Link>

        {/* desktop nav — Figma: links spread across the width, all white 12px */}
        <nav className="hidden flex-1 items-center justify-evenly md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-[12px] font-normal uppercase leading-normal transition-colors hover:text-cave-gold ${
                isActive(link.href) ? "text-cave-gold" : "text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden md:block">
            <HeaderAuth />
          </div>

          {/* burger */}
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-md border border-ink-700 text-zinc-200 md:hidden"
          >
            <span className="relative block h-3.5 w-5">
              <span
                className={`absolute left-0 top-0 h-0.5 w-5 bg-current transition-transform ${
                  open ? "translate-y-[6px] rotate-45" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-[6px] h-0.5 w-5 bg-current transition-opacity ${
                  open ? "opacity-0" : ""
                }`}
              />
              <span
                className={`absolute bottom-0 left-0 h-0.5 w-5 bg-current transition-transform ${
                  open ? "-translate-y-[6px] -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {/* mobile menu */}
      {open && (
        <nav className="border-t border-ink-800 bg-ink-950 md:hidden">
          <div className="cave-container flex flex-col py-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`border-b border-ink-800/60 py-3 text-[13px] font-normal uppercase leading-normal ${
                  isActive(link.href) ? "text-cave-gold" : "text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4">
              <HeaderAuth />
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
