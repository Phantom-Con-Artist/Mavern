"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { featuredWorks } from "@/content/works";
import { grounds, toLinearRgb, type Ground } from "@/lib/color";
import { mulberry32 } from "@/lib/rand";
import { sliceWord } from "./anamorph";
import { buildCity } from "./city";
import { advance, pose, type LoopState } from "./loop";
import { decodePoints, type Points } from "./points";
import { cardTexture, wordTexture } from "./textures";
import { lerpView, type Viewpoint } from "./views";

type Props = { words: string[]; running: boolean; onStage: (stage: number) => void; onFail: () => void };

/** MAVERN reads whole from here, in front of the bust and a little to its right. */
const MAVERN_VIEW: Viewpoint = { eye: [1.5, 1.55, 4.6], target: [0.3, 1.05, 0.3], fov: 34 };
/** The approach starts here, where MAVERN's fragments are scattered. */
const APPROACH_VIEW: Viewpoint = { eye: [-3.2, 1.1, 3.4], target: [0.2, 0.9, 0.2], fov: 34 };
const WORD_LAYOUT = { distance: 3.1, width: 2.5 };
const BLOCK_SIZE = 0.05;
const MAX_DELAY = 0.4;

function linear(g: Ground): THREE.Color {
  const [r, gr, b] = toLinearRgb(grounds[g].value);
  return new THREE.Color().setRGB(r, gr, b, THREE.LinearSRGBColorSpace);
}

/** Over a city, steep but not vertical so towers and their shadows show; turned a little for each city. */
function cityView(stage: number, aspect: number): Viewpoint {
  const distance = Math.max(3.9, 2.45 / (Math.tan(THREE.MathUtils.degToRad(17)) * aspect));
  const turn = (stage - 2.5) * 0.12;
  return {
    eye: [Math.sin(turn) * distance * 0.3, distance * 0.96, Math.cos(turn) * distance * 0.3],
    target: [0, 0, 0],
    fov: 34,
  };
}

type Assets = { diorama: THREE.Group; points: Points; word: { texture: THREE.Texture; aspect: number }; cards: THREE.Texture[] };

/** Block poses for every stage: 0 is the diorama surface, 1… are the cities. */
function stagePoses(points: Points, words: string[]) {
  const n = points.count;
  const up = new THREE.Vector3(0, 1, 0);
  const normal = new THREE.Vector3();
  const stages = [
    {
      positions: points.positions,
      scales: new Float32Array(n * 3).fill(BLOCK_SIZE),
      quats: new Float32Array(n * 4),
      colours: new Uint8Array(n),
    },
    ...words.map((w) => {
      const city = buildCity(w, n);
      return { positions: city.positions, scales: city.scales, quats: new Float32Array(n * 4), colours: city.roof };
    }),
  ];
  const q = new THREE.Quaternion();
  for (let i = 0; i < n; i++) {
    q.setFromUnitVectors(up, normal.fromArray(points.normals, i * 3).normalize()).toArray(stages[0].quats, i * 4);
    for (const s of stages.slice(1)) new THREE.Quaternion().toArray(s.quats, i * 4);
  }
  return stages;
}

