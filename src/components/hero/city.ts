import { mulberry32 } from "@/lib/rand";
import { bitmap } from "./pixelFont";

export type City = {
  /** Centre of each block's tower tier: x across, y up, z down the page (row 0 at the top seen from above). */
  positions: Float32Array;
  /** Size of each tier. */
  scales: Float32Array;
  /** 1 where the tier is a tower's roof painted vermilion. */
  roof: Uint8Array;
  cell: number;
  width: number;
  depth: number;
  /** x and z of the city's top-left corner. */
  origin: [number, number];
};

const CITY_WIDTH = 3.6;
const ROOF_SHARE = 0.35;
/** Tier boundaries as fractions of a tower's height: each tier is shorter than the one below. */
const tierBase = (t: number) => 1 - 0.6 ** t;

/**
 * A city whose built-up blocks spell the word seen from above. Each lit pixel of the word is a block of
 * 2 × 2 lots; the blocks become stacked tower tiers on the lots, every block getting one before any gets two.
 */
export function buildCity(word: string, count: number, seed = 7): City {
  const rows = bitmap(word);
  const cols = rows[0].length;
  const cell = CITY_WIDTH / cols;
  const depth = cell * rows.length;
  const origin: [number, number] = [-CITY_WIDTH / 2, -depth / 2];
  const rand = mulberry32(seed);
  const lot = cell / 2;

  const blocks: [number, number][] = [];
  rows.forEach((row, y) => row.forEach((on, x) => on && blocks.push([x, y])));
  const lots = [0, 1, 2, 3].flatMap((q) =>
    blocks.map(([x, y]) => ({
      x: origin[0] + x * cell + (q % 2) * lot + lot / 2,
      z: origin[1] + y * cell + Math.floor(q / 2) * lot + lot / 2,
      height: cell * (0.6 + rand() ** 2 * 3.4),
      painted: rand() < ROOF_SHARE,
    })),
  );
  const tiers = lots.map((_, j) => Math.floor(count / lots.length) + (j < count % lots.length ? 1 : 0));

  const positions = new Float32Array(count * 3);
  const scales = new Float32Array(count * 3);
  const roof = new Uint8Array(count);
  for (let n = 0; n < count; n++) {
    const j = n % lots.length;
    const l = lots[j];
    const t = Math.floor(n / lots.length);
    const bottom = l.height * tierBase(t);
    const top = l.height * tierBase(t + 1);
    const w = lot * 0.86 * (1 - 0.14 * t);
    positions.set([l.x, (bottom + top) / 2, l.z], n * 3);
    scales.set([w, top - bottom, w], n * 3);
    roof[n] = l.painted && t === tiers[j] - 1 ? 1 : 0;
  }
  return { positions, scales, roof, cell, width: CITY_WIDTH, depth, origin };
}
