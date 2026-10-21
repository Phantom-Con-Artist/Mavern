// Samples the bust model (assets/models/marble-bust-01) into points for the hero: public/hero/bust.bin.
// Pure functions are exported for tests; running the file does the bake.
import { readFileSync, writeFileSync, mkdirSync, statSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const MODEL_DIR = "assets/models/marble-bust-01";
const OUT = "public/hero/bust.bin";
export const POINT_COUNT = 30000;
const SEED = 1859;

/** Positions, normals, UVs and indices of the first mesh primitive, with its node translation applied. */
export function readGltfMesh(gltf, bin) {
  const prim = gltf.meshes[0].primitives[0];
  const read = (index, Type) => {
    const acc = gltf.accessors[index];
    const view = gltf.bufferViews[acc.bufferView];
    const comps = { SCALAR: 1, VEC2: 2, VEC3: 3 }[acc.type];
    const offset = (view.byteOffset ?? 0) + (acc.byteOffset ?? 0);
    const src = new Type(bin.buffer, bin.byteOffset + offset, acc.count * comps);
    return Type === Uint16Array || Type === Uint32Array ? Uint32Array.from(src) : Float32Array.from(src);
  };
  const indexType = gltf.accessors[prim.indices].componentType === 5125 ? Uint32Array : Uint16Array;
  const positions = read(prim.attributes.POSITION, Float32Array);
  const t = gltf.nodes?.find((n) => n.mesh === 0)?.translation ?? [0, 0, 0];
  for (let i = 0; i < positions.length; i += 3) {
    positions[i] += t[0];
    positions[i + 1] += t[1];
    positions[i + 2] += t[2];
  }
  return {
    positions,
    normals: read(prim.attributes.NORMAL, Float32Array),
    uvs: read(prim.attributes.TEXCOORD_0, Float32Array),
    indices: read(prim.indices, indexType),
  };
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Area-weighted points on the surface, spread evenly: three times as many candidates are drawn and each is
 * kept only if no kept point lies closer than a spacing derived from the area; leftovers top up the count.
 * ao(u, v) returns ambient occlusion in [0, 1] (1 = fully lit) at a texture coordinate.
 */
export function samplePoints(mesh, count, seed, ao) {
  const { positions: P, normals: N, uvs: UV, indices: I } = mesh;
  const tris = I.length / 3;
  const cumulative = new Float64Array(tris);
  let total = 0;
  for (let t = 0; t < tris; t++) {
    const [a, b, c] = [I[t * 3] * 3, I[t * 3 + 1] * 3, I[t * 3 + 2] * 3];
    const ux = P[b] - P[a], uy = P[b + 1] - P[a + 1], uz = P[b + 2] - P[a + 2];
    const vx = P[c] - P[a], vy = P[c + 1] - P[a + 1], vz = P[c + 2] - P[a + 2];
    total += 0.5 * Math.hypot(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx);
    cumulative[t] = total;
  }

  const rand = mulberry32(seed);
  const candidate = () => {
    const r = rand() * total;
    let lo = 0, hi = tris - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cumulative[mid] < r) lo = mid + 1;
      else hi = mid;
    }
    let s = rand(), t = rand();
    if (s + t > 1) [s, t] = [1 - s, 1 - t];
    const w = [1 - s - t, s, t];
    const v = [I[lo * 3], I[lo * 3 + 1], I[lo * 3 + 2]];
    const mix = (arr, size, k) => w[0] * arr[v[0] * size + k] + w[1] * arr[v[1] * size + k] + w[2] * arr[v[2] * size + k];
    const pos = [mix(P, 3, 0), mix(P, 3, 1), mix(P, 3, 2)];
    const nrm = [mix(N, 3, 0), mix(N, 3, 1), mix(N, 3, 2)];
    const len = Math.hypot(...nrm) || 1;
    return { pos, nrm: nrm.map((x) => x / len), uv: [mix(UV, 2, 0), mix(UV, 2, 1)] };
  };

  const spacing = 0.7 * Math.sqrt(total / count);
  const cell = spacing;
  const grid = new Map();
  const key = (p) => `${Math.floor(p[0] / cell)},${Math.floor(p[1] / cell)},${Math.floor(p[2] / cell)}`;
  const near = (p) => {
    const [cx, cy, cz] = p.map((x) => Math.floor(x / cell));
    for (let dx = -1; dx <= 1; dx++)
      for (let dy = -1; dy <= 1; dy++)
        for (let dz = -1; dz <= 1; dz++)
          for (const q of grid.get(`${cx + dx},${cy + dy},${cz + dz}`) ?? [])
            if (Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]) < spacing) return true;
    return false;
  };

  const kept = [];
  const spare = [];
  for (let i = 0; i < count * 3 && kept.length < count; i++) {
    const c = candidate();
    if (near(c.pos)) spare.push(c);
    else {
      kept.push(c);
      const k = key(c.pos);
      grid.set(k, [...(grid.get(k) ?? []), c.pos]);
    }
  }
  while (kept.length < count) kept.push(spare.length ? spare.pop() : candidate());

  const positions = new Float32Array(count * 3);
  const normals = new Float32Array(count * 3);
  const aoValues = new Float32Array(count);
  kept.forEach((c, i) => {
    positions.set(c.pos, i * 3);
    normals.set(c.nrm, i * 3);
    aoValues[i] = Math.min(1, Math.max(0, ao(c.uv[0], c.uv[1])));
  });
  return { positions, normals, ao: aoValues };
}

