import { mulberry32 } from "@/lib/rand";
import { bitmap } from "./pixelFont";

/** What each point of the head is drawn as. */
export const ElementKind = { Letter: 0, Cube: 1, Shape: 2 } as const;
export type ElementKind = (typeof ElementKind)[keyof typeof ElementKind];

/** Occlusion below which a point is a cube: about a fifth of the bust, its hair, brow, ears and jaw. */
export const CUBE_BELOW = 0.7;

/** Cubes fill the head's occluded hollows; the lit surface is mostly letters with some shapes. */
export function assignKinds(ao: Float32Array, seed: number, cubeBelow = CUBE_BELOW, shapeShare = 0.15): Uint8Array {
  const rand = mulberry32(seed);
  return Uint8Array.from(ao, (v) => (v < cubeBelow ? ElementKind.Cube : rand() < shapeShare ? ElementKind.Shape : ElementKind.Letter));
}

export type City = {
  /** Target centre per element, x across, y up, z down the page (row 0 at the top when seen from above). */
  positions: Float32Array;
  /** Target size per element: cubes are boxes, letters and shapes are flat squares. */
  scales: Float32Array;
  cell: number;
  width: number;
  depth: number;
  /** x and z of the city's top-left corner. */
  origin: [number, number];
};

const CITY_WIDTH = 1.6;
/** Tier boundaries of a tower as fractions of its height: each tier is shorter than the one below. */
const tierBase = (t: number) => 1 - 0.55 ** t;

/**
 * A top-down city whose built-up blocks spell the word. Each lit pixel of the word is a block of 2 × 2 lots;
 * cubes become stacked tower tiers on the lots (every block gets one before any gets two), letters become
 * signs on the roofs, shapes become traffic on the street cells.
 */
export function buildCity(word: string, kinds: Uint8Array, seed = 7): City {
  const rows = bitmap(word);
  const cols = rows[0].length;
  const cell = CITY_WIDTH / cols;
  const depth = cell * rows.length;
  const origin: [number, number] = [-CITY_WIDTH / 2, -depth / 2];
  const rand = mulberry32(seed);

  const blocks: [number, number][] = [];
  const streets: [number, number][] = [];
  rows.forEach((row, y) => row.forEach((on, x) => (on ? blocks : streets).push([x, y])));

  const lot = cell / 2;
  // Lots ordered so the first pass gives every block one lot before any block gets a second.
  const lots = [0, 1, 2, 3].flatMap((q) =>
    blocks.map(([x, y]) => ({
      x: origin[0] + x * cell + (q % 2) * lot + lot / 2,
      z: origin[1] + y * cell + Math.floor(q / 2) * lot + lot / 2,
      height: cell * (0.8 + rand() * 3.2),
      tiers: 0,
    })),
  );

  const positions = new Float32Array(kinds.length * 3);
  const scales = new Float32Array(kinds.length * 3);
  const cubes: number[] = [];
  const letters: number[] = [];
  const shapes: number[] = [];
  kinds.forEach((k, i) => (k === ElementKind.Cube ? cubes : k === ElementKind.Letter ? letters : shapes).push(i));

  const tiersPerLot = lots.map((_, j) => Math.floor(cubes.length / lots.length) + (j < cubes.length % lots.length ? 1 : 0));
  cubes.forEach((i, n) => {
    const l = lots[n % lots.length];
    const t = Math.floor(n / lots.length);
    const bottom = l.height * tierBase(t);
    const top = l.height * tierBase(t + 1);
    const w = lot * 0.82 * (1 - 0.16 * t);
    positions.set([l.x, (bottom + top) / 2, l.z], i * 3);
    scales.set([w, top - bottom, w], i * 3);
  });
  lots.forEach((l, j) => (l.tiers = tiersPerLot[j]));

  const roofs = lots.filter((l) => l.tiers > 0);
  letters.forEach((i, n) => {
    const l = roofs[n % roofs.length];
    const w = lot * 0.82 * (1 - 0.16 * (l.tiers - 1));
    const size = lot * 0.3;
    positions.set([l.x + (rand() - 0.5) * (w - size), l.height * tierBase(l.tiers) + 0.001, l.z + (rand() - 0.5) * (w - size)], i * 3);
    scales.set([size, size, size], i * 3);
  });

  shapes.forEach((i, n) => {
    const [x, y] = streets[n % streets.length];
    const size = cell * 0.18;
    positions.set([origin[0] + (x + 0.1 + rand() * 0.8) * cell, 0.001, origin[1] + (y + 0.1 + rand() * 0.8) * cell], i * 3);
    scales.set([size, size, size], i * 3);
  });

  return { positions, scales, cell, width: CITY_WIDTH, depth, origin };
}
