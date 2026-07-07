/* eslint-disable @next/next/no-img-element */
import type { AwardOrg } from "@/lib/mock/types";

interface AwardOrgRowProps {
  org: AwardOrg;
}

/** Scope chip colors per Figma (Regional is pink; others follow the palette). */
const SCOPE_CHIP_CLASS: Record<string, string> = {
  global: "bg-cave-gold text-ink-950",
  regional: "bg-chip-pink text-white",
  local: "bg-chip-cyan text-white",
  platform: "bg-chip-teal text-white",
};

function scopeChipClass(scope: string): string {
  return SCOPE_CHIP_CLASS[scope.toLowerCase()] ?? "bg-cave-gold text-ink-950";
}

export function AwardOrgRow({ org }: AwardOrgRowProps) {
  return (
    <article className="grid grid-cols-1 gap-5 border-b border-ink-800 py-6 md:grid-cols-[160px_1fr] lg:grid-cols-[160px_minmax(0,1.1fr)_minmax(0,1fr)]">
      {/* logo tile (white field, gold border per Figma) */}
      <div
        className="flex h-[150px] w-full items-center justify-center overflow-hidden rounded-sm border border-cave-golddim md:w-[160px]"
        style={{ background: org.logoBg ?? "#ffffff" }}
      >
        {org.logo ? (
          <img
            src={org.logo}
            alt={`${org.name} logo`}
            className="h-full w-full object-contain p-2"
          />
        ) : (
          <span className="px-3 text-center font-medium uppercase leading-tight text-[#cdb069] text-[13px]">
            {org.name}
          </span>
        )}
      </div>

      <div>
        <span
          className={`inline-block rounded-sm px-2 py-0.5 font-normal uppercase leading-normal text-[12px] ${scopeChipClass(org.scope)}`}
        >
          {org.scope}
        </span>
        <h3 className="mt-1.5 font-medium leading-normal text-white text-[20px] sm:text-[24px]">
          {org.name}
        </h3>
        <p className="mt-1 font-normal uppercase leading-normal text-white text-[13px] sm:text-[14px]">
          Deadline : {org.deadline}
        </p>
      </div>

      <div className="lg:max-w-md">
        <p className="font-normal leading-relaxed text-white text-[13px] sm:text-[14px]">
          {org.description}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {org.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-sm border border-ink-700 bg-ink-850 px-2.5 py-1 font-normal leading-normal text-zinc-300 text-[13px]"
            >
              {tag}
            </span>
          ))}
        </div>
        <a
          href={org.entryKitUrl}
          className="mt-3 inline-flex items-center gap-2 rounded-md border border-ink-600 bg-ink-850 px-3 py-1.5 font-normal leading-normal text-zinc-100 text-[13px] transition-colors hover:border-cave-gold hover:text-cave-gold"
        >
          Download Entry Kit
          <span aria-hidden="true">⤓</span>
        </a>
      </div>
    </article>
  );
}
