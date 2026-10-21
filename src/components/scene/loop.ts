/*
  The hero's cycle as pure functions, testable without a renderer. The scenes never move; the camera does:
  it approaches the clay diorama until MAVERN locks in, zooms into the statue's eye until the pupil fills
  the frame, opens high over the night city, dives to street level and glides between four viewpoints
  where each medium's neon pieces lock into its word. Then it climbs out and washes back to the diorama.
*/
export type SceneName = "diorama" | "city";
/** Named camera poses; the scenes define where each one is. */
export type PoseName = "approach" | "mavern" | "eye" | "sky" | "aerial" | `word-${number}`;

export type Segment = {
  name: string;
  scene: SceneName;
  ms: number;
  from: PoseName;
  to: PoseName;
  /** The medium this segment shows or heads towards. */
  medium: number;
  /** How the wash that hides a change of scene fades: in at the end, out at the start, or not at all. */
  wash?: "in" | "out";
  /** Its colour: night coming out of the statue's eye, orchid on the way back to the diorama. */
  washColour?: "night" | "orchid";
};

const MEDIUMS = 4;

export const SEGMENTS: Segment[] = [
  { name: "approach", scene: "diorama", ms: 2400, from: "approach", to: "mavern", medium: 0, wash: "out", washColour: "orchid" },
  { name: "mavern", scene: "diorama", ms: 1800, from: "mavern", to: "mavern", medium: 0 },
  { name: "eye", scene: "diorama", ms: 2000, from: "mavern", to: "eye", medium: 0, wash: "in", washColour: "night" },
  { name: "glance", scene: "city", ms: 1800, from: "sky", to: "sky", medium: 0, wash: "out", washColour: "night" },
  { name: "dive", scene: "city", ms: 3000, from: "sky", to: "word-0", medium: 0 },
  ...Array.from({ length: MEDIUMS }, (_, k) => [
    ...(k > 0 ? [{ name: `move-${k}`, scene: "city" as const, ms: 2200, from: `word-${k - 1}` as PoseName, to: `word-${k}` as PoseName, medium: k }] : []),
    { name: `hold-${k}`, scene: "city" as const, ms: 2000, from: `word-${k}` as PoseName, to: `word-${k}` as PoseName, medium: k },
  ]).flat(),
  { name: "rise", scene: "city", ms: 2200, from: `word-${MEDIUMS - 1}`, to: "aerial", medium: MEDIUMS - 1, wash: "in", washColour: "orchid" },
];

export type LoopState = { segment: number; t: number };

/** Longest step taken at once, so a tab that was hidden resumes where it was instead of skipping ahead. */
const MAX_STEP_MS = 100;
/** Share of a segment the wash takes to fade in or out. */
const WASH_SHARE = 0.45;

export function advance(s: LoopState, dtMs: number): LoopState {
  let { segment, t } = s;
  t += Math.min(Math.max(dtMs, 0), MAX_STEP_MS);
  while (t >= SEGMENTS[segment].ms) {
    t -= SEGMENTS[segment].ms;
    segment = (segment + 1) % SEGMENTS.length;
  }
  return { segment, t };
}

/** power4.inOut, matching --ease-in-out. */
export function easeInOut(p: number): number {
  return p < 0.5 ? 8 * p ** 4 : 1 - (-2 * p + 2) ** 4 / 2;
}

export type Pose = { scene: SceneName; from: PoseName; to: PoseName; t: number; wash: number; washColour: "night" | "orchid"; medium: number };

export function pose(s: LoopState): Pose {
  const seg = SEGMENTS[s.segment];
  const p = Math.min(s.t / seg.ms, 1);
  const wash = seg.wash === "in" ? Math.max(0, 1 + (p - 1) / WASH_SHARE) : seg.wash === "out" ? Math.max(0, 1 - p / WASH_SHARE) : 0;
  return { scene: seg.scene, from: seg.from, to: seg.to, t: seg.from === seg.to ? 0 : easeInOut(p), wash, washColour: seg.washColour ?? "orchid", medium: seg.medium };
}
