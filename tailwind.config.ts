import type { Config } from "tailwindcss";

/**
 * Design tokens for "The Cave" — Publicis Groupe awards showcase.
 * Palette derived from the Figma frames (dark cinematic theme,
 * gold accent, magenta→purple gradient).
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#000000",
          950: "#080809",
          900: "#0c0c0e",
          850: "#121214",
          800: "#1a1a1d",
          700: "#26262b",
          600: "#34343b",
          500: "#42424a",
        },
        cave: {
          gold: "#d6b76a",
          golddim: "#9d833e",
          goldsoft: "#d8b86a",
          magenta: "#e6007a",
          pink: "#ff2d9b",
          purple: "#7b2ff7",
          violet: "#8b3fff",
          badgePink: "#cb2f8d",
          badgePurple: "#9b69f1",
        },
        chip: {
          cyan: "#16abe0",
          pink: "#d93d7a",
          teal: "#00b0a3",
          tan: "#9d833e",
          bronze: "#a66a3f",
        },
        // Prize badge palette (Award Detail entries + trophy chips) — matches
        // the design legend: Grand Prix > Gold > Silver > Bronze > Shortlisted > Others.
        prize: {
          grandprix: "#c13c92",
          gold: "#a08a3e",
          silver: "#a6a6a6",
          bronze: "#a66a3f",
          shortlisted: "#3ea99e",
          other: "#4ba6d8",
        },
        muted: {
          DEFAULT: "#a7a7ad",
          dim: "#7a7a80",
          faint: "#56565c",
        },
      },
      fontFamily: {
        // Gotham substitute (Montserrat) — single family across the design.
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "cave-gradient":
          "linear-gradient(90deg, #e6007a 0%, #b023b0 50%, #7b2ff7 100%)",
        "cave-gradient-soft":
          "linear-gradient(90deg, rgba(230,0,122,0.18) 0%, rgba(123,47,247,0.18) 100%)",
        "hero-fade":
          "linear-gradient(180deg, rgba(8,8,9,0) 0%, rgba(8,8,9,0.6) 70%, #080809 100%)",
      },
      maxWidth: {
        site: "1440px",
        content: "1180px",
      },
      letterSpacing: {
        // Figma text uses normal tracking everywhere; keep these ~0 so existing
        // utility usages don't introduce spacing the design doesn't have.
        display: "0",
        wide2: "0",
      },
    },
  },
  plugins: [],
};

export default config;
