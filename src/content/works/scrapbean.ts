import type { Work } from "../types";

export const scrapbean: Work = {
  slug: "scrapbean",
  name: "ScrapBean",
  medium: "software",
  kind: "Everyday memory scrapbook",
  summary: "An everyday memory scrapbook. Paste, drop or write anything, and it lands on the page as a collage you can rearrange.",
  body: [
    "Every scrapbook stands on a shelf with its name, a short description, and an optional time and place. Open one to read it, and pages turn with the arrow keys.",
    "In Edit, pictures, videos, sound and notes drop onto the page, and the page deals itself again to fit one screen. In Customize you arrange scraps by hand and choose paper, handwriting, frames and stickers.",
    "A scrapbook can be saved as a zipped web page, a PDF, or a single page as a picture.",
  ],
  status: "in-development",
  platforms: "Desktop",
  stack: ["Electron"],
  links: [
    { label: "Visit ScrapBean", href: "https://scrapbean.mavern.in", confirmed: true },
  ],
  screenshot: true,
  source: "ScrapBean README",
};
