/* eslint-disable @next/next/no-img-element */

/**
 * The Cave brand lockup reconstructed from the exact Figma vector fragments
 * (gold lion + "THE CAVE" wordmark). Fragment positions use the absolute insets
 * from the source design node (132×40 box) so the mark is pixel-faithful.
 */

interface Fragment {
  src: string;
  /** CSS inset shorthand: top right bottom left */
  inset: string;
}

const FRAGMENTS: Fragment[] = [
  { src: "/images/brand/grp.svg", inset: "7.25% 67.73% 0% 0%" },
  { src: "/images/brand/grp1.svg", inset: "7.25% 67.73% 0% 16.1%" },
  { src: "/images/brand/vec.svg", inset: "6.01% 86.33% 84.87% 6.95%" },
  { src: "/images/brand/vec1.svg", inset: "5.59% 74.67% 85.29% 18.61%" },
  { src: "/images/brand/layer1.svg", inset: "-0.01% -0.5% 39.63% 9.55%" },
];

const ASPECT = 132 / 40;

interface BrandLockupProps {
  height?: number;
  tone?: "gold" | "white";
  className?: string;
}

export function BrandLockup({
  height = 28,
  tone = "gold",
  className = "",
}: BrandLockupProps) {
  return (
    <div
      className={className}
      style={{
        position: "relative",
        height,
        width: height * ASPECT,
        // gold fragments → pure white when requested (used on the hero)
        filter: tone === "white" ? "brightness(0) invert(1)" : undefined,
      }}
    >
      {FRAGMENTS.map((f) => (
        <span key={f.src} style={{ position: "absolute", inset: f.inset }}>
          <img
            src={f.src}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              display: "block",
            }}
          />
        </span>
      ))}
    </div>
  );
}
