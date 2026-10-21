import * as THREE from "three";
import type { BustPoints } from "./bust";
import { bitmap } from "./pixelFont";

export type View = { azimuth: number; elevation: number; distance: number; target: [number, number, number]; fov: number };

/** Where MAVERN reads from: in front of the face and a little to its left. The bust faces +z. */
export const WORD_VIEW: View = { azimuth: -0.55, elevation: 0.1, distance: 1.05, target: [0.013, 0.3, 0], fov: 30 };

/** Width of the word on the face, in model units (the bust is about 0.27 wide), and how far above the target it sits. */
const WORD_WIDTH = 0.3;
const WORD_RISE = 0.06;

export function viewPosition(v: View): THREE.Vector3 {
  const [x, y, z] = v.target;
  return new THREE.Vector3(
    x + Math.sin(v.azimuth) * Math.cos(v.elevation) * v.distance,
    y + Math.sin(v.elevation) * v.distance,
    z + Math.cos(v.azimuth) * Math.cos(v.elevation) * v.distance,
  );
}

export function cameraFor(v: View, aspect: number): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(v.fov, aspect, 0.01, 20);
  camera.position.copy(viewPosition(v));
  camera.lookAt(...v.target);
  camera.updateMatrixWorld();
  return camera;
}

export type WordMask = {
  rows: boolean[][];
  cols: number;
  /** The word's rectangle on screen, in normalised device coordinates. */
  fit: { left: number; top: number; width: number; height: number };
};

/** The word's block bitmap, placed across the face as seen by this camera, keeping its proportions. */
export function wordMask(word: string, camera: THREE.PerspectiveCamera): WordMask {
  const rows = bitmap(word);
  const cols = rows[0].length;
  const halfHeight = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.distanceTo(new THREE.Vector3(...WORD_VIEW.target));
  const width = WORD_WIDTH / (halfHeight * camera.aspect);
  const height = (WORD_WIDTH * rows.length) / cols / halfHeight;
  const centerY = WORD_RISE / halfHeight;
  return { rows, cols, fit: { left: -width / 2, top: centerY + height / 2, width, height } };
}

/** How squarely a point must face the camera to light (cosine): grazing points on the silhouette never do. */
const FACING = 0.25;

/** 1 for each point that faces the camera and lands inside the word's outline on screen, else 0. */
export function litForView(points: BustPoints, camera: THREE.PerspectiveCamera, mask: WordMask): Uint8Array {
  const lit = new Uint8Array(points.count);
  const p = new THREE.Vector3();
  const n = new THREE.Vector3();
  const toEye = new THREE.Vector3();
  const { fit, rows, cols } = mask;
  for (let i = 0; i < points.count; i++) {
    p.fromArray(points.positions, i * 3);
    n.fromArray(points.normals, i * 3);
    if (n.dot(toEye.copy(camera.position).sub(p).normalize()) <= FACING) continue;
    p.project(camera);
    const mx = Math.floor(((p.x - fit.left) / fit.width) * cols);
    const my = Math.floor(((fit.top - p.y) / fit.height) * rows.length);
    if (rows[my]?.[mx]) lit[i] = 1;
  }
  return lit;
}
