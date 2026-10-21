import { describe, expect, it } from "vitest";
import { PHASES, PHASE_MS, advance, pose, type LoopState } from "@/components/hero/loop";

const start: LoopState = { phase: "head", t: 0, word: 0 };
const cycle = PHASES.reduce((sum, p) => sum + PHASE_MS[p], 0);

function run(s: LoopState, ms: number, words = 4): LoopState {
  for (let left = ms; left > 0; left -= 50) s = advance(s, Math.min(50, left), words);
  return s;
}

describe("hero loop", () => {
  it("steps through the phases in order", () => {
    let s = start;
    for (let i = 1; i < PHASES.length; i++) {
      s = run(s, PHASE_MS[PHASES[i - 1]]);
      expect(s.phase).toBe(PHASES[i]);
    }
  });

  it("moves to the next medium only when the city has folded back into the head", () => {
    const almost = run(start, cycle - 50);
    expect(almost).toMatchObject({ phase: "toHead", word: 0 });
    expect(run(almost, 50)).toMatchObject({ phase: "head", word: 1 });
  });

  it("wraps after the last medium", () => {
    expect(run(start, cycle * 4).word).toBe(0);
  });

  it("never jumps more than 100 ms in one step", () => {
    expect(advance(start, 5000, 4)).toEqual({ phase: "head", t: 100, word: 0 });
  });

  it("only lights MAVERN while the camera is at its viewpoint", () => {
    expect(pose({ phase: "head", t: 500, word: 0 }).lit).toBe(0);
    expect(pose({ phase: "toWord", t: 500, word: 0 }).lit).toBe(0);
    expect(pose({ phase: "word", t: PHASE_MS.word / 2, word: 0 }).lit).toBe(1);
    expect(pose({ phase: "city", t: 10, word: 0 }).lit).toBe(0);
  });

  it("is fully a head or fully a city outside the morphs", () => {
    expect(pose({ phase: "word", t: 300, word: 0 }).morph).toBe(0);
    expect(pose({ phase: "city", t: 300, word: 0 }).morph).toBe(1);
    expect(pose({ phase: "toCity", t: PHASE_MS.toCity, word: 0 }).morph).toBeCloseTo(1);
    expect(pose({ phase: "toHead", t: PHASE_MS.toHead, word: 0 }).morph).toBeCloseTo(0);
  });

  it("moves the camera between named views", () => {
    expect(pose({ phase: "head", t: 0, word: 0 }).camera).toMatchObject({ from: "head", to: "head" });
    expect(pose({ phase: "toWord", t: 0, word: 0 }).camera).toMatchObject({ from: "head", to: "word", t: 0 });
    expect(pose({ phase: "toCity", t: PHASE_MS.toCity, word: 0 }).camera).toMatchObject({ from: "word", to: "city", t: 1 });
    expect(pose({ phase: "toHead", t: 0, word: 0 }).camera).toMatchObject({ from: "city", to: "head", t: 0 });
  });
});
