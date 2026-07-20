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

export function EntriesTab({ entry }: { entry: AwardEntry }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse">
        <thead>
          <tr className="border-b border-ink-700 text-left font-medium leading-normal text-white text-[13px] sm:text-[14px]">
            <th className="py-2 pr-4 font-medium">Year</th>
            <th className="py-2 pr-4 font-medium">Name</th>
            <th className="py-2 pr-4 font-medium">Category</th>
            <th className="py-2 pr-4 font-medium">Sub-Category</th>
            <th className="py-2 pr-4 font-medium">Awards</th>
            <th className="py-2 pr-4 font-medium">Prize</th>
          </tr>
        </thead>
        <tbody className="font-normal leading-normal text-white text-[13px] sm:text-[14px]">
          {[...entry.entries]
            .sort((a, b) => prizeRank(a.prize) - prizeRank(b.prize))
            .map((row, i) => (
              <tr key={i} className="border-b border-ink-800/70">
                <td className="py-3 pr-4">{row.year}</td>
                <td className="py-3 pr-4">{row.name}</td>
                <td className="py-3 pr-4">{row.category}</td>
                <td className="py-3 pr-4">{row.subCategory}</td>
                <td className="py-3 pr-4">{row.awards}</td>
                <td className="py-3 pr-4">
                  <PrizeChip label={row.prize} size="sm" />
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
}: {
  title: string;
  rows: AwardEntry["companyCredits"];
  headerClass: string;
}) {
  return (
    <div>
      <h3 className="mb-3 font-bold leading-normal text-white text-[18px]">{title}</h3>
      <table className="w-full min-w-[640px] border-collapse">
        <thead>
          <tr className={`text-left font-medium leading-normal text-white text-[13px] sm:text-[14px] ${headerClass}`}>
            <th className="px-3 py-2 font-medium">Company</th>
            <th className="px-3 py-2 font-medium">Location</th>
            <th className="px-3 py-2 font-medium">Role</th>
          </tr>
        </thead>
        <tbody className="font-normal leading-normal text-white text-[13px] sm:text-[14px]">
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-ink-800/70">
              <td className="px-3 py-2.5">{row.company}</td>
              <td className="px-3 py-2.5">{row.location}</td>
              <td className="px-3 py-2.5">{row.role}</td>
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
        />
      )}
      {entry.peopleCredits.length > 0 && (
        <CreditTable
          title="People"
          rows={entry.peopleCredits}
          headerClass="bg-cave-violet"
        />
      )}
    </div>
  );
}
