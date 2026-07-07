import type { FeaturedWork } from "./types";

/**
 * Featured work for the home carousel — the four stills shown on the Figma
 * homepage (Patient, The Giant, Vaseline Huh, It Must Be Sting). The campaign
 * stills already carry their stat overlays, so no extra chips are rendered.
 */
export const FEATURED_WORK: FeaturedWork[] = [
  {
    slug: "patient",
    title: "Patient",
    image: "/images/details/patient.webp",
    accent: "amber",
    stats: [
      { value: "30M+", label: "Reach" },
      { value: "2M+", label: "Clicks" },
    ],
  },
  {
    slug: "the-giant",
    title: "The Giant",
    image: "/images/details/the-giant.webp",
    accent: "cyan",
    stats: [
      { value: "146M+", label: "Impressions" },
      { value: "47M+", label: "Views" },
    ],
  },
  {
    slug: "vaseline-huh",
    title: "Vaseline Huh",
    image: "/images/details/vaseline-huh.webp",
    accent: "rose",
    stats: [
      { value: "14M", label: "Engagements" },
      { value: "+35.7%", label: "Product growth" },
    ],
  },
  {
    slug: "it-must-be-sting",
    title: "It Must Be Sting",
    image: "/images/details/it-must-be-sting.webp",
    accent: "rose",
    stats: [
      { value: "#1", label: "Category" },
      { value: "1.3B", label: "Impressions" },
    ],
  },
];
