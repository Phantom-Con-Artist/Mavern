/** The baked bust (scripts/build-bust.mjs explains the format), decoded into plain arrays. */
export type BustPoints = { count: number; positions: Float32Array; normals: Float32Array; ao: Float32Array };

export function decodeBust(buffer: ArrayBuffer): BustPoints {
  const view = new DataView(buffer);
  const magic = String.fromCharCode(...[0, 1, 2, 3].map((i) => view.getUint8(i)));
  if (magic !== "BUST") throw new Error("Not a bust file");
  const count = view.getUint32(4, true);
  const min = [0, 1, 2].map((k) => view.getFloat32(8 + k * 4, true));
  const max = [0, 1, 2].map((k) => view.getFloat32(20 + k * 4, true));
  const positions = new Float32Array(count * 3);
  const normals = new Float32Array(count * 3);
  const ao = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const o = 32 + i * 10;
    for (let k = 0; k < 3; k++) {
      positions[i * 3 + k] = min[k] + ((view.getInt16(o + k * 2, true) + 32768) / 65535) * (max[k] - min[k]);
      normals[i * 3 + k] = view.getInt8(o + 6 + k) / 127;
    }
    ao[i] = view.getUint8(o + 9) / 255;
  }
  return { count, positions, normals, ao };
}
