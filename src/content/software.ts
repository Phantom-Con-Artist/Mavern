import type { Software, SoftwareStatus } from "./types";

export const statusLabels: Record<SoftwareStatus, string> = {
  released: "Released",
  beta: "Open beta",
  "in-development": "In development",
  paused: "Paused",
};

/*
  Each release keeps its own site and branding; Mavern lists it plainly and links out.
  Volpi facts come from the Volpi website repository (../Volpi Website/src/content), v0.1.0, October 2026.
*/
export const software: Software[] = [
  {
    id: "volpi",
    name: "Volpi",
    kind: "Desktop app for researchers",
    summary:
      "Read and highlight PDFs, write linked notes, check data and write papers with citations, all in one app. Each project is a plain folder on your own computer.",
    status: "beta",
    version: "0.1.0",
    platforms: "Windows, macOS and Linux",
    href: "https://volpi.mavern.in", // Volpi's own site; to be wired to this address.
    linkLabel: "Visit Volpi",
  },
];
