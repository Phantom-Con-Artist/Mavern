import type { Ground } from "@/lib/color";

export type NavItem = { id: "work" | "about" | "contact"; label: string; href: string };

/** A link that is planned but not live yet has href: null and renders as plain text. */
export type ProfileLink = { label: string; href: string | null };

export type Medium = "software" | "websites" | "apps" | "experiments";

export type WorkStatus = "released" | "live" | "beta" | "in-development" | "experiment" | "paused";

/** Only confirmed links render. Unconfirmed ones wait for the owner to say the address is public. */
export type WorkLink = { label: string; href: string; confirmed: boolean };

export type Work = {
  slug: string;
  name: string;
  medium: Medium;
  /** What it is, in a few words: "Desktop app for researchers". */
  kind: string;
  /** One sentence, used on cards and as the meta description. */
  summary: string;
  /** A few paragraphs for the project page. */
  body: string[];
  status: WorkStatus;
  version?: string;
  platforms?: string;
  stack: string[];
  links: WorkLink[];
  /** Shown on the home page. */
  featured?: boolean;
  /** A screenshot of the live work, built by scripts/build-images.mjs as screen-<slug>. */
  screenshot?: boolean;
  /** Where the facts came from, for review before publishing. */
  source: string;
};

/** The statue artworks in assets/, published under public/media by scripts/build-images.mjs. */
export type Figure = "athena" | "aphrodite" | "alexander" | "creation";

export type MediumInfo = {
  slug: Medium;
  label: string;
  /** The word the city spells for this medium. */
  word: string;
  description: string;
  /** The figure that stands for this medium, and the palette ground of its pages. */
  figure: Figure;
  ground: Ground;
  /** One line for the home page's gallery chapter. */
  line: string;
};
