import type { NavItem, ProfileLink } from "./types";

/** Receives mail only. The site has no form and sends nothing. */
export const contactEmail = "contact@mavern.in";

export const creator = {
  name: "Subhradeep Sarkar",
  // A stand-in profile picture, not a likeness.
  avatar: {
    src: "/brand/whale.webp",
    alt: "Cartoon profile picture: a smug, chubby whale in round glasses typing on a tiny laptop, its spout shaped like a question mark.",
    caption: "Not actually me.",
  },
};

export const nav: NavItem[] = [
  { id: "software", label: "Software", href: "/software/" },
  { id: "about", label: "About", href: "/#about" },
  { id: "contact", label: "Contact", href: "/#contact" },
];

// Placeholders: add the real address when it is ready.
export const profiles: ProfileLink[] = [{ label: "GitHub", href: null }];
