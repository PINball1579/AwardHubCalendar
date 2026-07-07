import { notFound } from "next/navigation";
import { AwardDetail } from "@/components/gallery/AwardDetail";
import { AWARD_ENTRIES, getAwardEntry } from "@/lib/mock/awards";

export function generateStaticParams() {
  return AWARD_ENTRIES.map((entry) => ({ slug: entry.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const entry = getAwardEntry(params.slug);
  return {
    title: entry ? `${entry.title} — The Cave` : "Award — The Cave",
  };
}

export default function AwardDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const entry = getAwardEntry(params.slug);
  if (!entry) notFound();
  return <AwardDetail entry={entry} />;
}
