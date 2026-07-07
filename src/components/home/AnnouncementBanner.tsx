/* eslint-disable @next/next/no-img-element */

/**
 * Homepage ALERT TAB (Figma 262:1504): pink→purple gradient bar, megaphone
 * icon (exported webp), Gotham Medium 24px title, Book 21px message,
 * 42px vertical divider.
 */
export function AnnouncementBanner() {
  return (
    <section className="cave-container py-4">
      <div className="flex flex-col items-start gap-3 rounded-[8px] border-2 border-[#d93d7a] bg-gradient-to-r from-[#d93d7a] to-[#9b69f1] px-6 py-3 sm:flex-row sm:items-center sm:gap-6">
        <div className="flex items-center gap-4">
          <img
            src="/images/announcement-icon.webp"
            alt=""
            className="h-[44px] w-auto sm:h-[58px]"
          />
          <span className="font-medium leading-normal text-white text-[18px] sm:text-[24px]">
            Importance announcement
          </span>
        </div>
        <span className="hidden h-[42px] w-px bg-white sm:block" />
        <span className="font-normal leading-normal text-white text-[15px] sm:text-[21px]">
          Deadline extension for entries until 31 October 2026
        </span>
      </div>
    </section>
  );
}
