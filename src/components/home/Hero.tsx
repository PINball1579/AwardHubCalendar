/* eslint-disable @next/next/no-img-element */
import { HeroWordmark } from "@/components/site/HeroWordmark";

export function Hero() {
  return (
    <section className="relative overflow-hidden mb-4">
      {/* real cinematic cave backdrop */}
      <img
        src="/images/hero-cave.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-hero-fade" />

      {/* Figma: the headline block sits on the LEFT half of the page
          (x≈135–839 of 1440) with the lion photo on the right; text is
          centered within the block. */}
      <div className="cave-container relative py-20 sm:py-28">
        <div className="flex max-w-[704px] flex-col items-center text-center sm:pl-[55px]">
          <p className="font-light uppercase leading-normal text-white text-[26px] sm:text-[36px]">
            Welcome
          </p>

          <div className="mt-5">
            <HeroWordmark width={330} className="sm:hidden" />
            <HeroWordmark width={600} className="hidden sm:block" />
          </div>

          <p className="mt-7 max-w-3xl font-medium uppercase leading-normal text-white text-[26px] sm:text-[41px]">
            Home of the lion&apos;s most treasured awards.
          </p>
          <p className="mt-4 max-w-2xl font-normal uppercase leading-normal text-white text-[13px] sm:text-[18px]">
            Where every award finds its home. Track submissions, deadlines, and
            wins across all Publicis Groupe Thailand houses.
          </p>
        </div>
      </div>
    </section>
  );
}
