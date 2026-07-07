"use client";

import { useMemo, useState } from "react";
import { AwardOrgRow } from "./AwardOrgRow";
import { AWARD_ORGS } from "@/lib/mock/awardOrgs";

const PER_PAGE = 6;

export function AwardsInfoClient() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return AWARD_ORGS;
    return AWARD_ORGS.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        o.description.toLowerCase().includes(q) ||
        o.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, pageCount);
  const rows = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  return (
    <div className="cave-container py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="font-medium uppercase leading-normal text-white text-[34px] sm:text-[60px]">
            Gallery of Merit
          </h1>
          <p className="mt-3 max-w-xl font-medium leading-normal text-white text-[16px] sm:text-[24px]">
            A digital curated exhibition of creative milestones and operational
            excellence across local and global stages.
          </p>
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder="Search award shows…"
          className="h-11 w-full self-center mt-10 rounded-full border border-ink-700 bg-ink-850 px-4 text-sm text-zinc-100 placeholder:text-muted-faint focus:border-cave-gold focus:outline-none md:w-80"
        />
      </div>

      <div className="mt-8">
        {rows.map((org) => (
          <AwardOrgRow key={org.id} org={org} />
        ))}
        {rows.length === 0 && (
          <p className="py-12 text-center text-sm text-muted">
            No award shows match “{query}”.
          </p>
        )}
      </div>

      {pageCount > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2 text-sm">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-2 text-muted hover:text-cave-gold"
            aria-label="Previous page"
          >
            ‹
          </button>
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`h-7 w-7 rounded-full text-xs transition-colors ${
                n === current
                  ? "bg-cave-gold text-white"
                  : "text-muted hover:text-zinc-200"
              }`}
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            className="px-2 text-muted hover:text-cave-gold"
            aria-label="Next page"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
