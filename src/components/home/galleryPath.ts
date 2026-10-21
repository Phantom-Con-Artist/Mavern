/*
  The camera's walk through the dusk gallery, as a pure function of scroll progress (0..1), so it can be
  tested without a renderer. Three arches stand along a neon floor; the camera rests in front of each
  one while its chapter is read, and the sky takes that figure's colours.
*/
import type { Ground } from "@/lib/color";
import type { Medium } from "@/content/types";

type Vec3 = [number, number, number];
/** Sky at the top, sky at the horizon, and the floor grid's glow. */
export type Sky = { top: Ground; horizon: Ground; grid: Ground };

export type Chapter = { medium: Medium; figure: "athena" | "aphrodite" | "alexander"; arch: Vec3; at: number; sky: Sky };

/** Arch centres, and the scroll progress at which each chapter is read. */
export const CHAPTERS: Chapter[] = [
  { medium: "software", figure: "athena", arch: [-2.6, 2.6, -12], at: 0.24, sky: { top: "violet", horizon: "gold", grid: "orchid" } },
  { medium: "websites", figure: "aphrodite", arch: [2.6, 2.6, -26], at: 0.52, sky: { top: "night", horizon: "orchid", grid: "gold" } },
  { medium: "apps", figure: "alexander", arch: [-2.6, 2.6, -40], at: 0.8, sky: { top: "violet", horizon: "ember", grid: "orchid" } },
];

type Key = { p: number; eye: Vec3; target: Vec3; sky: Sky };

/** Share of the scroll the camera rests in front of each arch. */
const HOLD = 0.06;
const START: Key = { p: 0, eye: [0, 2.4, 7], target: [0, 2.2, -60], sky: { top: "violet", horizon: "orchid", grid: "orchid" } };
const END: Key = { p: 1, eye: [0, 3, -50], target: [0, 2.2, -120], sky: { top: "night", horizon: "violet", grid: "orchid" } };

function chapterKeys(c: Chapter): Key[] {
  const eye: Vec3 = [-c.arch[0] * 0.3, 2.3, c.arch[2] + 8.5];
  return [c.at - HOLD, c.at + HOLD].map((p) => ({ p, eye, target: c.arch, sky: c.sky }));
}

const KEYS: Key[] = [START, ...CHAPTERS.flatMap(chapterKeys), END];

export type Shot = { eye: Vec3; target: Vec3; from: Sky; to: Sky; t: number; chapter: number };

const smooth = (t: number) => t * t * (3 - 2 * t);
const mix = (a: Vec3, b: Vec3, t: number): Vec3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

export function galleryShot(progress: number): Shot {
  const p = Math.min(1, Math.max(0, progress));
  let i = 0;
  while (i < KEYS.length - 2 && p > KEYS[i + 1].p) i++;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const t = smooth(b.p === a.p ? 1 : (p - a.p) / (b.p - a.p));
  return { eye: mix(a.eye, b.eye, t), target: mix(a.target, b.target, t), from: a.sky, to: b.sky, t, chapter: nearestChapter(p) };
}

/** The chapter whose reading point is closest to this progress. */
export function nearestChapter(p: number): number {
  let chapter = 0;
  CHAPTERS.forEach((c, k) => {
    if (Math.abs(c.at - p) < Math.abs(CHAPTERS[chapter].at - p)) chapter = k;
  });
  return chapter;
}

/** 1 at `centre`, falling to 0 at `half` away on either side. */
export function windowOpacity(p: number, centre: number, half: number): number {
  const d = Math.abs(p - centre) / half;
  if (d >= 1) return 0;
  if (d <= 0.45) return 1;
  return smooth(1 - (d - 0.45) / 0.55);
}

export type Direction = "down" | "up";

/** Which way the reader is going, changing only after a move of more than `slack` pixels the other way. */
export function scrollDirection(current: Direction, from: number, to: number, slack = 12): Direction {
  if (to > from + slack) return "down";
  if (to < from - slack) return "up";
  return current;
}
