import type { Work } from "../types";

export const mistletoeUi: Work = {
  slug: "mistletoe-ui",
  name: "Mistletoe UI",
  medium: "software",
  kind: "Desktop theme for KDE Plasma 6",
  summary: "A minimal, cinematic desktop for KDE Plasma 6: no taskbar, radial menus that bloom from the screen edges, and matte faceted surfaces.",
  body: [
    "Mistletoe UI replaces the usual taskbar and menu with a quiet, layered desktop built on stock KDE Plasma 6.",
    "A slim strip runs along the bottom. Apps bloom out of the corner onto orbits, the clock opens a fan of status controls, and Alt+Tab becomes a rotary dial.",
    "It comes in four editions, Dark, Light, Neon and Ember, with two typefaces made for it, Ad Astra and Mythril.",
  ],
  status: "in-development",
  platforms: "KDE Plasma 6 on Linux",
  stack: ["KDE Plasma 6", "QML", "Kvantum"],
  links: [
    { label: "Source on GitHub", href: "https://github.com/Phantom-Con-Artist/Mistletoe-UI", confirmed: false },
  ],
  source: "KDE-Workshop README",
};
