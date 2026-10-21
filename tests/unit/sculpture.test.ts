import { describe, expect, it } from "vitest";
import { GAP, GLYPH_H, GLYPH_W, bitmap } from "@/components/hero/pixelFont";
import { buildSculpture, cubePosition } from "@/components/hero/sculpture";
import { mediums } from "@/content/mediums";

const words = mediums.map((m) => m.word);

function litPixels(rows: boolean[][]): Set<string> {
  const set = new Set<string>();
  rows.forEach((row, y) => row.forEach((on, x) => on && set.add(`${x},${y}`)));
  return set;
}

describe("pixel font", () => {
  it("draws every letter the sculpture needs", () => {
    for (const word of ["MAVERN", ...words]) expect(() => bitmap(word)).not.toThrow();
  });

  it("throws on a letter it does not have", () => {
    expect(() => bitmap("MAVERN?")).toThrow(/\?/);
  });

  it("sizes a word from its glyphs and gaps", () => {
    const rows = bitmap("APPS");
    expect(rows).toHaveLength(GLYPH_H);
    expect(rows[0]).toHaveLength(4 * GLYPH_W + 3 * GAP);
  });
});

describe("sculpture", () => {
  const s = buildSculpture("MAVERN", words);

  it("spells MAVERN from the front", () => {
    const front = new Set(s.cubes.map((c) => `${c.x},${c.y}`));
    expect(front).toEqual(litPixels(bitmap("MAVERN")));
  });

  it.each(words.map((w, i) => [w, i] as const))("spells %s from the side", (word, i) => {
    const side = new Set(s.cubes.map((c, j) => `${s.depths[i][j]},${c.y}`));
    expect(side).toEqual(litPixels(bitmap(word)));
  });

  it("gives every word a depth for every cube", () => {
    for (const d of s.depths) expect(d).toHaveLength(s.cubes.length);
  });

  it("stays light enough to render", () => {
    expect(s.cubes.length).toBeLessThanOrEqual(400);
  });

  it("reports the widths", () => {
    expect(s.frontWidth).toBe(bitmap("MAVERN")[0].length);
    expect(s.sideWidths).toEqual(words.map((w) => bitmap(w)[0].length));
  });
});

describe("cube positions", () => {
  const s = buildSculpture("MAVERN", ["APPS"]);

  /** Where a position lands on screen after the sculpture turns by yaw about the vertical axis (three.js convention). */
  const screenX = ([x, , z]: [number, number, number], yaw: number) => x * Math.cos(yaw) + z * Math.sin(yaw);

  it("reads left to right from the side after a quarter turn", () => {
    const order = s.cubes.map((_, i) => i).sort((a, b) => s.depths[0][a] - s.depths[0][b]);
    const first = order[0];
    const last = order[order.length - 1];
    const turned = (i: number) => screenX(cubePosition(s, i, 0, 0, 0), Math.PI / 2);
    expect(turned(last)).toBeGreaterThan(turned(first));
  });

  it("reads left to right from the front", () => {
    const xs = s.cubes.map((_, i) => cubePosition(s, i, 0, 0, 0)[0]);
    const leftmost = s.cubes.findIndex((c) => c.x === 0);
    expect(xs[leftmost]).toBe(Math.min(...xs));
  });

  it("puts row 0 at the top", () => {
    const top = s.cubes.findIndex((c) => c.y === 0);
    const bottom = s.cubes.findIndex((c) => c.y === 6);
    expect(cubePosition(s, top, 0, 0, 0)[1]).toBeGreaterThan(cubePosition(s, bottom, 0, 0, 0)[1]);
  });
});
