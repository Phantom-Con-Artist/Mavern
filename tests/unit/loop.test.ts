import { describe, expect, it } from "vitest";
import { SEGMENTS, advance, pose, type LoopState } from "@/components/hero/loop";

const start: LoopState = { segment: 0, t: 0 };
const at = (segment: number, share: number): LoopState => ({ segment, t: SEGMENTS[segment].ms * share });
const index = (name: string) => SEGMENTS.findIndex((s) => s.name === name);

describe("hero loop", () => {
  it("approaches the diorama, locks MAVERN, then zooms into the statue's eye", () => {
    expect(SEGMENTS.slice(0, 3).map((s) => s.name)).toEqual(["approach", "mavern", "eye"]);
    expect(SEGMENTS.slice(0, 3).every((s) => s.scene === "diorama")).toBe(true);
    expect(SEGMENTS.slice(3).every((s) => s.scene === "city")).toBe(true);
  });

  it("holds once on each medium's viewpoint, in order", () => {
    const holds = SEGMENTS.filter((s) => s.name.startsWith("hold-"));
    expect(holds.map((s) => s.medium)).toEqual([0, 1, 2, 3]);
    for (const h of holds) expect(h.from).toBe(h.to);
  });

  it("chains camera poses: each segment starts where the last one ended", () => {
    SEGMENTS.forEach((s, i) => {
      const prev = SEGMENTS[(i - 1 + SEGMENTS.length) % SEGMENTS.length];
      if (prev.scene === s.scene) expect(s.from, s.name).toBe(prev.to);
    });
  });

  it("sees the whole city from the sky, then dives to the first word", () => {
    expect(SEGMENTS.slice(3, 5).map((s) => [s.name, s.from, s.to])).toEqual([
      ["glance", "sky", "sky"],
      ["dive", "sky", "word-0"],
    ]);
  });

  it("washes across each change of scene: ink out of the eye, sun back to the diorama", () => {
    expect(pose(at(index("eye"), 1))).toMatchObject({ wash: 1, washColour: "ink" });
    expect(pose(at(index("glance"), 0))).toMatchObject({ wash: 1, washColour: "ink" });
    expect(pose(at(index("rise"), 1))).toMatchObject({ wash: 1, washColour: "sun" });
    expect(pose(at(0, 0))).toMatchObject({ wash: 1, washColour: "sun" });
    for (const name of ["mavern", "hold-0", "hold-3"]) expect(pose(at(index(name), 0.5)).wash).toBe(0);
  });

  it("goes round and back to the start", () => {
    let s = start;
    const total = SEGMENTS.reduce((n, seg) => n + seg.ms, 0);
    for (let left = total; left > 0; left -= 50) s = advance(s, Math.min(50, left));
    expect(s.segment).toBe(0);
  });

  it("never jumps more than 100 ms in one step", () => {
    expect(advance(start, 5000)).toEqual({ segment: 0, t: 100 });
  });

  it("eases camera travel from 0 to 1", () => {
    expect(pose(at(index("move-1"), 0)).t).toBe(0);
    expect(pose(at(index("move-1"), 1)).t).toBeCloseTo(1);
  });
});
