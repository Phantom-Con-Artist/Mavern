import { readFileSync } from "node:fs";
import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { decodeBust } from "@/components/hero/bust";
import { WORD_VIEW, cameraFor, litForView, wordMask } from "@/components/hero/words";

const raw = readFileSync("public/hero/bust.bin");
const bust = decodeBust(raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength));

describe("word viewpoint", () => {
  const camera = cameraFor(WORD_VIEW, 1);
  const mask = wordMask("MAVERN", camera);
  const lit = litForView(bust, camera, mask);

  it("lights enough points to read", () => {
    expect(lit.reduce((n, v) => n + v, 0)).toBeGreaterThanOrEqual(300);
  });

  it("lights only points facing the camera", () => {
    const p = new THREE.Vector3();
    const n = new THREE.Vector3();
    for (let i = 0; i < bust.count; i++) {
      if (!lit[i]) continue;
      p.fromArray(bust.positions, i * 3);
      n.fromArray(bust.normals, i * 3);
      expect(n.dot(camera.position.clone().sub(p))).toBeGreaterThan(0);
    }
  });

  it("lights nothing that projects outside the word", () => {
    const fit = mask.fit;
    const p = new THREE.Vector3();
    for (let i = 0; i < bust.count; i++) {
      if (!lit[i]) continue;
      p.fromArray(bust.positions, i * 3).project(camera);
      const mx = Math.floor(((p.x - fit.left) / fit.width) * mask.cols);
      const my = Math.floor(((fit.top - p.y) / fit.height) * mask.rows.length);
      expect(mask.rows[my]?.[mx]).toBe(true);
    }
  });

  it("reads only from its own viewpoint", () => {
    const other = cameraFor({ ...WORD_VIEW, azimuth: WORD_VIEW.azimuth + Math.PI }, 1);
    const fromBehind = litForView(bust, other, wordMask("MAVERN", other));
    const both = lit.reduce((n, v, i) => n + (v && fromBehind[i] ? 1 : 0), 0);
    expect(both).toBe(0);
  });
});
