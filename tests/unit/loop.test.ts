import { describe, expect, it } from "vitest";
import { STAGE_COUNT, advance, phaseMs, pose, type LoopState } from "@/components/hero/loop";

const start: LoopState = { stage: 0, phase: "approach", t: 0 };

function run(s: LoopState, ms: number): LoopState {
  for (let left = ms; left > 0; left -= 50) s = advance(s, Math.min(50, left));
  return s;
}

function cycleMs() {
  let s = start;
  let total = 0;
  do {
    total += phaseMs(s);
    s = advance({ ...s, t: phaseMs(s) - 1 }, 1);
  } while (!(s.stage === 0 && s.phase === "approach"));
  return total;
}

describe("hero loop", () => {
  it("has the diorama and one city per medium", () => {
    expect(STAGE_COUNT).toBe(5);
  });

  it("approaches the diorama, holds, then morphs to the first city", () => {
    let s = run(start, phaseMs(start));
    expect(s).toMatchObject({ stage: 0, phase: "hold" });
    s = run(s, phaseMs(s));
    expect(s).toMatchObject({ stage: 0, phase: "move" });
    s = run(s, phaseMs(s));
    expect(s).toMatchObject({ stage: 1, phase: "hold" });
  });

  it("goes through every city and back to the diorama", () => {
    expect(run(start, cycleMs())).toMatchObject({ stage: 0, phase: "approach" });
  });

  it("never jumps more than 100 ms in one step", () => {
    expect(advance(start, 5000)).toEqual({ stage: 0, phase: "approach", t: 100 });
  });

  it("holds still on the stage it is showing", () => {
    expect(pose({ stage: 2, phase: "hold", t: 300 })).toMatchObject({ from: 2, to: 2, t: 0 });
    expect(pose({ stage: 0, phase: "hold", t: 300 })).toMatchObject({ from: 0, to: 0, t: 0, approach: 1 });
  });

  it("moves to the next stage, and from the last city back to the diorama", () => {
    expect(pose({ stage: 1, phase: "move", t: 0 })).toMatchObject({ from: 1, to: 2, t: 0 });
    expect(pose({ stage: 4, phase: "move", t: 1e9 })).toMatchObject({ from: 4, to: 0, t: 1 });
  });

  it("approaches the MAVERN viewpoint from 0 to 1", () => {
    expect(pose({ stage: 0, phase: "approach", t: 0 }).approach).toBe(0);
    expect(pose({ stage: 0, phase: "approach", t: 1e9 }).approach).toBeCloseTo(1);
  });
});
