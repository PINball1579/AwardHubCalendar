import type { AwardEntry } from "../types";
import { credits } from "./helpers";

/** Figma page 3.1 AWARDS DETAIL - PATIENT */
export const PATIENT: AwardEntry = {
  slug: "patient",
  title: "Patient",
  agency: "LEO Bangkok",
  client: "Krungsri First Choice",
  year: 2026,
  location: "Bangkok, Thailand",
  image: "/images/details/patient.webp",
  downloadUrl:
    "https://lion.box.com/s/iejg40uhfmv044knf1exikuhjnrzksoh",
  filters: {
    awards: [
      "Adfest",
      "Spikes Asia",
      "Cannes Lions",
      "One Asia",
      "Adman",
      "London International (LIA)",
      "Clio Awards",
    ],
    agencies: ["Leo Bangkok (LBB)"],
    clients: ["Krungsri First Choice"],
    trophies: ["Grand Prix", "Gold", "Bronze", "Shortlisted", "Others"],
    categories: ["Film", "Film Craft"],
    sectors: ["Financial Services"],
    years: [2025, 2026],
  },
  accent: "amber",
  trophies: [
    { label: "1 Grand Prix One Asia", tier: "winner" },
    { label: "1 Gold Adman Awards", tier: "gold" },
    { label: "2 Gold One Asia", tier: "gold" },
    { label: "1 Gold Adfest", tier: "gold" },
    { label: "1 Bronze London International Awards", tier: "bronze" },
    { label: "3 Bronze Adman Awards", tier: "bronze" },
    { label: "1 Bronze The Clio Awards", tier: "bronze" },
    { label: "1 Bronze Spikes Asia", tier: "bronze" },
    { label: "1 Shortlisted Cannes Lions", tier: "finalist" },
    { label: "2 Shortlisted Adfest", tier: "finalist" },
    { label: "1 Shortlisted Spikes Asia", tier: "finalist" },
    { label: "1 Winner RBI Asia Trailblazer Awards", tier: "winner" },
    { label: "1 Outstanding Advertisement Thai Ads of The Year", tier: "winner" },
  ],
  stats: [
    { value: "30M+", label: "Reach" },
    { value: "2M+", label: "Clicks" },
    { value: "+83%", label: "App in" },
    { value: "+51%", label: "New accounts" },
  ],
  overview: [
    {
      title: "Background",
      body: `First Choice is a leading cash loan card and service in Thailand, which strongly positioned themselves in "Fast Approval" territory. However, in recent years, some competitors started to copy our "Fast" feature and try to demonstrate how fast approval process they can offer as well. First Choice Cash Card aims to acquire new users from the existing pool of customers in the market. This year, they want to promote their 'Fastest Approval' feature, which currently positions them as the market leader.`,
    },
    {
      title: "Description",
      body: `First Choice is a leading cash loan card and service in Thailand, which strongly positioned themselves in "Fast Approval" territory. However, in recent years, some competitors started to copy our "Fast" feature and try to demonstrate how fast approval process they can offer as well. First Choice Cash Card aims to acquire new users from the existing pool of customers in the market. This year, they want to promote their 'Fastest Approval' feature, which currently positions them as the market leader.`,
    },
    {
      title: "Execution",
      body: `The film begins in a hospital filled with patients waiting for their turn. Suddenly, a crocodile show performer walks up to the counter, complaining of a slight headache and neck pain. He hopes for some empathy, believing that his urgency will get him treated faster. But in the end, the nurse simply tells him to wait like everyone else. Just then, First Choice steps in, showing the audience that we truly understand how painful waiting can be. That's why, at First Choice, we never make anyone wait—especially when it comes to applying for a card.`,
    },
    {
      title: "Outcome",
      body: `YouTube : 1M views in 24 hours on YouTube / 46% reach within 1 week on YouTube. To date, it has reached 7.6 million views on YouTube and has driven a 50% increase in new card applications.`,
    },
  ],
  entries: [
    { year: 2025, name: "Patient", category: "Best of Discipline", subCategory: "Best of film & Video", awards: "One Asia", prize: "Grand Prix", prizeTier: "winner" },
    { year: 2025, name: "Patient", category: "Film", subCategory: "Consumer Services/ Business to Business /FINANCIAL", awards: "Adman Awards", prize: "Gold", prizeTier: "gold" },
    { year: 2025, name: "Patient", category: "Film", subCategory: "Use of Humour", awards: "One Asia", prize: "Gold", prizeTier: "gold" },
    { year: 2025, name: "Patient", category: "TV, VOD & Online", subCategory: "Short Form", awards: "One Asia", prize: "Gold", prizeTier: "gold" },
    { year: 2026, name: "Patient", category: "Online Film", subCategory: "Finance & Real Estate", awards: "Adfest", prize: "Gold", prizeTier: "gold" },
    { year: 2025, name: "Patient", category: "Online Film", subCategory: "Humor", awards: "London International Awards", prize: "Bronze", prizeTier: "bronze" },
    { year: 2025, name: "Patient", category: "Craft Film", subCategory: "Directing", awards: "Adman Awards", prize: "Bronze", prizeTier: "bronze" },
    { year: 2025, name: "Patient", category: "Craft Film", subCategory: "Casting", awards: "Adman Awards", prize: "Bronze", prizeTier: "bronze" },
    { year: 2025, name: "Patient", category: "Craft Film", subCategory: "Production Design / Art Direction", awards: "Adman Awards", prize: "Bronze", prizeTier: "bronze" },
    { year: 2026, name: "Patient", category: "Film", subCategory: "Professional", awards: "The Clio Awards", prize: "Bronze", prizeTier: "bronze" },
    { year: 2026, name: "Patient", category: "Film", subCategory: "Consumer Services/ Business to Business", awards: "Spikes Asia", prize: "Bronze", prizeTier: "bronze" },
    { year: 2025, name: "Patient", category: "Film: Online Film", subCategory: "Consumer Services/ Business to Business", awards: "Cannes Lions", prize: "Shortlisted", prizeTier: "finalist" },
    { year: 2026, name: "Patient", category: "Film: Online Film", subCategory: "Viral Film", awards: "Adfest", prize: "Shortlisted", prizeTier: "finalist" },
    { year: 2026, name: "Patient", category: "Film: Culture & Content", subCategory: "Use of Humour", awards: "Adfest", prize: "Shortlisted", prizeTier: "finalist" },
    { year: 2026, name: "Patient", category: "Culture & Context", subCategory: "Use of Humour", awards: "Spikes Asia", prize: "Shortlisted", prizeTier: "finalist" },
    { year: 2026, name: "Patient", category: "Best Marketing Campaign of the Year", subCategory: "-", awards: "RBI Asia Trailblazer Awards", prize: "Winner", prizeTier: "winner" },
    { year: 2025, name: "Patient", category: "Hall of Fame", subCategory: "-", awards: "Thai Ads of The Year", prize: "Outstanding Advertisement", prizeTier: "winner" },
  ],
  companyCredits: credits(
    ["LEO BANGKOK", "Factory01", "Factory01"],
    ["Bangkok, Thailand", "Bangkok, Thailand", "Bangkok, Thailand"],
    ["Creative Agency", "Production", "Post-Production"],
  ),
  peopleCredits: credits(
    [
      "Prasert Vijitpawan", "Prasert Vijitpawan", "Thiti Boonkerd", "Thiti Boonkerd", "Theetasak Dangrojana", "Teerawat Kraiarb", "Norawit Saratsamith", "Shanya Jiwachotkamjorn", "Rungrudee Chinpratan", "Thipayachand Hasdin", "Rathawan Sukanake", "Pattra Ketsamathi", "Suthikarn Saeju", "Doungjai Sawasdee Moyon", "Puree Preyaprawat", "Wuthisak Anarnkaporn", "Mattanee Uajarernsup", "Boonsita Limprasert", "Kritsada Nakagate", "Toey Jaruvateekul", "Thida Rosthip", "Anchisa Eksirimethikul", "Nisakorn Ngaosri", "Parinya Likhitroekwit", "Wipawee Khirirat", "Sippanart Olarnsaritkul", "Natnicha Suwanprapa", "Power Kuan", "Nopawat Likitwong", "Pasittha Chantarawong",
    ],
    [
      "Leo Thailand", "Leo Thailand", "Leo Thailand", "Leo Thailand", "Leo Thailand", "Leo Thailand", "Leo Thailand", "Leo Thailand", "Leo Thailand", "Leo Thailand", "Leo Thailand", "Leo Thailand", "Leo Thailand", "Leo Thailand", "Leo Thailand", "FACTORY01", "FACTORY01", "FACTORY01", "FACTORY01", "FACTORY01", "FACTORY01", "FACTORY01", "FACTORY01", "FACTORY01", "FACTORY01", "Matad", "Ultraviolet post production", "The Quiet lab", "Onecool Production", "Leo Thailand",
    ],
    [
      "Chief Creative Officer", "Senior Copywriter", "Deputy Executive Creative Director", "Senior Copywriter", "Creative Group Head", "Senior Art Director", "Senior Copywriter", "Senior Copywriter", "Producer", "CEO", "Account Management Director", "Group Account Director", "Account Manager", "Head of Strategic Planning", "Strategic Planner", "Director", "1st Assistant Director", "Production Manager", "Director of Photography", "Art Director", "Stylist", "Casting", "Location Manager", "Mock up", "Post Producer", "Editor", "Colorist", "VTR Online", "Audio Mix", "Awards Manager",
    ],
  ),
};
