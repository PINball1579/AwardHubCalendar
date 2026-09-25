/* eslint-disable @next/next/no-img-element */

/**
 * Hero "THE CAVE" lockup (Figma node 262:1542 "THE CAVE W 1", 664×206).
 * Each alphabet letter is an individually exported Figma vector under
 * /images/brand/letters, positioned with the exact frame coordinates.
 */

interface Piece {
  src: string;
  /** x / y / w / h inside the 664×206 Figma frame */
  x: number;
  y: number;
  w: number;
  h: number;
  /** true for the "THE CAVE" letters (they carry the drop shadow) */
  text?: boolean;
}

const FRAME = { w: 664, h: 206 };

/** Figma drop shadow on the wordmark text (filter0_d): 7/7 offset, 5 blur, black 0.75. */
const SHADOW = { dx: 7, dy: 7, blur: 5, color: "rgba(0,0,0,0.75)" };

const PIECES: Piece[] = [
  // lion mark
  { src: "/images/brand/letters/lion-a.svg", x: 38.58, y: 47.46, w: 137.15, h: 122.31 },
  { src: "/images/brand/letters/lion-b.svg", x: 106.97, y: 47.46, w: 68.76, h: 122.31 },
  { src: "/images/brand/letters/lion-c.svg", x: 68.13, y: 45.84, w: 28.54, h: 12.01 },
  { src: "/images/brand/letters/lion-d.svg", x: 117.66, y: 45.28, w: 28.55, h: 12.01 },
  // small ornament above the mane
  { src: "/images/brand/letters/ornament.svg", x: 77.01, y: 37.88, w: 60.18, h: 20.02 },
  // T H E  C A V E — one exported vector per letter (with drop shadow)
  { src: "/images/brand/letters/t.svg", x: 196.7, y: 78.56, w: 47.65, h: 58.81, text: true },
  { src: "/images/brand/letters/h.svg", x: 255.24, y: 78.55, w: 48.65, h: 58.81, text: true },
  { src: "/images/brand/letters/e1.svg", x: 319.0, y: 78.53, w: 43.95, h: 58.81, text: true },
  { src: "/images/brand/letters/c.svg", x: 389.54, y: 77.55, w: 53.69, h: 60.81, text: true },
  { src: "/images/brand/letters/a.svg", x: 449.0, y: 78.13, w: 61.24, h: 59.23, text: true },
  { src: "/images/brand/letters/v.svg", x: 506.89, y: 78.55, w: 57.88, h: 59.23, text: true },
  { src: "/images/brand/letters/e2.svg", x: 574.83, y: 78.53, w: 43.95, h: 58.81, text: true },
];

interface HeroWordmarkProps {
  /** rendered width in px (height keeps the Figma frame ratio) */
  width?: number;
  className?: string;
}

export function HeroWordmark({ width = 664, className = "" }: HeroWordmarkProps) {
  // scale the Figma shadow (defined in frame units) to the rendered size
  const s = width / FRAME.w;
  const textShadow = `drop-shadow(${SHADOW.dx * s}px ${SHADOW.dy * s}px ${
    SHADOW.blur * s
  }px ${SHADOW.color})`;

  return (
    <div
      className={`relative ${className}`}
      style={{ width, height: (width * FRAME.h) / FRAME.w }}
      role="img"
      aria-label="The Cave"
    >
      {PIECES.map((p) => (
        <img
          key={p.src}
          src={p.src}
          alt=""
          className="absolute"
          style={{
            left: `${(p.x / FRAME.w) * 100}%`,
            top: `${(p.y / FRAME.h) * 100}%`,
            width: `${(p.w / FRAME.w) * 100}%`,
            height: `${(p.h / FRAME.h) * 100}%`,
            filter: p.text ? textShadow : undefined,
          }}
        />
      ))}
    </div>
  );
}
