/*
  The hero's cycle, as pure functions so it can be tested without a renderer:
  hold MAVERN flat → turn to the side → hold the medium word → turn back → slide the cubes in depth to the
  next word while facing front (invisible from there) → next word.
*/
export type LoopPhase = "holdFront" | "turnOut" | "holdSide" | "turnBack" | "morph";

export type LoopState = { phase: LoopPhase; t: number; word: number };

export const PHASE_MS: Record<LoopPhase, number> = {
  holdFront: 1600,
  turnOut: 1100,
  holdSide: 1800,
  turnBack: 1100,
  morph: 900,
};

const NEXT: Record<LoopPhase, LoopPhase> = {
  holdFront: "turnOut",
  turnOut: "holdSide",
  holdSide: "turnBack",
  turnBack: "morph",
  morph: "holdFront",
};

/** Longest step taken at once, so a tab that was hidden resumes where it was instead of skipping a turn. */
const MAX_STEP_MS = 100;

export function advance(s: LoopState, dtMs: number, wordCount: number): LoopState {
  let { phase, t, word } = s;
  t += Math.min(Math.max(dtMs, 0), MAX_STEP_MS);
  while (t >= PHASE_MS[phase]) {
    t -= PHASE_MS[phase];
    if (phase === "morph") word = (word + 1) % wordCount;
    phase = NEXT[phase];
  }
  return { phase, t, word };
}

/** power4.inOut, matching --ease-in-out. */
function easeInOut(p: number): number {
  return p < 0.5 ? 8 * p ** 4 : 1 - (-2 * p + 2) ** 4 / 2;
}

const QUARTER = Math.PI / 2;
const TILT = 0.25;

export function pose(s: LoopState): { yaw: number; pitch: number; morph: number } {
  const p = Math.min(s.t / PHASE_MS[s.phase], 1);
  switch (s.phase) {
    case "holdFront":
      return { yaw: 0, pitch: 0, morph: 0 };
    case "turnOut":
      return { yaw: QUARTER * easeInOut(p), pitch: TILT * Math.sin(Math.PI * p), morph: 0 };
    case "holdSide":
      return { yaw: QUARTER, pitch: 0, morph: 0 };
    case "turnBack":
      return { yaw: QUARTER * (1 - easeInOut(p)), pitch: TILT * Math.sin(Math.PI * p), morph: 0 };
    case "morph":
      return { yaw: 0, pitch: 0, morph: easeInOut(p) };
  }
}
