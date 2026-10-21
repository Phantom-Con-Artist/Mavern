import { bitmap } from "./pixelFont";

export type Cube = { x: number; y: number };

export type Sculpture = {
  /** Fixed front positions: seen head-on, the cubes spell the front word. */
  cubes: Cube[];
  /** depths[w][i]: cube i's depth for side word w. Seen from the side, the cubes spell that word. */
  depths: number[][];
  frontWidth: number;
  sideWidths: number[];
};

function litColumns(row: boolean[]): number[] {
  return row.flatMap((on, x) => (on ? [x] : []));
}

/**
 * Places the fewest cubes per row that cover both projections at once: every lit column of the front
 * word and every lit column of each side word. Each row gets as many cubes as its busiest word needs,
 * so switching words only moves cubes in depth and never adds or removes one.
 */
export function buildSculpture(front: string, words: string[]): Sculpture {
  const frontRows = bitmap(front);
  const sideRows = words.map(bitmap);
  const cubes: Cube[] = [];
  const depths: number[][] = words.map(() => []);

  frontRows.forEach((row, y) => {
    const f = litColumns(row);
    const sides = sideRows.map((rows) => litColumns(rows[y]));
    const busiest = Math.max(f.length, ...sides.map((s) => s.length));
    if (busiest === 0) return;
    if (f.length === 0 || sides.some((s) => s.length === 0)) {
      throw new Error(`Row ${y} is empty in one word but not another; the projections cannot both be exact`);
    }
    for (let i = 0; i < busiest; i++) {
      cubes.push({ x: f[i % f.length], y });
      sides.forEach((s, w) => depths[w].push(s[i % s.length]));
    }
  });

  return { cubes, depths, frontWidth: frontRows[0].length, sideWidths: sideRows.map((r) => r[0].length) };
}

/** Centre of cube i while morphing from side word `from` to `to`: x right, y up, z towards the viewer. */
export function cubePosition(s: Sculpture, i: number, from: number, to: number, morph: number): [number, number, number] {
  const lerp = (a: number, b: number) => a + (b - a) * morph;
  const sideWidth = lerp(s.sideWidths[from], s.sideWidths[to]);
  const depth = lerp(s.depths[from][i], s.depths[to][i]);
  const rows = Math.max(...s.cubes.map((c) => c.y)) + 1;
  const { x, y } = s.cubes[i];
  return [x - (s.frontWidth - 1) / 2, (rows - 1) / 2 - y, depth - (sideWidth - 1) / 2];
}
