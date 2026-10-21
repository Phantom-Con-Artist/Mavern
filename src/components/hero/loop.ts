/*
  The hero's cycle, as pure functions so it can be tested without a renderer. The head never moves by
  itself; the camera does, and the elements morph between the head and the city:
  head (three-quarter view) → camera flies to the MAVERN viewpoint → MAVERN lights → the head transforms
  into a city as the camera rises overhead → the city spells the medium → it folds back into the head.
*/
export type LoopPhase = "head" | "toWord" | "word" | "toCity" | "city" | "toHead";
export type ViewName = "head" | "word" | "city";
export type LoopState = { phase: LoopPhase; t: number; word: number };

export const PHASES: LoopPhase[] = ["head", "toWord", "word", "toCity", "city", "toHead"];

export const PHASE_MS: Record<LoopPhase, number> = {
  head: 1600,
  toWord: 1600,
  word: 2200,
  toCity: 2600,
  city: 2800,
  toHead: 2400,
};

/** Longest step taken at once, so a tab that was hidden resumes where it was instead of skipping ahead. */
const MAX_STEP_MS = 100;
/** Share of the word phase spent lighting up and, at its end, dimming. */
const LIGHT_SHARE = 0.18;

export function advance(s: LoopState, dtMs: number, wordCount: number): LoopState {
  let { phase, t, word } = s;
  t += Math.min(Math.max(dtMs, 0), MAX_STEP_MS);
  while (t >= PHASE_MS[phase]) {
    t -= PHASE_MS[phase];
    if (phase === "toHead") word = (word + 1) % wordCount;
    phase = PHASES[(PHASES.indexOf(phase) + 1) % PHASES.length];
  }
  return { phase, t, word };
}

/** power4.inOut, matching --ease-in-out. */
export function easeInOut(p: number): number {
  return p < 0.5 ? 8 * p ** 4 : 1 - (-2 * p + 2) ** 4 / 2;
}

export type Pose = {
  camera: { from: ViewName; to: ViewName; t: number };
  /** How lit MAVERN is, 0 to 1. */
  lit: number;
  /** 0 is the head, 1 is the city. Per-element delays are applied on top of this in the shader. */
  morph: number;
};

export function pose(s: LoopState): Pose {
  const p = Math.min(s.t / PHASE_MS[s.phase], 1);
  const still = (view: ViewName) => ({ from: view, to: view, t: 0 });
  switch (s.phase) {
    case "head":
      return { camera: still("head"), lit: 0, morph: 0 };
    case "toWord":
      return { camera: { from: "head", to: "word", t: easeInOut(p) }, lit: 0, morph: 0 };
    case "word": {
      const lit = Math.min(p / LIGHT_SHARE, 1, (1 - p) / LIGHT_SHARE + 0.0001);
      return { camera: still("word"), lit: Math.min(1, Math.max(0, lit)), morph: 0 };
    }
    case "toCity":
      return { camera: { from: "word", to: "city", t: easeInOut(p) }, lit: 0, morph: p };
    case "city":
      return { camera: still("city"), lit: 0, morph: 1 };
    case "toHead":
      return { camera: { from: "city", to: "head", t: easeInOut(p) }, lit: 0, morph: 1 - p };
  }
}
