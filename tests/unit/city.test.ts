import { describe, expect, it } from "vitest";
import { CUBE_BELOW, assignKinds, buildCity, ElementKind } from "@/components/hero/city";
import { bitmap } from "@/components/hero/pixelFont";

const ao = Float32Array.from({ length: 3000 }, (_, i) => (i % 10) / 10);
const kinds = assignKinds(ao, 4);

function cellOf(x: number, z: number, city: ReturnType<typeof buildCity>) {
  return { col: Math.floor((x - city.origin[0]) / city.cell), row: Math.floor((z - city.origin[1]) / city.cell) };
}

describe("element kinds", () => {
  it("makes cubes of the occluded points", () => {
    ao.forEach((v, i) => {
      if (v < CUBE_BELOW) expect(kinds[i]).toBe(ElementKind.Cube);
    });
  });

  it("mixes letters and shapes among the lit points", () => {
    const lit = [...kinds].filter((_, i) => ao[i] >= CUBE_BELOW);
    expect(lit.filter((k) => k === ElementKind.Letter).length).toBeGreaterThan(lit.filter((k) => k === ElementKind.Shape).length);
    expect(lit).toContain(ElementKind.Shape);
  });
});

describe("city", () => {
  const word = "SOFTWARE";
  const rows = bitmap(word);
  const city = buildCity(word, kinds);

  it("gives every element one target", () => {
    expect(city.positions).toHaveLength(kinds.length * 3);
    expect(city.scales).toHaveLength(kinds.length * 3);
  });

  it("stands every tower on a block of the word", () => {
    kinds.forEach((k, i) => {
      if (k !== ElementKind.Cube) return;
      const { col, row } = cellOf(city.positions[i * 3], city.positions[i * 3 + 2], city);
      expect(rows[row]?.[col], `cube ${i} at ${col},${row}`).toBe(true);
    });
  });

  it("puts traffic only on streets", () => {
    kinds.forEach((k, i) => {
      if (k !== ElementKind.Shape) return;
      const { col, row } = cellOf(city.positions[i * 3], city.positions[i * 3 + 2], city);
      expect(rows[row]?.[col] ?? false, `shape ${i} at ${col},${row}`).toBe(false);
    });
  });

  it("builds on every block of the word, so it reads from above", () => {
    const built = new Set<string>();
    kinds.forEach((k, i) => {
      if (k !== ElementKind.Cube) return;
      const { col, row } = cellOf(city.positions[i * 3], city.positions[i * 3 + 2], city);
      built.add(`${col},${row}`);
    });
    const lit = rows.flatMap((r, y) => r.flatMap((on, x) => (on ? [`${x},${y}`] : [])));
    expect(built).toEqual(new Set(lit));
  });

  it("puts signs on rooftops, above street level", () => {
    kinds.forEach((k, i) => {
      if (k === ElementKind.Letter) expect(city.positions[i * 3 + 1]).toBeGreaterThan(0);
    });
  });

  it("fits the city to a fixed width", () => {
    expect(city.cell * rows[0].length).toBeCloseTo(city.width);
  });
});
