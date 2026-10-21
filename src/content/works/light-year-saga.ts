import type { Work } from "../types";

export const lightYearSaga: Work = {
  slug: "light-year-saga",
  name: "Light Year Saga",
  medium: "websites",
  kind: "Interactive 3D tour of the universe",
  summary: "An interactive 3D explorer of the Solar System, the stars, the Milky Way and the wider universe, built on real astronomical data.",
  body: [
    "Light Year Saga moves from the planets out to the observable universe, using real astrophysical data and real orbital physics.",
    "You can navigate, select and inspect anything you see, or board a guided voyage and let the ship's AI, ARIA, take the helm.",
    "It separates real data from illustration, and says which is which.",
  ],
  status: "live",
  stack: ["React 19", "Three.js", "Vite", "Tailwind CSS"],
  links: [
    { label: "Open the tour", href: "https://light-year-saga.pages.dev", confirmed: true },
    { label: "Source on GitHub", href: "https://github.com/Phantom-Con-Artist/Light-Year-Saga", confirmed: false },
  ],
  featured: true,
  screenshot: true,
  source: "Light Year Saga README",
};
