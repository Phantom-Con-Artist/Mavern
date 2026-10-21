"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { featuredWorks } from "@/content/works";
import { grounds } from "@/lib/color";
import { sliceWord } from "./anamorph";
import { linear } from "./colour";
import { cardTexture, wordTexture } from "./textures";
import type { Viewpoint } from "./views";

/** MAVERN reads whole from here, in front of the bust and a little to its right. */
const MAVERN_VIEW: Viewpoint = { eye: [1.5, 1.55, 4.6], target: [0.3, 1.05, 0.3], fov: 34 };
/** Where MAVERN's fragments are scattered: the approach starts here. */
const APPROACH_VIEW: Viewpoint = { eye: [-3.2, 1.1, 3.4], target: [0.2, 0.9, 0.2], fov: 34 };
/** The statue's camera-right eye (found by ray casts in Blender) and the direction its face looks. */
const EYE: [number, number, number] = [0.3097, 1.566, -0.2621];
const FACING: [number, number, number] = [-0.2419, 0, 0.9703];
/** Right up against the eye with a long lens, so the move there reads as a zoom into it. */
const EYE_VIEW: Viewpoint = {
  eye: [EYE[0] + FACING[0] * 0.02, EYE[1], EYE[2] + FACING[2] * 0.02],
  target: [EYE[0] - FACING[0], EYE[1], EYE[2] - FACING[2]],
  fov: 12,
};

export const dioramaViews = { approach: APPROACH_VIEW, mavern: MAVERN_VIEW, eye: EYE_VIEW };

export type DioramaAssets = { scene: THREE.Group; word: { texture: THREE.Texture; aspect: number }; cards: THREE.Texture[] };

export async function loadDiorama(loader: { loadAsync: (url: string) => Promise<{ scene: THREE.Group }> }): Promise<DioramaAssets> {
  const [gltf, word, cards] = await Promise.all([
    loader.loadAsync("/hero/diorama.glb"),
    wordTexture("MAVERN"),
    Promise.all(
      featuredWorks()
        .slice(0, 3)
        .map((w) => cardTexture(w.name, w.summary, { card: grounds.orchid.value, ink: grounds.night.value })),
    ),
  ]);
  return { scene: gltf.scene, word, cards };
}

const CARD_SPOTS: [number, number, number, number][] = [
  [-1.95, 0.75, 0.9, 0.5],
  [2.45, 0.6, -0.35, -0.7],
  [-0.55, 1.55, 1.6, 0.2],
];

/** The clay diorama at dusk: the bust in its arch, columns and steps, the sliced MAVERN, and three work cards. */
export function Diorama({ assets, visible }: { assets: DioramaAssets; visible: boolean }) {
  const clay = useMemo(() => new THREE.MeshStandardMaterial({ color: linear("marble"), roughness: 0.82 }), []);

  useEffect(() => {
    assets.scene.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.material = clay;
        o.castShadow = o.receiveShadow = true;
      }
    });
  }, [assets.scene, clay]);

  const word = useMemo(() => {
    const material = new THREE.MeshBasicMaterial({ map: assets.word.texture, color: linear("night"), transparent: true, side: THREE.DoubleSide, depthWrite: false });
    const layout = { distance: 3.1, width: 2.5, height: 2.5 / assets.word.aspect };
    const meshes = sliceWord(MAVERN_VIEW, layout, { cols: 7, rows: 3 }, 21).map((f) => fragmentMesh(f, material));
    return { material, meshes };
  }, [assets.word]);

  const cards = useMemo(
    () =>
      assets.cards.map((map, i) => {
        const geometry = new THREE.PlaneGeometry(0.64, 0.8, 24, 1);
        const pos = geometry.getAttribute("position") as THREE.BufferAttribute;
        for (let k = 0; k < pos.count; k++) pos.setZ(k, -0.35 * pos.getX(k) ** 2);
        geometry.computeVertexNormals();
        const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ map, roughness: 0.7, side: THREE.DoubleSide }));
        const [x, y, z, ry] = CARD_SPOTS[i % CARD_SPOTS.length];
        mesh.position.set(x, y, z);
        mesh.rotation.y = ry;
        mesh.castShadow = true;
        return mesh;
      }),
    [assets.cards],
  );

  useEffect(
    () => () => {
      word.meshes.forEach((m) => m.geometry.dispose());
      word.material.dispose();
      cards.forEach((c) => {
        c.geometry.dispose();
        (c.material as THREE.Material).dispose();
      });
      clay.dispose();
    },
    [word, cards, clay],
  );

  return (
    <group visible={visible}>
      <hemisphereLight args={[linear("orchid"), linear("ember"), 1.1]} />
      <directionalLight
        position={[4.5, 4.2, 3.2]}
        intensity={2.6}
        color={linear("gold")}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
        shadow-bias={-0.0005}
      />
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <shadowMaterial opacity={0.4} color={linear("night")} />
      </mesh>
      <primitive object={assets.scene} />
      {word.meshes.map((m, i) => (
        <primitive key={`w${i}`} object={m} />
      ))}
      {cards.map((c, i) => (
        <primitive key={`c${i}`} object={c} />
      ))}
    </group>
  );
}

/** A flat fragment of a word texture, placed and turned as the slice maths says. */
export function fragmentMesh(f: import("./anamorph").Fragment, material: THREE.Material): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(f.width, f.height);
  const uv = geometry.getAttribute("uv") as THREE.BufferAttribute;
  for (let k = 0; k < uv.count; k++) uv.setXY(k, f.uv[0] + uv.getX(k) * (f.uv[2] - f.uv[0]), f.uv[1] + uv.getY(k) * (f.uv[3] - f.uv[1]));
  const right = new THREE.Vector3(...f.right);
  const up = new THREE.Vector3(...f.up);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(right, up, new THREE.Vector3().crossVectors(right, up)));
  mesh.position.set(...f.center);
  return mesh;
}