function Scene({ assets, words, running, onStage }: { assets: Assets } & Omit<Props, "onFail">) {
  const { camera, size } = useThree();
  const state = useRef<LoopState>({ stage: 0, phase: "approach", t: 0 });
  const lastStage = useRef(-1);
  const blocks = useRef<THREE.InstancedMesh>(null);
  const n = assets.points.count;

  const stages = useMemo(() => stagePoses(assets.points, words), [assets.points, words]);
  const delays = useMemo(() => {
    const rand = mulberry32(5);
    return Float32Array.from({ length: n }, (_, i) => {
      const height = assets.points.positions[i * 3 + 1] / 2.3;
      return (1 - Math.min(1, height)) * MAX_DELAY * 0.8 + rand() * MAX_DELAY * 0.2;
    });
  }, [assets.points, n]);

  const clay = useMemo(() => new THREE.MeshStandardMaterial({ color: linear("marble"), roughness: 0.82, transparent: true }), []);
  const palette = useMemo(() => [linear("marble"), linear("vermilion")], []);

  // Diorama meshes take the clay material and cast soft shadows.
  useEffect(() => {
    assets.diorama.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.material = clay;
        o.castShadow = o.receiveShadow = true;
      }
    });
  }, [assets.diorama, clay]);

  const wordMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({ map: assets.word.texture, color: linear("ultraviolet"), transparent: true, side: THREE.DoubleSide, depthWrite: false }),
    [assets.word],
  );
  const fragments = useMemo(() => {
    const layout = { ...WORD_LAYOUT, height: WORD_LAYOUT.width / assets.word.aspect };
    return sliceWord(MAVERN_VIEW, layout, { cols: 7, rows: 3 }, 21).map((f) => {
      const geometry = new THREE.PlaneGeometry(f.width, f.height);
      const uv = geometry.getAttribute("uv") as THREE.BufferAttribute;
      for (let k = 0; k < uv.count; k++) uv.setXY(k, f.uv[0] + uv.getX(k) * (f.uv[2] - f.uv[0]), f.uv[1] + uv.getY(k) * (f.uv[3] - f.uv[1]));
      const right = new THREE.Vector3(...f.right);
      const up = new THREE.Vector3(...f.up);
      const mesh = new THREE.Mesh(geometry, wordMaterial);
      mesh.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(right, up, new THREE.Vector3().crossVectors(right, up)));
      mesh.position.set(...f.center);
      return mesh;
    });
  }, [assets.word, wordMaterial]);

  const cards = useMemo(
    () =>
      assets.cards.map((map, i) => {
        const geometry = new THREE.PlaneGeometry(0.64, 0.8, 24, 1);
        const pos = geometry.getAttribute("position") as THREE.BufferAttribute;
        for (let k = 0; k < pos.count; k++) pos.setZ(k, -0.35 * pos.getX(k) ** 2);
        geometry.computeVertexNormals();
        const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ map, roughness: 0.7, side: THREE.DoubleSide, transparent: true }));
        const spots: [number, number, number, number][] = [
          [-1.95, 0.75, 0.9, 0.5],
          [2.45, 0.6, -0.35, -0.7],
          [-0.55, 1.55, 1.6, 0.2],
        ];
        const [x, y, z, ry] = spots[i % spots.length];
        mesh.position.set(x, y, z);
        mesh.rotation.y = ry;
        mesh.castShadow = true;
        return mesh;
      }),
    [assets.cards],
  );

  useEffect(
    () => () => {
      fragments.forEach((f) => f.geometry.dispose());
      cards.forEach((c) => {
        c.geometry.dispose();
        (c.material as THREE.Material).dispose();
      });
      wordMaterial.dispose();
      clay.dispose();
    },
    [fragments, cards, wordMaterial, clay],
  );

  const scratch = useMemo(
    () => ({
      m: new THREE.Matrix4(),
      p: new THREE.Vector3(),
      p2: new THREE.Vector3(),
      s: new THREE.Vector3(),
      s2: new THREE.Vector3(),
      q: new THREE.Quaternion(),
      q2: new THREE.Quaternion(),
      spin: new THREE.Quaternion(),
      c: new THREE.Color(),
      axis: new THREE.Vector3(0, 1, 0),
    }),
    [],
  );

  useFrame((_, delta) => {
    if (running) state.current = advance(state.current, delta * 1000);
    const s = state.current;
    const p = pose(s);
    if (s.stage !== lastStage.current) {
      lastStage.current = s.stage;
      onStage(s.stage);
    }

    // How solid the diorama is: fades out early in a move away from it and back in late on the way home.
    const leaving = p.from === 0 && p.to !== 0;
    const returning = p.to === 0 && p.from !== 0;
    const solid = leaving ? 1 - Math.min(1, p.t / 0.2) : returning ? Math.max(0, (p.t - 0.8) / 0.2) : p.from === 0 ? 1 : 0;
    clay.opacity = solid;
    assets.diorama.visible = solid > 0.001;
    clay.depthWrite = solid > 0.99;
    wordMaterial.opacity = solid;
    fragments.forEach((f) => (f.visible = solid > 0.001));
    cards.forEach((c) => {
      (c.material as THREE.MeshStandardMaterial).opacity = solid;
      c.visible = solid > 0.001;
    });

    // Blocks: hidden while the diorama is whole, otherwise flying between stage poses.
    const mesh = blocks.current;
    if (mesh) {
      mesh.visible = solid < 0.999;
      if (mesh.visible) {
        const a = stages[p.from];
        const b = stages[p.to];
        const { m, p: pa, p2: pb, s: sa, s2: sb, q: qa, q2: qb, spin, c, axis } = scratch;
        for (let i = 0; i < n; i++) {
          const e = p.from === p.to ? 0 : Math.min(1, Math.max(0, (p.t - delays[i]) / (1 - MAX_DELAY)));
          const k = e < 0.5 ? 4 * e ** 3 : 1 - (-2 * e + 2) ** 3 / 2;
          pa.fromArray(a.positions, i * 3).lerp(pb.fromArray(b.positions, i * 3), k);
          pa.y += Math.sin(Math.PI * k) * 0.9;
          sa.fromArray(a.scales, i * 3).lerp(sb.fromArray(b.scales, i * 3), k);
          qa.fromArray(a.quats, i * 4).slerp(qb.fromArray(b.quats, i * 4), k);
          qa.multiply(spin.setFromAxisAngle(axis, Math.sin(Math.PI * k) * Math.PI));
          mesh.setMatrixAt(i, m.compose(pa, qa, sa));
          mesh.setColorAt(i, c.copy(palette[a.colours[i]]).lerp(palette[b.colours[i]], k));
        }
        mesh.instanceMatrix.needsUpdate = true;
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      }
    }

    // Camera: approach the diorama, then travel with the blocks between stages.
    const aspect = size.width / size.height;
    const viewOf = (stage: number, arriving: boolean): Viewpoint => (stage === 0 ? (arriving ? APPROACH_VIEW : MAVERN_VIEW) : cityView(stage, aspect));
    const shot =
      s.phase === "approach"
        ? lerpView(APPROACH_VIEW, MAVERN_VIEW, p.approach)
        : lerpView(viewOf(p.from, false), viewOf(p.to, true), p.t, p.from === p.to ? 0 : 1.2);
    camera.position.copy(shot.eye);
    camera.lookAt(shot.target);
  });

  return (
    <>
      <hemisphereLight args={[linear("marble"), linear("sun"), 1.3]} />
      <directionalLight
        position={[4.5, 4.2, 3.2]}
        intensity={2.4}
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
        <shadowMaterial opacity={0.34} color={linear("ultraviolet")} />
      </mesh>
      <primitive object={assets.diorama} />
      {fragments.map((f, i) => (
        <primitive key={`f${i}`} object={f} />
      ))}
      {cards.map((c, i) => (
        <primitive key={`c${i}`} object={c} />
      ))}
      <instancedMesh ref={blocks} args={[undefined, undefined, n]} castShadow receiveShadow visible={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.8} />
      </instancedMesh>
    </>
  );
}

