/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { FitText } from "@/components/ui/FitText";
import type { AwardEntry } from "@/lib/mock/types";

interface EntryCardProps {
  entry: AwardEntry;
}

export function EntryCard({ entry }: EntryCardProps) {
  return (
    <Link href={`/gallery/${entry.slug}`} className="group flex h-full flex-col">
      {/* fixed-ratio still — the campaign image carries its own stat overlay */}
      <div className="relative aspect-[4/3] shrink-0 overflow-hidden rounded-sm ring-1 ring-ink-800 transition-all group-hover:ring-cave-gold/60">
        <img
          src={entry.image}
          alt={entry.title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <p className="mt-2 truncate font-normal leading-normal text-white text-[14px] sm:text-[16px]">
        {entry.agency}
      </p>

      {/* fixed-height title slot; the full name always shows, shrinking to fit */}
      <FitText
        text={entry.title}
        maxPx={36}
        minPx={13}
        className="h-[52px] overflow-hidden font-normal leading-tight text-white group-hover:text-cave-gold sm:h-[76px]"
      />

      {/* always pinned to the bottom of the box (Figma) */}
      <p className="mt-auto pt-1 font-normal leading-normal text-white text-[14px] sm:text-[16px]">
        {entry.year}, {entry.client}
      </p>
    </Link>
  );
}
