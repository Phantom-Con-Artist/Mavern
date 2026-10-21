import type { Work } from "../types";

export const algalBiotechLab: Work = {
  slug: "algal-biotech-lab",
  name: "Algal Biotech Lab",
  medium: "websites",
  kind: "Website for a university research lab",
  summary: "The website of the Algal Biotechnology Laboratory at the Central University of Tamil Nadu, in nine languages.",
  body: [
    "The lab, led by Dr. Amit Kumar Bajhaiya, studies how microalgae regulate their genes and metabolism and engineers them for biofuels, carbon capture, nutraceuticals and wastewater treatment.",
    "The site covers the lab's research programmes, its people, and every publication, grouped by year with search and citation copy.",
    "Every page exists in nine languages and is pre-rendered, with structured data for each member and publication.",
  ],
  status: "live",
  stack: ["Next.js", "TypeScript"],
  links: [
    { label: "Visit the site", href: "https://algal-biotech-lab.pages.dev", confirmed: true },
    { label: "Source on GitHub", href: "https://github.com/Phantom-Con-Artist/Algal-Biotech-Lab", confirmed: false },
  ],
  screenshot: true,
  source: "AlgalBiotechLab README",
};
