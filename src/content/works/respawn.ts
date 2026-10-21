import type { Work } from "../types";

export const respawn: Work = {
  slug: "respawn",
  name: "Respawn",
  medium: "websites",
  kind: "Website for finding games",
  summary: "A website for browsing and discovering games, with data from IGDB and RAWG.",
  body: [
    "Respawn combines two game catalogues, IGDB and RAWG, and falls back to the second when the first is unavailable.",
    "It is a static site with small Cloudflare functions in front of the game data, so there is no server to run.",
    "It has light and dark themes with three accent colours: Ice, Ember and Acid.",
  ],
  status: "in-development",
  stack: ["Next.js 16", "React 19", "Tailwind CSS 4", "Cloudflare Pages Functions"],
  links: [
    { label: "Source on GitHub", href: "https://github.com/Phantom-Con-Artist/respawn", confirmed: false },
  ],
  source: "gamer-website README",
};
