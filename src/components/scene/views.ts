import * as THREE from "three";

/** Where the camera stands and what it looks at. */
export type Viewpoint = { eye: [number, number, number]; target: [number, number, number]; fov: number };

export function lerpView(a: Viewpoint, b: Viewpoint, t: number, lift = 0): { eye: THREE.Vector3; target: THREE.Vector3 } {
  const eye = new THREE.Vector3(...a.eye).lerp(new THREE.Vector3(...b.eye), t);
  eye.y += Math.sin(Math.PI * t) * lift;
  return { eye, target: new THREE.Vector3(...a.target).lerp(new THREE.Vector3(...b.target), t) };
}
