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
const ROOF_SHARE = 0.5;
/** A tower steps back by this share of its width every SETBACK_EVERY tiers, down to half its footprint. */
const SETBACK = 0.18;
const SETBACK_EVERY = 3;

/**
 * A city whose built-up blocks spell the word seen from above. Each lit pixel of the word is a block of
 * 2 × 2 lots; the blocks become equal tiers of a tower on each lot (every block gets one before any gets
 * two), stepping back every few tiers like a skyscraper.
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
      height: cell * (1 + rand() ** 2 * 5),
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
    const tier = l.height / tiers[j];
    const bottom = tier * t;
    const top = tier * (t + 1);
    const w = lot * 0.86 * Math.max(0.5, 1 - SETBACK * Math.floor(t / SETBACK_EVERY));
    positions.set([l.x, (bottom + top) / 2, l.z], n * 3);
    scales.set([w, top - bottom, w], n * 3);
    roof[n] = l.painted && t === tiers[j] - 1 ? 1 : 0;
  }
  return { positions, scales, roof, cell, width: CITY_WIDTH, depth, origin };
}
