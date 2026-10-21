"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { acceleratedRaycast, computeBoundsTree } from "three-mesh-bvh";
import { sliceWordOnto } from "./anamorph";
import type { Ground } from "@/lib/color";
import { linear } from "./colour";
import { fragmentMesh } from "./Diorama";
import { wordTexture } from "./textures";
import cameras from "./city-cameras.json";
import type { Viewpoint } from "./views";

/*
  The Punkkyber city (scripts/blender/city-export.py), seen at night. Each medium word is
  cut into pieces hung along the camera's lines of sight in front of the buildings, so the pieces only
  read as the word from that word's viewpoint.
*/
/** The city's own cameras, exported beside the model (scripts/blender/city-export.py). */
const cam = (name: keyof typeof cameras): Viewpoint => cameras[name] as Viewpoint;
export const cityViews: Record<string, Viewpoint> = {
  sky: cam("CAM_09_Sky_Dive"),
  "word-0": cam("CAM_02_POV_NorthAvenue"),
  "word-1": cam("CAM_05_EastStreet"),
  "word-2": cam("CAM_01_POV_Hero"),
  "word-3": cam("CAM_07_WestStreet"),
  aerial: cam("CAM_06_Aerial"),
};

const WORDS: { word: string; colour: Ground }[] = [
  { word: "SOFTWARE", colour: "gold" },
  { word: "WEBSITES", colour: "orchid" },
  { word: "APPS", colour: "ember" },
  { word: "EXPERIMENTS", colour: "marble" },
];
const WORD_DISTANCE = 6;
const WORD_WIDTH_SHARE = 0.78;
/** Height of each word's centre above the view's centre, as a share of the frame. */
const WORD_RISE = 0.18;

export type CityAssets = { scene: THREE.Group; words: { texture: THREE.Texture; aspect: number }[] };

export async function loadCity(loader: { loadAsync: (url: string) => Promise<{ scene: THREE.Group }> }): Promise<CityAssets> {
  const [gltf, words] = await Promise.all([loader.loadAsync("/hero/city.glb"), Promise.all(WORDS.map((w) => wordTexture(w.word)))]);
  return { scene: gltf.scene, words };
}

THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;

/** Dark facades get rows of lit windows, drawn from world position so no texture is needed. */
function windowed(material: THREE.MeshStandardMaterial) {
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vWorldPos;\nvarying vec3 vWorldNormal;")
      .replace(
        "#include <worldpos_vertex>",
        "#include <worldpos_vertex>\nvWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;\nvWorldNormal = normalize(mat3(modelMatrix) * objectNormal);",
      );
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vWorldPos;\nvarying vec3 vWorldNormal;")
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        if (abs(vWorldNormal.y) < 0.3 && vWorldPos.y > 3.0) {
          vec2 cell = floor(vec2((vWorldPos.x + vWorldPos.z) / 1.7, vWorldPos.y / 2.3));
          vec2 inCell = fract(vec2((vWorldPos.x + vWorldPos.z) / 1.7, vWorldPos.y / 2.3));
          float lit = step(0.62, fract(sin(dot(cell, vec2(12.9898, 78.233))) * 43758.5453));
          float pane = step(0.2, inCell.x) * step(inCell.x, 0.8) * step(0.25, inCell.y) * step(inCell.y, 0.75);
          vec3 tint = mix(vec3(1.0, 0.62, 0.25), vec3(0.35, 0.85, 1.0), step(0.5, fract(cell.x * 0.37 + cell.y * 0.11)));
          totalEmissiveRadiance += tint * lit * pane * 1.6;
        }`,
      );
  };
  material.customProgramCacheKey = () => "windowed";
}

/** The night avenue with its four hung neon words. Words are re-hung when the screen's shape changes. */
export function City({ assets, visible, aspect }: { assets: CityAssets; visible: boolean; aspect: number }) {
  useEffect(() => {
    assets.scene.traverse((o) => {
      if (!(o instanceof THREE.Mesh)) return;
      const m = o.material as THREE.MeshStandardMaterial;
      if (m.name.startsWith("web_Facade")) windowed(m);
      else if (m.name === "web_Asphalt_Wet") {
        m.roughness = 0.18;
        m.metalness = 0.4;
      }
      else if (m.emissive && m.emissive.getHex() !== 0) {
        // Screens and billboards are near white in the source; keep them from burning out the frame.
        const bright = m.emissive.r + m.emissive.g + m.emissive.b > 2.4;
        m.emissiveIntensity = bright ? 0.22 : Math.max(m.emissiveIntensity, 2.2);
        if (bright) {
          m.color.setScalar(0.04);
          m.emissive.lerp(linear("violet"), 0.55);
        }
      }
    });
  }, [assets.scene]);

  const words = useMemo(() => {
    const raycaster = new THREE.Raycaster();
    raycaster.firstHitOnly = true;
    const targets: THREE.Mesh[] = [];
    assets.scene.updateMatrixWorld(true);
    assets.scene.traverse((o) => o instanceof THREE.Mesh && targets.push(o));
    // A bounding-volume tree per mesh, built once: without it each ray tests all 180k triangles.
    for (const mesh of targets) {
      if (!mesh.geometry.boundsTree) mesh.geometry.computeBoundsTree();
      mesh.raycast = acceleratedRaycast;
    }
    return WORDS.map((w, k) => {
      const view = cityViews[`word-${k}`];
      const eye = new THREE.Vector3(...view.eye);
      const frameH = 2 * WORD_DISTANCE * Math.tan(THREE.MathUtils.degToRad(view.fov / 2));
      const width = Math.min(frameH * aspect * WORD_WIDTH_SHARE, frameH * 1.6);
      const { texture, aspect: textAspect } = assets.words[k];
      // Raise the word by tilting the viewpoint's target: the slice maths centres the word on it.
      const forward = new THREE.Vector3(...view.target).sub(eye).normalize();
      const lifted: Viewpoint = { ...view, target: eye.clone().add(forward).addScaledVector(new THREE.Vector3(0, 1, 0), WORD_RISE * (frameH / WORD_DISTANCE)).toArray() };
      const material = new THREE.MeshBasicMaterial({ map: texture, color: linear(w.colour).multiplyScalar(2.2), transparent: true, side: THREE.DoubleSide, depthWrite: false, toneMapped: false, fog: false });
      const fragments = sliceWordOnto(
        lifted,
        { distance: WORD_DISTANCE, width, height: width / textAspect },
        { cols: w.word.length * 2, rows: 2 },
        41 + k,
        (dir) => {
          raycaster.set(eye, dir);
          return raycaster.intersectObjects(targets, false)[0]?.distance ?? null;
        },
        { gap: 0.6, hang: [0.72, 1], sky: [3, 7] },
      );
      return { material, meshes: fragments.map((f) => fragmentMesh(f, material)) };
    });
  }, [assets, aspect]);

  useEffect(
    () => () =>
      words.forEach((w) => {
        w.meshes.forEach((m) => m.geometry.dispose());
        w.material.dispose();
      }),
    [words],
  );

  return (
    <group visible={visible}>
      <ambientLight intensity={0.35} color={linear("violet")} />
      <hemisphereLight args={[linear("violet"), linear("night"), 0.6]} />
      <primitive object={assets.scene} />
      {words.flatMap((w, k) => w.meshes.map((m, i) => <primitive key={`${k}-${i}`} object={m} />))}
    </group>
  );
}
