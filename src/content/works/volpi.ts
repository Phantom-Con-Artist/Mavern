import type { Work } from "../types";

export const volpi: Work = {
  slug: "volpi",
  name: "Volpi",
  medium: "software",
  kind: "Desktop app for researchers",
  summary: "Read and highlight PDFs, write linked notes, check data and write papers with citations, all in one app. Each project is a plain folder on your computer.",
  body: [
    "My own research was split across a PDF reader, a notes app, a reference manager, a spreadsheet and a word processor, and none of them talked to each other. Volpi is the tool I built to bring that work into one place.",
    "You read and highlight PDFs, write linked Markdown notes, check and chart data, and write papers with citations. Each project is a plain folder on your own computer, with no account and no cloud.",
    "Volpi is in open beta and free to download. Its source code is not public; the documentation, roadmap and bug reports live on its own site.",
  ],
  status: "beta",
  version: "0.1.1",
  platforms: "Windows, macOS and Linux",
  stack: ["React", "Tauri", "Rust"],
  links: [
    { label: "Visit Volpi", href: "https://volpi.mavern.in", confirmed: true },
    { label: "Download the beta", href: "https://github.com/Phantom-Con-Artist/Volpi-Releases/releases/latest", confirmed: true },
  ],
  featured: true,
  source: "Volpi Website README; Volpi-Releases README; mavern-site About copy",
};
