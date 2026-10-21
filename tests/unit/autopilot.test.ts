import { describe, expect, it } from "vitest";
import { legDuration, plan, positionAt } from "@/components/autopilot/plan";

const vh = 900;
const sections = [
  { top: 0, height: 2700, stops: [0, 0.5], holds: [2000, 1000] },
  { top: 2700, height: 900, stops: [0], holds: [3000] },
];

describe("autopilot plan", () => {
  it("turns section stops into page positions with holds, in order", () => {
    expect(plan(sections, vh)).toEqual([
      { y: 0, hold: 2000 },
      { y: 900, hold: 1000 },
      { y: 2700, hold: 3000 },
    ]);
  });

  it("never plans past the bottom of the page", () => {
    const stops = plan([{ top: 0, height: 1000, stops: [0, 1], holds: [0, 0] }], vh, 1200);
    expect(Math.max(...stops.map((s) => s.y))).toBeLessThanOrEqual(1200 - vh);
  });

  it("takes longer for longer legs, within bounds", () => {
    expect(legDuration(100)).toBe(1400);
    expect(legDuration(20000)).toBe(9000);
    expect(legDuration(3000)).toBeGreaterThan(legDuration(1500));
  });

  it("holds at a stop, then eases to the next one", () => {
    const stops = [{ y: 0, hold: 1000 }, { y: 1000, hold: 0 }];
    expect(positionAt(stops, 500)).toEqual({ y: 0, done: false });
    const leg = legDuration(1000);
    expect(positionAt(stops, 1000 + leg / 2).y).toBeCloseTo(500, 6);
    expect(positionAt(stops, 1000 + leg + 10)).toEqual({ y: 1000, done: true });
  });
});
