/** Surface samples of the diorama, baked in Blender: "PTS1", uint32 count, then float32 position xyz and normal xyz. */
export type Points = { count: number; positions: Float32Array; normals: Float32Array };

export function decodePoints(buffer: ArrayBuffer): Points {
  const view = new DataView(buffer);
  const magic = buffer.byteLength >= 4 ? String.fromCharCode(...new Uint8Array(buffer, 0, 4)) : "";
  if (magic !== "PTS1") throw new Error("Not a diorama points file");
  const count = view.getUint32(4, true);
  const floats = new Float32Array(buffer.slice(8, 8 + count * 24));
  const positions = new Float32Array(count * 3);
  const normals = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions.set(floats.subarray(i * 6, i * 6 + 3), i * 3);
    normals.set(floats.subarray(i * 6 + 3, i * 6 + 6), i * 3);
  }
  return { count, positions, normals };
}
