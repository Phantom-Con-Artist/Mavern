import type { Work } from "../types";

export const gingerbinger: Work = {
  slug: "gingerbinger",
  name: "GingerBinger",
  medium: "websites",
  kind: "Website for finding films",
  summary: "A local-first movie website: discover films, where to stream them, trailers and picks by mood or occasion, with no account.",
  body: [
    "GingerBinger helps you find films by mood, occasion and even the day of the week, along with streaming providers and trailers.",
    "Everything stays on your own device: no accounts, no sign-in.",
    "Personal recommendations come from a LensKit service, with a faster fallback when it is not running.",
  ],
  status: "in-development",
  stack: ["Next.js", "React 19", "Tailwind CSS", "Hono", "LensKit (Python)"],
  links: [],
  source: "gingerbinger README",
};
