import { describe, expect, it } from "vitest";
import { buildCity } from "@/components/hero/city";
import { bitmap } from "@/components/hero/pixelFont";

const word = "SOFTWARE";
const rows = bitmap(word);
const city = buildCity(word, 4000);
const cellOf = (i: number) => ({
  col: Math.floor((city.positions[i * 3] - city.origin[0]) / city.cell),
  row: Math.floor((city.positions[i * 3 + 2] - city.origin[1]) / city.cell),
});

describe("city", () => {
  it("gives every block one target", () => {
    expect(city.positions).toHaveLength(4000 * 3);
    expect(city.scales).toHaveLength(4000 * 3);
  });

  it("stands every tower on a block of the word", () => {
    for (let i = 0; i < 4000; i++) {
      const { col, row } = cellOf(i);
      expect(rows[row]?.[col], `block ${i}`).toBe(true);
    }
  });

  it("builds on every block of the word, so it reads from above", () => {
    const built = new Set(Array.from({ length: 4000 }, (_, i) => `${cellOf(i).col},${cellOf(i).row}`));
    const lit = rows.flatMap((r, y) => r.flatMap((on, x) => (on ? [`${x},${y}`] : [])));
    expect(built).toEqual(new Set(lit));
  });

  it("stands towers on the ground", () => {
    for (let i = 0; i < 4000; i++) expect(city.positions[i * 3 + 1] - city.scales[i * 3 + 1] / 2).toBeGreaterThanOrEqual(-1e-6);
  });

  it("marks the top tier of some towers as a roof", () => {
    const roofs = city.roof.reduce((n, v) => n + v, 0);
    expect(roofs).toBeGreaterThan(0);
    expect(roofs).toBeLessThan(4000 / 2);
  });

  it("fits the city to its width", () => {
    expect(city.cell * rows[0].length).toBeCloseTo(city.width);
  });
});
