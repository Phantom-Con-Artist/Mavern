import type { Work } from "../types";

export const notifly: Work = {
  slug: "notifly",
  name: "Notifly",
  medium: "software",
  kind: "Desktop notes and ideas app",
  summary: "A desktop app for daily notes and ideas: linked Markdown notes, backlinks, tags, search and a graph of how notes connect.",
  body: [
    "Notifly opens on today's page. Notes are plain Markdown files in a folder you choose.",
    "Notes link to each other with wikilinks, including links to a single heading or paragraph. Each note shows what links back to it, and one click turns a plain mention into a link.",
    "Search filters by tag, link and date. A graph maps notes and their links, and a quick switcher jumps to any note by title or alias.",
  ],
  status: "in-development",
  platforms: "Desktop",
  stack: ["Electron", "React", "CodeMirror 6", "Tailwind CSS"],
  links: [],
  source: "Notifly README",
};
