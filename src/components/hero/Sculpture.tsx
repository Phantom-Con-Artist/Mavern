"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { grounds, toLinearRgb, type Ground } from "@/lib/color";
import { GLYPH_H } from "./pixelFont";
import { advance, pose, type LoopState } from "./loop";
import { buildSculpture, cubePosition } from "./sculpture";

type Props = {
  words: string[];
  running: boolean;
  /** Called when the word the sculpture is about to show changes. */
  onWord: (index: number) => void;
  /** Called if WebGL fails, so the hero can fall back to the still picture. */
  onFail: () => void;
};

function tokenColor(g: Ground): THREE.Color {
  const [r, gr, b] = toLinearRgb(grounds[g].value);
  return new THREE.Color().setRGB(r, gr, b, THREE.LinearSRGBColorSpace);
}

const CUBE = 0.9;

function Blocks({ words, running, onWord }: Omit<Props, "onFail">) {
  const sculpture = useMemo(() => buildSculpture("MAVERN", words), [words]);
  const mesh = useRef<THREE.InstancedMesh>(null);
  const yawGroup = useRef<THREE.Group>(null);
  const pitchGroup = useRef<THREE.Group>(null);
  const state = useRef<LoopState>({ phase: "holdFront", t: 0, word: 0 });
  const lastWord = useRef(-1);
  const matrix = useMemo(() => new THREE.Matrix4(), []);
  const { camera, size } = useThree();

  const geometry = useMemo(() => new THREE.BoxGeometry(CUBE, CUBE, CUBE), []);
  // Face order: +x, -x, +y, -y, +z, -z.
  const materials = useMemo(() => {
    const side = new THREE.MeshBasicMaterial({ color: tokenColor("vermilion") });
    const top = new THREE.MeshBasicMaterial({ color: tokenColor("marble") });
    const bottom = new THREE.MeshBasicMaterial({ color: tokenColor("ink") });
    const front = new THREE.MeshBasicMaterial({ color: tokenColor("sun") });
    return [side, side, top, bottom, front, front];
  }, []);
  const grid = useMemo(() => {
    const helper = new THREE.GridHelper(240, 120, tokenColor("sun"), tokenColor("sun"));
    const material = helper.material as THREE.Material;
    material.transparent = true;
    material.opacity = 0.35;
    helper.position.y = -GLYPH_H / 2 - 0.1;
    return helper;
  }, []);

  useEffect(() => () => {
    geometry.dispose();
    new Set(materials).forEach((m) => m.dispose());
  }, [geometry, materials]);

  useFrame((_, delta) => {
    const words_ = sculpture.depths.length;
    if (running) state.current = advance(state.current, delta * 1000, words_);
    const s = state.current;
    const { yaw, pitch, morph } = pose(s);
    const from = s.word;
    const to = (s.word + 1) % words_;

    if (from !== lastWord.current) {
      lastWord.current = from;
      onWord(from);
    }

    const sideWidth = THREE.MathUtils.lerp(sculpture.sideWidths[from], sculpture.sideWidths[to], morph);
    const m = mesh.current;
    if (m) {
      for (let i = 0; i < sculpture.cubes.length; i++) {
        matrix.makeTranslation(...cubePosition(sculpture, i, from, to, morph));
        m.setMatrixAt(i, matrix);
      }
      m.instanceMatrix.needsUpdate = true;
    }
    if (yawGroup.current) yawGroup.current.rotation.y = yaw;
    if (pitchGroup.current) pitchGroup.current.rotation.x = pitch;

    // Fit whatever is facing the camera to the canvas: MAVERN head-on, the medium word from the side.
    const visibleWidth = sculpture.frontWidth * Math.abs(Math.cos(yaw)) + sideWidth * Math.abs(Math.sin(yaw));
    const depth = Math.max(sculpture.frontWidth * Math.abs(Math.sin(yaw)) + sideWidth * Math.abs(Math.cos(yaw)), 1);
    const visibleHeight = GLYPH_H * Math.cos(pitch) + depth * Math.sin(pitch);
    const margin = size.width < 640 ? 1 : 3;
    const zoom = Math.min(size.width / (visibleWidth + margin * 2), size.height / (visibleHeight + margin * 2));
    if (camera instanceof THREE.OrthographicCamera && Math.abs(camera.zoom - zoom) > 0.01) {
      camera.zoom = zoom;
      camera.updateProjectionMatrix();
    }
  });

  return (
    <group ref={pitchGroup}>
      <primitive object={grid} />
      <group ref={yawGroup}>
        <instancedMesh ref={mesh} args={[geometry, materials, sculpture.cubes.length]} />
      </group>
    </group>
  );
}

/** The MAVERN block sculpture. Turns by itself; reads MAVERN from the front and each medium word from the side. */
export default function Sculpture({ words, running, onWord, onFail }: Props) {
  return (
    <Canvas
      orthographic
      dpr={[1, 2]}
      frameloop={running ? "always" : "demand"}
      camera={{ position: [0, 0, 100], near: 0.1, far: 400, zoom: 10 }}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          onFail();
        });
      }}
    >
      <Blocks words={words} running={running} onWord={onWord} />
    </Canvas>
  );
}
