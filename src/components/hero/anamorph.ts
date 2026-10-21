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

/**
 * Cuts the word into a grid of fragments and pushes each along the lines of sight from the viewpoint to
 * its own depth, scaled to match: from the viewpoint the word reads flat and whole, from anywhere else
 * its fragments separate.
 */
export function sliceWord(view: Viewpoint, layout: WordLayout, grid: { cols: number; rows: number }, seed: number): Fragment[] {
  const rand = mulberry32(seed);
  const xs = cuts(grid.cols, rand);
  const ys = cuts(grid.rows, rand);
  const { eye, right, up, at } = frame(view, layout);
  const fragments: Fragment[] = [];
  for (let j = 0; j < grid.rows; j++)
    for (let i = 0; i < grid.cols; i++) {
      const uv: Fragment["uv"] = [xs[i], ys[j], xs[i + 1], ys[j + 1]];
      const depth = DEPTH_RANGE[0] + rand() * (DEPTH_RANGE[1] - DEPTH_RANGE[0]);
      const mid = at((uv[0] + uv[2]) / 2, (uv[1] + uv[3]) / 2);
      const center = eye.clone().add(mid.sub(eye).multiplyScalar(depth));
      fragments.push({
        uv,
        depth,
        center: center.toArray(),
        right: right.toArray(),
        up: up.toArray(),
        width: (uv[2] - uv[0]) * layout.width * depth,
        height: (uv[3] - uv[1]) * layout.height * depth,
      });
    }
  return fragments;
}