/**
 * Binary layout (little endian): "BUST", uint32 count, float32 min xyz, float32 max xyz, then per point
 * int16 xyz (position scaled into the box), int8 xyz (normal × 127), uint8 occlusion × 255.
 */
export function encodeBust({ positions, normals, ao }) {
  const count = ao.length;
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < count; i++)
    for (let k = 0; k < 3; k++) {
      min[k] = Math.min(min[k], positions[i * 3 + k]);
      max[k] = Math.max(max[k], positions[i * 3 + k]);
    }
  const header = 32;
  const buf = new ArrayBuffer(header + count * 10);
  const view = new DataView(buf);
  [66, 85, 83, 84].forEach((c, i) => view.setUint8(i, c));
  view.setUint32(4, count, true);
  for (let k = 0; k < 3; k++) {
    view.setFloat32(8 + k * 4, min[k], true);
    view.setFloat32(20 + k * 4, max[k], true);
  }
  for (let i = 0; i < count; i++) {
    const o = header + i * 10;
    for (let k = 0; k < 3; k++) {
      const span = max[k] - min[k] || 1;
      view.setInt16(o + k * 2, Math.round(((positions[i * 3 + k] - min[k]) / span) * 65535 - 32768), true);
      view.setInt8(o + 6 + k, Math.round(normals[i * 3 + k] * 127));
    }
    view.setUint8(o + 9, Math.round(ao[i] * 255));
  }
  return new Uint8Array(buf);
}

async function main() {
  const gltfPath = `${MODEL_DIR}/marble_bust_01.gltf`;
  if (existsSync(OUT) && statSync(OUT).mtimeMs > statSync(gltfPath).mtimeMs && statSync(OUT).mtimeMs > statSync(fileURLToPath(import.meta.url)).mtimeMs) {
    console.log("bust: up to date");
    return;
  }
  const sharp = (await import("sharp")).default;
  const { data, info } = await sharp(`${MODEL_DIR}/marble_bust_01_ao_1k.jpg`).greyscale().raw().toBuffer({ resolveWithObject: true });
  const ao = (u, v) => {
    const x = Math.min(info.width - 1, Math.max(0, Math.floor(u * info.width)));
    const y = Math.min(info.height - 1, Math.max(0, Math.floor(v * info.height)));
    return data[y * info.width + x] / 255;
  };
  const mesh = readGltfMesh(JSON.parse(readFileSync(gltfPath, "utf8")), readFileSync(`${MODEL_DIR}/marble_bust_01.bin`));
  const bytes = encodeBust(samplePoints(mesh, POINT_COUNT, SEED, ao));
  mkdirSync("public/hero", { recursive: true });
  writeFileSync(OUT, bytes);
  console.log(`bust: ${POINT_COUNT} points, ${(bytes.byteLength / 1024).toFixed(0)} KB → ${OUT}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
