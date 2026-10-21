import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { decodePoints } from "@/components/hero/points";

function file(points: number[][]): ArrayBuffer {
  const buf = new ArrayBuffer(8 + points.length * 24);
  const view = new DataView(buf);
  [80, 84, 83, 49].forEach((c, i) => view.setUint8(i, c));
  view.setUint32(4, points.length, true);
  points.flat().forEach((v, i) => view.setFloat32(8 + i * 4, v, true));
  return buf;
}

describe("decodePoints", () => {
  it("reads positions and normals", () => {
    const d = decodePoints(file([[1, 2, 3, 0, 1, 0]]));
    expect(d.count).toBe(1);
    expect(Array.from(d.positions)).toEqual([1, 2, 3]);
    expect(Array.from(d.normals)).toEqual([0, 1, 0]);
  });

  it("rejects other files", () => {
    expect(() => decodePoints(new ArrayBuffer(8))).toThrow(/points/);
  });

  it("reads the baked diorama", () => {
    const raw = readFileSync("public/hero/diorama-points.bin");
    const d = decodePoints(raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength));
    expect(d.count).toBe(4000);
    for (let i = 0; i < d.count; i += 97) {
      expect(Math.hypot(d.normals[i * 3], d.normals[i * 3 + 1], d.normals[i * 3 + 2])).toBeCloseTo(1, 3);
      expect(d.positions[i * 3 + 1]).toBeGreaterThanOrEqual(-0.01);
    }
  });
});
