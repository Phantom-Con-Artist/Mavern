import type { NavItem, ProfileLink } from "./types";

/** Receives mail only. The site has no form and sends nothing. */
export const contactEmail = "contact@mavern.in";

export const creator = { name: "Subhradeep Sarkar" };

export const nav: NavItem[] = [
  { id: "work", label: "Work", href: "/work/" },
  { id: "about", label: "About", href: "/#about" },
  { id: "contact", label: "Contact", href: "/#contact" },
];

// Placeholders: add the real address when it is ready.
export const profiles: ProfileLink[] = [{ label: "GitHub", href: null }];
