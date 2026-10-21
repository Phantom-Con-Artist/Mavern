import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { DEPTH_RANGE, fragmentCorners, referenceCorners, sliceWord } from "@/components/hero/anamorph";
import type { Viewpoint } from "@/components/hero/views";

const view: Viewpoint = { eye: [2, 1.2, 4], target: [0, 0.6, 0], fov: 32 };
const layout = { distance: 3, width: 2.4, height: 0.5 };
const fragments = sliceWord(view, layout, { cols: 6, rows: 2 }, 11);

function camera(v: Viewpoint) {
  const c = new THREE.PerspectiveCamera(v.fov, 16 / 9, 0.01, 100);
  c.position.set(...v.eye);
  c.lookAt(...v.target);
  c.updateMatrixWorld();
  return c;
}
const project = (p: THREE.Vector3, c: THREE.Camera) => p.clone().project(c);

describe("sliced word", () => {
  it("cuts the word into the grid", () => {
    expect(fragments).toHaveLength(12);
  });

  it("covers the texture exactly once", () => {
    const area = fragments.reduce((sum, f) => sum + (f.uv[2] - f.uv[0]) * (f.uv[3] - f.uv[1]), 0);
    expect(area).toBeCloseTo(1, 6);
  });

  it("reads flat and whole from its viewpoint", () => {
    const c = camera(view);
    for (const f of fragments) {
      const actual = fragmentCorners(f).map((p) => project(p, c));
      const expected = referenceCorners(view, layout, f.uv).map((p) => project(p, c));
      actual.forEach((p, k) => {
        expect(p.x).toBeCloseTo(expected[k].x, 5);
        expect(p.y).toBeCloseTo(expected[k].y, 5);
      });
    }
  });

  it("falls apart from another viewpoint", () => {
    const c = camera({ ...view, eye: [-3, 1.2, 3] });
    const drift = fragments.map((f) => {
      const a = project(fragmentCorners(f)[0], c);
      const b = project(referenceCorners(view, layout, f.uv)[0], c);
      return Math.hypot(a.x - b.x, a.y - b.y);
    });
    expect(Math.max(...drift)).toBeGreaterThan(0.05);
  });

  it("keeps depths within range and varied", () => {
    for (const f of fragments) {
      expect(f.depth).toBeGreaterThanOrEqual(DEPTH_RANGE[0]);
      expect(f.depth).toBeLessThanOrEqual(DEPTH_RANGE[1]);
    }
    expect(new Set(fragments.map((f) => f.depth.toFixed(2))).size).toBeGreaterThan(4);
  });

  it("is the same for the same seed", () => {
    expect(sliceWord(view, layout, { cols: 6, rows: 2 }, 11)).toEqual(fragments);
  });
});
