"use client";

import { useLayoutEffect, useRef } from "react";

interface FitTextProps {
  text: string;
  /** starting (largest) font size in px */
  maxPx: number;
  /** smallest allowed font size in px */
  minPx: number;
  /** classes must give the element a fixed height for fitting to work */
  className?: string;
}

/**
 * Renders text at `maxPx` and shrinks it until the full string fits inside
 * the element's fixed-height box — no truncation, no clipping.
 */
export function FitText({ text, maxPx, minPx, className = "" }: FitTextProps) {
  const ref = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fit = () => {
      let size = maxPx;
      el.style.fontSize = `${size}px`;
      while (size > minPx && el.scrollHeight > el.clientHeight) {
        size -= 1;
        el.style.fontSize = `${size}px`;
      }
    };

    fit();
    // refit when the card width changes (responsive grid)
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text, maxPx, minPx]);

  return (
    <h3 ref={ref} className={className} style={{ fontSize: minPx }}>
      {text}
    </h3>
  );
}
