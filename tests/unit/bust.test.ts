import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { encodeBust, readGltfMesh, samplePoints } from "../../scripts/build-bust.mjs";
import { decodeBust } from "@/components/hero/bust";

const triangle = {
  positions: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]),
  normals: new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]),
  uvs: new Float32Array([0, 0, 1, 0, 0, 1]),
  indices: new Uint32Array([0, 1, 2]),
};

describe("bust bake", () => {
  it("samples exactly the requested number of points", () => {
    const s = samplePoints(triangle, 500, 7, () => 0.5);
    expect(s.positions).toHaveLength(1500);
    expect(s.ao).toHaveLength(500);
  });

  it("is deterministic for a seed", () => {
    const a = samplePoints(triangle, 200, 7, () => 1);
    const b = samplePoints(triangle, 200, 7, () => 1);
    expect(Array.from(a.positions)).toEqual(Array.from(b.positions));
  });

  it("keeps every point on the triangle", () => {
    const s = samplePoints(triangle, 300, 3, () => 1);
    for (let i = 0; i < 300; i++) {
      const [x, y, z] = [s.positions[i * 3], s.positions[i * 3 + 1], s.positions[i * 3 + 2]];
      expect(z).toBeCloseTo(0);
      expect(x).toBeGreaterThanOrEqual(-1e-6);
      expect(y).toBeGreaterThanOrEqual(-1e-6);
      expect(x + y).toBeLessThanOrEqual(1 + 1e-6);
    }
  });

  it("reads occlusion at each point's texture coordinate", () => {
    const s = samplePoints(triangle, 50, 3, (u: number) => u);
    for (let i = 0; i < 50; i++) expect(s.ao[i]).toBeCloseTo(s.positions[i * 3], 5);
  });

  it("round-trips through the binary format within quantisation error", () => {
    const s = samplePoints(triangle, 100, 5, () => 0.25);
    const bytes = encodeBust(s);
    const d = decodeBust(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
    expect(d.count).toBe(100);
    for (let i = 0; i < 300; i++) expect(d.positions[i]).toBeCloseTo(s.positions[i], 3);
    for (let i = 0; i < 100; i++) {
      const n = Math.hypot(d.normals[i * 3], d.normals[i * 3 + 1], d.normals[i * 3 + 2]);
      expect(n).toBeCloseTo(1, 1);
      expect(d.ao[i]).toBeCloseTo(0.25, 2);
    }
  });

  it("reads the real bust", () => {
    const gltf = JSON.parse(readFileSync("assets/models/marble-bust-01/marble_bust_01.gltf", "utf8"));
    const bin = readFileSync("assets/models/marble-bust-01/marble_bust_01.bin");
    const mesh = readGltfMesh(gltf, bin);
    expect(mesh.positions.length / 3).toBe(9746);
    expect(mesh.indices.length).toBe(52368);
  });
});
