import { Hero } from "@/components/home/Hero";
import { FeaturedCarousel } from "@/components/home/FeaturedCarousel";
import { AnnouncementBanner } from "@/components/home/AnnouncementBanner";
import { CountdownPanel } from "@/components/home/CountdownPanel";
import { MiniCalendar } from "@/components/home/MiniCalendar";

export default function HomePage() {
  return (
    <div className="pb-16">
      <Hero />
      <FeaturedCarousel />
      <AnnouncementBanner />
      <section className="cave-container grid gap-8 py-8 lg:grid-cols-[400px_1fr]">
        <CountdownPanel deadline="2026-10-31T23:59:00Z" />
        <MiniCalendar />
      </section>
    </div>
  );
}
