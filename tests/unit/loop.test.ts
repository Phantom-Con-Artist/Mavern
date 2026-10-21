import { describe, expect, it } from "vitest";
import { PHASE_MS, advance, pose, type LoopPhase, type LoopState } from "@/components/hero/loop";

const order: LoopPhase[] = ["holdFront", "turnOut", "holdSide", "turnBack", "morph"];
const start: LoopState = { phase: "holdFront", t: 0, word: 0 };

function run(s: LoopState, ms: number, words = 4): LoopState {
  for (let left = ms; left > 0; left -= 50) s = advance(s, Math.min(50, left), words);
  return s;
}

describe("hero loop", () => {
  it("steps through the phases in order", () => {
    let s = start;
    for (let i = 1; i < order.length; i++) {
      s = run(s, PHASE_MS[order[i - 1]]);
      expect(s.phase).toBe(order[i]);
    }
  });

  it("moves to the next word only after the morph", () => {
    const beforeMorph = run(start, PHASE_MS.holdFront + PHASE_MS.turnOut + PHASE_MS.holdSide + PHASE_MS.turnBack);
    expect(beforeMorph.word).toBe(0);
    const after = run(beforeMorph, PHASE_MS.morph);
    expect(after).toMatchObject({ phase: "holdFront", word: 1 });
  });

  it("wraps after the last word", () => {
    const cycle = order.reduce((sum, p) => sum + PHASE_MS[p], 0);
    expect(run(start, cycle * 4).word).toBe(0);
  });

  it("never jumps more than 100 ms in one step", () => {
    const s = advance(start, 5000, 4);
    expect(s).toEqual({ phase: "holdFront", t: 100, word: 0 });
  });

  it("faces front while holding and morphing, sideways while holding the side", () => {
    expect(pose({ phase: "holdFront", t: 500, word: 0 }).yaw).toBe(0);
    expect(pose({ phase: "morph", t: 300, word: 0 }).yaw).toBe(0);
    expect(pose({ phase: "holdSide", t: 300, word: 0 }).yaw).toBeCloseTo(Math.PI / 2);
  });

  it("tilts only mid-turn", () => {
    expect(pose({ phase: "turnOut", t: 0, word: 0 }).pitch).toBeCloseTo(0);
    expect(pose({ phase: "turnOut", t: PHASE_MS.turnOut, word: 0 }).pitch).toBeCloseTo(0);
    expect(pose({ phase: "turnOut", t: PHASE_MS.turnOut / 2, word: 0 }).pitch).toBeCloseTo(0.25);
  });

  it("morphs from 0 to 1 only in the morph phase", () => {
    expect(pose({ phase: "holdSide", t: 100, word: 0 }).morph).toBe(0);
    expect(pose({ phase: "morph", t: 0, word: 0 }).morph).toBe(0);
    expect(pose({ phase: "morph", t: PHASE_MS.morph, word: 0 }).morph).toBeCloseTo(1);
  });
});
