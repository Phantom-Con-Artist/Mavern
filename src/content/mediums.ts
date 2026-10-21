import type { MediumInfo } from "./types";

/** In this order on every page and in the hero's cycle. */
export const mediums: MediumInfo[] = [
  {
    slug: "software",
    label: "Software",
    word: "SOFTWARE",
    description: "Desktop apps for research, writing, notes and keeping memories, plus a desktop theme for KDE Plasma.",
  },
  {
    slug: "websites",
    label: "Websites",
    word: "WEBSITES",
    description: "Sites for finding anime, games and films, a 3D tour of the universe, and a university lab's home.",
  },
  {
    slug: "apps",
    label: "Apps",
    word: "APPS",
    description: "Smaller apps for phones and desktops, still being built.",
  },
  {
    slug: "experiments",
    label: "Experiments",
    word: "EXPERIMENTS",
    description: "Research instruments and simulations, made to find something out.",
  },
];

export function getMedium(slug: string): MediumInfo | undefined {
  return mediums.find((m) => m.slug === slug);
}
