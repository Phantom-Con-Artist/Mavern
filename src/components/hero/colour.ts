import * as THREE from "three";
import { grounds, toLinearRgb, type Ground } from "@/lib/color";

/** A palette token as a three.js colour in linear space. */
export function linear(g: Ground): THREE.Color {
  const [r, gr, b] = toLinearRgb(grounds[g].value);
  return new THREE.Color().setRGB(r, gr, b, THREE.LinearSRGBColorSpace);
}
