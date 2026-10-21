import * as THREE from "three";
import { mulberry32 } from "@/lib/rand";
import type { Viewpoint } from "./views";

/** How far a fragment may sit in front of (below 1) or behind (above 1) the flat word, as a share of its distance. */
export const DEPTH_RANGE: [number, number] = [0.55, 1.5];

/** The flat word: a rectangle facing the viewpoint, `distance` along its line of sight. */
export type WordLayout = { distance: number; width: number; height: number };

export type Fragment = {
  /** Texture rectangle [u0, v0, u1, v1], v up. */
  uv: [number, number, number, number];
  depth: number;
  center: [number, number, number];
  right: [number, number, number];
  up: [number, number, number];
  width: number;
  height: number;
};

function frame(view: Viewpoint, layout: WordLayout) {
  const eye = new THREE.Vector3(...view.eye);
  const dir = new THREE.Vector3(...view.target).sub(eye).normalize();
  const right = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize();
  const up = new THREE.Vector3().crossVectors(right, dir);
  const center = eye.clone().addScaledVector(dir, layout.distance);
  const at = (u: number, v: number) =>
    center
      .clone()
      .addScaledVector(right, (u - 0.5) * layout.width)
      .addScaledVector(up, (v - 0.5) * layout.height);
  return { eye, right, up, at };
}

/** Corners of the flat word's rectangle for a texture rectangle, in the order u0v0, u1v0, u1v1, u0v1. */
export function referenceCorners(view: Viewpoint, layout: WordLayout, uv: Fragment["uv"]): THREE.Vector3[] {
  const { at } = frame(view, layout);
  const [u0, v0, u1, v1] = uv;
  return [at(u0, v0), at(u1, v0), at(u1, v1), at(u0, v1)];
}

export function fragmentCorners(f: Fragment): THREE.Vector3[] {
  const c = new THREE.Vector3(...f.center);
  const r = new THREE.Vector3(...f.right).multiplyScalar(f.width / 2);
  const u = new THREE.Vector3(...f.up).multiplyScalar(f.height / 2);
  return [c.clone().sub(r).sub(u), c.clone().add(r).sub(u), c.clone().add(r).add(u), c.clone().sub(r).add(u)];
}

/** Cut points between 0 and 1, evenly spaced and nudged so the cuts look hand-made. */
function cuts(n: number, rand: () => number): number[] {
  return Array.from({ length: n + 1 }, (_, k) => (k === 0 || k === n ? k / n : (k + (rand() - 0.5) * 0.5) / n));
}

type Cell = { uv: Fragment["uv"]; mid: THREE.Vector3 };

function cells(view: Viewpoint, layout: WordLayout, grid: { cols: number; rows: number }, rand: () => number) {
  const xs = cuts(grid.cols, rand);
  const ys = cuts(grid.rows, rand);
  const f = frame(view, layout);
  const out: Cell[] = [];
  for (let j = 0; j < grid.rows; j++)
    for (let i = 0; i < grid.cols; i++) {
      const uv: Fragment["uv"] = [xs[i], ys[j], xs[i + 1], ys[j + 1]];
      out.push({ uv, mid: f.at((uv[0] + uv[2]) / 2, (uv[1] + uv[3]) / 2) });
    }
  return { ...f, cells: out };
}

function fragmentAt(eye: THREE.Vector3, right: THREE.Vector3, up: THREE.Vector3, layout: WordLayout, cell: Cell, depth: number): Fragment {
  const center = eye.clone().add(cell.mid.clone().sub(eye).multiplyScalar(depth));
  return {
    uv: cell.uv,
    depth,
    center: center.toArray(),
    right: right.toArray(),
    up: up.toArray(),
    width: (cell.uv[2] - cell.uv[0]) * layout.width * depth,
    height: (cell.uv[3] - cell.uv[1]) * layout.height * depth,
  };
}

/**
 * Cuts the word into a grid of fragments and pushes each along the lines of sight from the viewpoint to
 * its own depth, scaled to match: from the viewpoint the word reads flat and whole, from anywhere else
 * its fragments separate.
 */
export function sliceWord(view: Viewpoint, layout: WordLayout, grid: { cols: number; rows: number }, seed: number): Fragment[] {
  const rand = mulberry32(seed);
  const { eye, right, up, cells: list } = cells(view, layout, grid, rand);
  return list.map((cell) => fragmentAt(eye, right, up, layout, cell, DEPTH_RANGE[0] + rand() * (DEPTH_RANGE[1] - DEPTH_RANGE[0])));
}

export type HangOptions = {
  /** Closest a fragment may come to the surface behind it, measured along the viewpoint's line of sight. */
  gap: number;
  /** Where between the viewpoint and that surface a fragment hangs, as a share of the furthest it may go. */
  hang: [number, number];
  /** Depth range for fragments whose lines of sight meet nothing. */
  sky: [number, number];
};

/**
 * Like sliceWord, but each fragment hangs in front of whatever its lines of sight meet first: nearestHit
 * returns the distance along a unit direction from the eye to the first surface, or null for open sky.
 * Probed on a 3 × 3 grid across each fragment so no part of it sinks into a wall.
 */
export function sliceWordOnto(
  view: Viewpoint,
  layout: WordLayout,
  grid: { cols: number; rows: number },
  seed: number,
  nearestHit: (direction: THREE.Vector3) => number | null,
  options: HangOptions,
): Fragment[] {
  const rand = mulberry32(seed);
  const { eye, right, up, at, cells: list } = cells(view, layout, grid, rand);
  const forward = new THREE.Vector3().crossVectors(up, right);
  return list.map((cell) => {
    let furthest = Infinity;
    for (let a = 0; a <= 2; a++)
      for (let b = 0; b <= 2; b++) {
        const u = cell.uv[0] + ((cell.uv[2] - cell.uv[0]) * a) / 2;
        const v = cell.uv[1] + ((cell.uv[3] - cell.uv[1]) * b) / 2;
        const point = at(u, v).sub(eye);
        const distance = point.length();
        const direction = point.divideScalar(distance);
        const hit = nearestHit(direction);
        if (hit === null) continue;
        const along = Math.max(direction.dot(forward), 1e-3);
        furthest = Math.min(furthest, (hit - options.gap / along) / distance);
      }
    const depth =
      furthest === Infinity
        ? options.sky[0] + rand() * (options.sky[1] - options.sky[0])
        : Math.max(0.15, furthest * (options.hang[0] + rand() * (options.hang[1] - options.hang[0])));
    return fragmentAt(eye, right, up, layout, cell, depth);
  });
}