async function loadAssets(): Promise<Assets> {
  const [gltf, buffer, word, cards] = await Promise.all([
    new GLTFLoader().loadAsync("/hero/diorama.glb"),
    fetch("/hero/diorama-points.bin").then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(`points ${r.status}`)))),
    wordTexture("MAVERN"),
    Promise.all(
      featuredWorks()
        .slice(0, 3)
        .map((w) => cardTexture(w.name, w.summary, { card: grounds.vermilion.value, ink: grounds.ink.value })),
    ),
  ]);
  return { diorama: gltf.scene, points: decodePoints(buffer), word, cards };
}

/** The clay diorama with the sliced MAVERN; its blocks morph into a city for each medium and back. */
export default function DioramaScene({ words, running, onStage, onFail }: Props) {
  const [assets, setAssets] = useState<Assets | null>(null);
  // Held in a ref so a new callback from the parent does not reload the assets.
  const fail = useRef(onFail);
  fail.current = onFail;

  useEffect(() => {
    let cancelled = false;
    loadAssets()
      .then((a) => !cancelled && setAssets(a))
      .catch(() => !cancelled && fail.current());
    return () => {
      cancelled = true;
    };
  }, []);

  if (!assets) return null;

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      frameloop={running ? "always" : "demand"}
      camera={{ fov: MAVERN_VIEW.fov, near: 0.05, far: 60, position: APPROACH_VIEW.eye }}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          fail.current();
        });
      }}
    >
      <Scene assets={assets} words={words} running={running} onStage={onStage} />
    </Canvas>
  );
}

