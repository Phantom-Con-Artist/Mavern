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
  /** Where the facts came from, for review before publishing. */
  source: string;
};

export type MediumInfo = {
  slug: Medium;
  label: string;
  /** The word the hero sculpture spells from the side. */
  word: string;
  description: string;
};
