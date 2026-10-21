import type { MediumInfo } from "./types";

/** In this order on every page and in the hero's cycle. */
export const mediums: MediumInfo[] = [
  {
    slug: "software",
    label: "Software",
    word: "SOFTWARE",
    description: "Desktop apps for research, writing, notes and keeping memories, plus a desktop theme for KDE Plasma.",
    figure: "athena",
    ground: "gold",
    line: "Desktop tools for daily work, built to be relied on: research, notes, writing and memories, in Rust, Tauri, React and Electron.",
  },
  {
    slug: "websites",
    label: "Websites",
    word: "WEBSITES",
    description: "Sites for finding anime, games and films, a 3D tour of the universe, and a university lab's home.",
    figure: "aphrodite",
    ground: "orchid",
    line: "The face a project shows the world. Fast, readable sites with the motion and 3D they need, and no more.",
  },
  {
    slug: "apps",
    label: "Apps",
    word: "APPS",
    description: "Smaller apps for phones and desktops, still being built.",
    figure: "alexander",
    ground: "ember",
    line: "Small apps made to go where people go, on phones and desktops.",
  },
  {
    slug: "experiments",
    label: "Experiments",
    word: "EXPERIMENTS",
    description: "Research instruments and simulations, made to find something out.",
    figure: "creation",
    ground: "violet",
    line: "Instruments, simulations and live 3D, made to find something out.",
  },
];

export function getMedium(slug: string): MediumInfo | undefined {
  return mediums.find((m) => m.slug === slug);
}
