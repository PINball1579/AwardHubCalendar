import { PrizeChip } from "@/components/ui/PrizeChip";
import { prizeRank } from "@/lib/gallery/prize";
import type { AwardEntry } from "@/lib/mock/types";

function Section({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="font-bold leading-normal text-white text-[18px]">{title}</h3>
      <p className="mt-2 font-normal leading-relaxed text-white text-[14px] sm:text-[16px]">
        {body}
      </p>
    </div>
  );
}

export function OverviewTab({ entry }: { entry: AwardEntry }) {
  return (
    <div className="space-y-7">
      {entry.overview.map((section) => (
        <Section key={section.title} title={section.title} body={section.body} />
      ))}
    </div>
  );
}

/**
 * Column separator, per the Figma entries row: a 1px white rule inset from the
 * row's horizontal rules so it never touches them (Figma leaves ~16px of the
 * 80px row clear at each end). Applied to every column but the first.
 */
const ENTRY_DIVIDER =
  "relative before:absolute before:inset-y-3 before:left-0 before:w-px before:bg-white before:content-['']";

/** Longest prize label that still fits the standard one-line chip. */
const WRAPPED_PRIZE_MAX_LENGTH = 12;

export function EntriesTab({ entry }: { entry: AwardEntry }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse">
        <thead>
          <tr className="border-b-2 border-white text-left font-medium leading-normal text-white text-[13px] sm:text-[14px]">
            <th className="py-2 pr-4 font-medium">Year</th>
            <th className="py-2 pl-4 pr-4 font-medium">Name</th>
            <th className="py-2 pl-4 pr-4 font-medium">Category</th>
            <th className="py-2 pl-4 pr-4 font-medium">Sub-Category</th>
            <th className="py-2 pl-4 pr-4 font-medium">Awards</th>
            <th className="py-2 pl-4 pr-4 text-center font-medium">Trophy</th>
          </tr>
        </thead>
        <tbody className="font-normal leading-normal text-white text-[13px] sm:text-[14px]">
          {[...entry.entries]
            .sort((a, b) => prizeRank(a.prize) - prizeRank(b.prize))
            .map((row, i) => (
              // Figma holds every row at a fixed two-line height (80px at its
              // 16px type) whether the content wraps or not, which is what makes
              // the top alignment read on single-line rows.
              <tr key={i} className="h-16 border-b-2 border-white">
                <td className="py-3 pr-4 align-top">{row.year}</td>
                <td className={`py-3 pl-4 pr-4 align-top ${ENTRY_DIVIDER}`}>{row.name}</td>
                <td className={`py-3 pl-4 pr-4 align-top ${ENTRY_DIVIDER}`}>{row.category}</td>
                <td className={`py-3 pl-4 pr-4 align-top ${ENTRY_DIVIDER}`}>{row.subCategory}</td>
                <td className={`py-3 pl-4 pr-4 align-top ${ENTRY_DIVIDER}`}>{row.awards}</td>
                <td className={`py-3 pl-4 pr-4 text-center align-top ${ENTRY_DIVIDER}`}>
                  <PrizeChip
                    label={row.prize}
                    size="sm"
                    className={`justify-center ${
                      // Figma's chip hugs its label: a fixed 96x24 box on one
                      // line, or — when the label wraps — a box only ~5px wider
                      // than the text with no vertical padding at all.
                      row.prize.length > WRAPPED_PRIZE_MAX_LENGTH
                        ? "max-w-32 px-1.5"
                        : "h-6 w-24"
                    }`}
                  />
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

function CreditTable({
  title,
  rows,
  headerClass,
  columnLabels,
}: {
  title: string;
  rows: AwardEntry["companyCredits"];
  headerClass: string;
  columnLabels: [string, string, string];
}) {
  return (
    <div>
      <h3 className="mb-3 font-bold leading-normal text-white text-[18px]">{title}</h3>
      <table className="w-full min-w-[640px] table-fixed border-collapse">
        <thead>
          <tr className={`text-left font-medium leading-normal text-white text-[13px] sm:text-[14px] ${headerClass}`}>
            <th className="w-1/3 px-3 py-2 font-medium">{columnLabels[0]}</th>
            <th className="w-1/3 px-3 py-2 font-medium">{columnLabels[1]}</th>
            <th className="w-1/3 px-3 py-2 font-medium">{columnLabels[2]}</th>
          </tr>
        </thead>
        <tbody className="font-normal leading-normal text-white text-[13px] sm:text-[14px]">
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-ink-800/70">
              <td className="w-1/3 px-3 py-2.5">{row.company}</td>
              <td className="w-1/3 px-3 py-2.5">{row.location}</td>
              <td className="w-1/3 px-3 py-2.5">{row.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CreditsTab({ entry }: { entry: AwardEntry }) {
  return (
    <div className="space-y-8 overflow-x-auto">
      {entry.companyCredits.length > 0 && (
        <CreditTable
          title="Company"
          rows={entry.companyCredits}
          headerClass="bg-cave-magenta"
          columnLabels={["Company", "Location", "Role"]}
        />
      )}
      {entry.peopleCredits.length > 0 && (
        <CreditTable
          title="People"
          rows={entry.peopleCredits}
          headerClass="bg-cave-violet"
          columnLabels={["Name", "Company", "Role"]}
        />
      )}
    </div>
  );
}
