import type { Work } from "../types";

export const chimera: Work = {
  slug: "chimera",
  name: "Chimera",
  medium: "software",
  kind: "Desktop app built from connected parts",
  summary: "A desktop app where applications are put together from views, backend services and controls, wired up on a node graph.",
  body: [
    "Chimera's first workload is text and Markdown. An application is not written in one piece: it is composed from plugins, such as a text editor, a Markdown backend and a rendered preview, wired together.",
    "The canvas has two tabs. Viewport is the running application. Compositor is its blueprint as a node graph, where plugins are nodes and wires are the relationships between them.",
    "The editor edits text without knowing its format; the backend interprets it. The same editor can feed a statistics backend or a plain text preview instead.",
  ],
  status: "in-development",
  version: "0.2.0",
  platforms: "Desktop",
  stack: ["Rust", "Tauri 2", "React", "TypeScript"],
  links: [],
  featured: true,
  source: "Chimera Project README",
};
