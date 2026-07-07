import Link from "next/link";

export const metadata = {
  title: "Awards Submission — The Cave",
  description: "Submit work for award consideration.",
};

export default function SubmissionPage() {
  return (
    <div className="cave-container py-20">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-block rounded-full border border-ink-600 px-4 py-1 font-normal uppercase leading-normal text-cave-gold text-[12px]">
          Coming soon
        </span>
        <h1 className="mt-5 font-medium uppercase leading-normal text-white text-[34px] sm:text-[60px]">
          Awards Submission
        </h1>
        <p className="mt-4 font-normal leading-relaxed text-white text-[14px] sm:text-[16px]">
          The submission portal lets teams enter work, attach assets, and track
          deadlines across every award show. This experience is in design — in
          the meantime, browse the{" "}
          <Link href="/awards-info" className="text-cave-gold hover:underline">
            Awards Info
          </Link>{" "}
          for entry kits and deadlines, or review past wins in the{" "}
          <Link href="/gallery" className="text-cave-gold hover:underline">
            Gallery
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
