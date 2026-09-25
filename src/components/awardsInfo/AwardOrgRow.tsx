/* eslint-disable @next/next/no-img-element */
import type { AwardOrg } from "@/lib/mock/types";

interface AwardOrgRowProps {
  org: AwardOrg;
}

/** Shared Box folder that every "Download Entry Kit" button opens. */
const ENTRY_KIT_URL =
  "https://lion.app.box.com/s/9v2wia37j8qocm58srbxwn1nv28zs8iy";

/** Scope badge colors, verbatim from the Figma "BADGE / GLOBAL" component fills. */
const SCOPE_CHIP_CLASS: Record<string, string> = {
  global: "bg-cave-golddim text-white",
  regional: "bg-cave-badgePink text-white",
  local: "bg-chip-cyan text-white",
  platform: "bg-chip-teal text-white",
};

function scopeChipClass(scope: string): string {
  return SCOPE_CHIP_CLASS[scope.toLowerCase()] ?? "bg-cave-golddim text-white";
}

export function AwardOrgRow({ org }: AwardOrgRowProps) {
  return (
    <article className="grid grid-cols-1 gap-5 border-b border-ink-800 py-6 md:grid-cols-[160px_1fr] lg:grid-cols-[192px_308px_minmax(0,1fr)] lg:gap-8">
      {/* logo tile (white field, gold border per Figma) */}
      <div
        className="flex h-[180px] w-full items-center justify-center overflow-hidden border border-cave-golddim md:w-[160px] lg:w-[192px]"
        style={{ background: org.logoBg ?? "#ffffff" }}
      >
        {org.logo ? (
          <img
            src={org.logo}
            alt={`${org.name} logo`}
            className={`h-full w-full ${org.logoBleed ? "object-cover" : "object-contain p-2"}`}
          />
        ) : (
          <span className="px-3 text-center font-medium uppercase leading-tight text-[#cdb069] text-[13px]">
            {org.name}
          </span>
        )}
      </div>

      <div className="flex flex-col items-start gap-4">
        <span
          className={`inline-flex h-6 w-[84px] items-center justify-center px-2 font-medium leading-normal text-[12px] ${scopeChipClass(org.scope)}`}
        >
          {org.scope}
        </span>
        <h3 className="font-medium leading-normal text-white text-[24px] lg:text-[32px] lg:leading-[35px]">
          {org.name}
        </h3>
        <p className="font-light uppercase leading-normal text-white text-[14px] lg:text-[16px]">
          Deadline : {org.deadline}
        </p>
      </div>

      <div className="flex flex-col items-start gap-4">
        <p className="text-justify font-medium leading-[18px] text-white text-[12px]">
          {org.description}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {org.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex h-6 w-[84px] items-center justify-center px-2 text-center font-medium leading-normal text-white text-[10px] bg-chip-tagGray"
            >
              {tag}
            </span>
          ))}
        </div>
        <a
          href={ENTRY_KIT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-9 w-[192px] items-center justify-center gap-2 rounded-[4px] border border-cave-golddim font-medium leading-normal text-white text-[14px] transition-colors hover:border-cave-gold hover:text-cave-gold"
        >
          Download Entry Kit
          <img
            src="/images/download-icon.svg"
            alt=""
            aria-hidden="true"
            className="h-4 w-4"
          />
        </a>
      </div>
    </article>
  );
}
