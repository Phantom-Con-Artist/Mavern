import type { Medium, Work, WorkLink, WorkStatus } from "../types";
import { volpi } from "./volpi";
import { chimera } from "./chimera";
import { notifly } from "./notifly";
import { scrapbean } from "./scrapbean";
import { mistletoeUi } from "./mistletoe-ui";
import { animepoodle } from "./animepoodle";
import { respawn } from "./respawn";
import { gingerbinger } from "./gingerbinger";
import { algalBiotechLab } from "./algal-biotech-lab";
import { lightYearSaga } from "./light-year-saga";
import { restronaut } from "./restronaut";
import { textTycoon } from "./text-tycoon";
import { socialSimulationEngine } from "./social-simulation-engine";
import { onlineTachistoscope } from "./online-tachistoscope";

/** Every work, in the order it is listed within its medium. Add a work: one file here, one line below. */
export const works: Work[] = [volpi, chimera, notifly, scrapbean, mistletoeUi, animepoodle, respawn, gingerbinger, algalBiotechLab, lightYearSaga, restronaut, textTycoon, socialSimulationEngine, onlineTachistoscope];

export const statusLabels: Record<WorkStatus, string> = {
  released: "Released",
  live: "Live",
  beta: "Open beta",
  "in-development": "In development",
  experiment: "Experiment",
  paused: "Paused",
};

export function getWork(medium: Medium, slug: string): Work | undefined {
  return works.find((w) => w.medium === medium && w.slug === slug);
}

export function worksByMedium(medium: Medium): Work[] {
  return works.filter((w) => w.medium === medium);
}

export function featuredWorks(): Work[] {
  return works.filter((w) => w.featured);
}

export function publicLinks(work: Work): WorkLink[] {
  return work.links.filter((l) => l.confirmed);
}

export function workPath(work: Work): string {
  return `/work/${work.medium}/${work.slug}/`;
}
