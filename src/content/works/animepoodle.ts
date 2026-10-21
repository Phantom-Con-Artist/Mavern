import type { Work } from "../types";

export const animepoodle: Work = {
  slug: "animepoodle",
  name: "animepoodle",
  medium: "websites",
  kind: "Website for finding and tracking anime",
  summary: "A place to discover and track anime, donghua, manga, manhwa and manhua, with recommendations worked out in your own browser.",
  body: [
    "animepoodle uses live AniList data and AnimeThemes music. Your library stays private and local to your browser.",
    "Recommendations are computed in the browser, so there is no account to make.",
    "It has light and dark themes in a soft neo-brutalist style.",
  ],
  status: "live",
  stack: ["Next.js", "React", "Tailwind CSS", "Rust (WebAssembly)"],
  links: [
    { label: "Visit animepoodle", href: "https://animepoodle.mavern.in", confirmed: true },
  ],
  featured: true,
  source: "Anime-website README",
};
