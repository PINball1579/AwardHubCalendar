import { notFound } from "next/navigation";
import { AwardDetail } from "@/components/gallery/AwardDetail";
import { AWARD_ENTRIES, getAwardEntry } from "@/lib/mock/awards";

// Next 15+ passes route params asynchronously.
type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return AWARD_ENTRIES.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const entry = getAwardEntry(slug);
  return {
    title: entry ? `${entry.title} — The Cave` : "Award — The Cave",
  };
}

export default async function AwardDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const entry = getAwardEntry(slug);
  if (!entry) notFound();
  return <AwardDetail entry={entry} />;
}
