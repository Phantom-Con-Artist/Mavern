import type { Work } from "../types";

export const onlineTachistoscope: Work = {
  slug: "online-tachistoscope",
  name: "Online Tachistoscope",
  medium: "experiments",
  kind: "Browser-based research instrument",
  summary: "A browser instrument that flashes words for 100 milliseconds and measures how accurately and how quickly people recall them.",
  body: [
    "A tachistoscope shows an image for a precisely controlled fraction of a second. It has been used since 1859 to study perception, word recognition and attention.",
    "This one runs in a web browser. It flashes words for 100 milliseconds and records how accurately and how quickly people recall them.",
    "It was developed at the Department of Computer Science, Central University of Tamil Nadu.",
  ],
  status: "experiment",
  version: "0.6.0",
  stack: ["React 19", "Vite", "Tailwind CSS", "Supabase"],
  links: [
    { label: "Try the instrument", href: "https://online-tachistoscope.pages.dev", confirmed: true },
    { label: "Source on GitHub", href: "https://github.com/Phantom-Con-Artist/Online-Tachistoscope", confirmed: false },
  ],
  screenshot: true,
  source: "WebApp README",
};
