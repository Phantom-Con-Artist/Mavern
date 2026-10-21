/*
  The hero's cycle as pure functions, testable without a renderer. Stage 0 is the diorama; stages 1–4 are
  the cities, one per medium. The camera approaches the diorama until MAVERN locks in, holds, and then
  each move morphs the blocks to the next stage while the camera travels with them.
*/
export const STAGE_COUNT = 5;
export type LoopPhase = "approach" | "hold" | "move";
export type LoopState = { stage: number; phase: LoopPhase; t: number };

export function phaseMs(s: LoopState): number {
  if (s.phase === "approach") return 2400;
  if (s.phase === "hold") return s.stage === 0 ? 1800 : 2600;
  return 2600;
}

/** Longest step taken at once, so a tab that was hidden resumes where it was instead of skipping ahead. */
const MAX_STEP_MS = 100;

function next(s: LoopState): LoopState {
  if (s.phase === "approach") return { ...s, phase: "hold", t: 0 };
  if (s.phase === "hold") return { ...s, phase: "move", t: 0 };
  const stage = (s.stage + 1) % STAGE_COUNT;
  return { stage, phase: stage === 0 ? "approach" : "hold", t: 0 };
}

export function advance(s: LoopState, dtMs: number): LoopState {
  let state = { ...s, t: s.t + Math.min(Math.max(dtMs, 0), MAX_STEP_MS) };
  while (state.t >= phaseMs(state)) {
    const left = state.t - phaseMs(state);
    state = { ...next(state), t: left };
  }
  return state;
}

/** power4.inOut, matching --ease-in-out. */
export function easeInOut(p: number): number {
  return p < 0.5 ? 8 * p ** 4 : 1 - (-2 * p + 2) ** 4 / 2;
}

export type Pose = {
  /** Stages being shown: from → to at t (0 to 1). Equal while holding. */
  from: number;
  to: number;
  t: number;
  /** The camera's approach to the MAVERN viewpoint, 0 to 1. */
  approach: number;
};

export function pose(s: LoopState): Pose {
  const p = Math.min(s.t / phaseMs(s), 1);
  if (s.phase === "approach") return { from: 0, to: 0, t: 0, approach: easeInOut(p) };
  if (s.phase === "hold") return { from: s.stage, to: s.stage, t: 0, approach: 1 };
  return { from: s.stage, to: (s.stage + 1) % STAGE_COUNT, t: easeInOut(p), approach: 1 };
}
