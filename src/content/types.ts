export type NavItem = { id: "home" | "software" | "about" | "contact"; label: string; href: string };

/** A link that is planned but not live yet has href: null and renders as plain text. */
export type ProfileLink = { label: string; href: string | null };

export type SoftwareStatus = "released" | "beta" | "in-development" | "paused";

export type Software = {
  id: string;
  name: string;
  kind: string;
  summary: string;
  status: SoftwareStatus;
  version: string;
  platforms: string;
  /** The release's own website. */
  href: string;
  linkLabel: string;
};
