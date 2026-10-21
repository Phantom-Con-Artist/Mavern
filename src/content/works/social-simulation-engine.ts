import type { Work } from "../types";

export const socialSimulationEngine: Work = {
  slug: "social-simulation-engine",
  name: "Social Simulation Engine",
  medium: "experiments",
  kind: "NPC social behaviour sandbox",
  summary: "A Rust sandbox for experimenting with how game characters choose who to talk to, and how their moods change.",
  body: [
    "The simulation is a standalone library, so it can later run inside a game, in a headless batch run, or in tools.",
    "A small 2D sandbox shows a town of characters. You step it one beat at a time, pick two characters, and trigger a friendly chat or an awkward exchange to see their moods shift.",
    "The world uses a fixed seed, so every reset plays out the same way. Needs, relationships, memory and explainable choices come next.",
  ],
  status: "experiment",
  platforms: "Desktop",
  stack: ["Rust", "Bevy"],
  links: [],
  featured: true,
  source: "Simulation Engine README",
};
