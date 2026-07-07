"use client";

import { useEffect, useState } from "react";

interface Remaining {
  days: number;
  hrs: number;
  min: number;
  sec: number;
}

const DEADLINE_ITEMS = [
  { month: "OCT", day: "24", title: "Technical Innovation Entry", note: "Closing at 23:59 GMT", color: "pink" as const },
  { month: "NOV", day: "02", title: "Leadership Nomination", note: "Open for voting", color: "purple" as const },
];

function diff(target: Date): Remaining {
  const ms = Math.max(0, target.getTime() - Date.now());
  return {
    days: Math.floor(ms / 86_400_000),
    hrs: Math.floor((ms / 3_600_000) % 24),
    min: Math.floor((ms / 60_000) % 60),
    sec: Math.floor((ms / 1000) % 60),
  };
}

interface CountdownPanelProps {
  /** ISO timestamp of the next submission deadline. */
  deadline: string;
}

export function CountdownPanel({ deadline }: CountdownPanelProps) {
  // Start null so the server and the first client render match; the live value
  // (which depends on Date.now()) is only computed after mount to avoid a
  // hydration mismatch.
  const [remaining, setRemaining] = useState<Remaining | null>(null);

  useEffect(() => {
    const update = () => setRemaining(diff(new Date(deadline)));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  const units: [number | undefined, string][] = [
    [remaining?.days, "days"],
    [remaining?.hrs, "hrs"],
    [remaining?.min, "min"],
    [remaining?.sec, "sec"],
  ];

  return (
    <div className="space-y-5">
      <div className="rounded-md border border-cave-golddim px-4 py-3 text-center font-bold leading-normal text-white text-[15px] sm:text-[16px]">
        Countdown to Next Submission Deadline
      </div>

      <div className="flex justify-between px-2">
        {units.map(([value, label]) => (
          <div key={label} className="text-center">
            <div className="font-bold tabular-nums leading-normal text-cave-gold text-[44px] sm:text-[54px]">
              {value === undefined ? "––" : String(value).padStart(2, "0")}
            </div>
            <div className="font-normal leading-normal text-white text-[12px] sm:text-[13px]">
              {label}
            </div>
          </div>
        ))}
      </div>

      <div>
        <h3 className="mb-3 font-bold leading-normal text-white text-[16px]">
          Awards Deadline &amp; Calendar
        </h3>
        <ul className="space-y-2">
          {DEADLINE_ITEMS.map((item) => (
            <li
              key={item.title}
              className="flex items-center gap-3 rounded-md border border-ink-800 bg-ink-900 p-2"
            >
              <div
                className={`flex h-[60px] w-[60px] flex-col items-center justify-center text-white ${
                  item.color === "pink" ? "bg-cave-badgePink" : "bg-cave-badgePurple"
                }`}
              >
                <span className="font-normal leading-normal text-[14px]">
                  {item.month}
                </span>
                <span className="font-bold leading-normal text-[24px]">
                  {item.day}
                </span>
              </div>
              <div>
                <div className="font-normal leading-normal text-white text-[16px]">
                  {item.title}
                </div>
                <div className="font-normal leading-normal text-[10px] text-[#a1a1a1]">
                  {item.note}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
