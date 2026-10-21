"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { MotionValue } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { linear } from "@/components/scene/colour";
import { wordTexture } from "@/components/scene/textures";
import { CHAPTERS, galleryShot, type Sky } from "./galleryPath";

/*
  The dusk gallery: a neon grid floor running to a slit sun, marble columns down both sides, and
  three arches holding the figures. The camera and the sky's colours follow the scroll (galleryPath.ts).
*/

const ARCH_W = 3.6;
const ARCH_H = 5.4;
/** Aphrodite's eye bar, as a box in her picture (fractions from the left and from the top). */
const EYE_BAR = { x: [0.182, 0.728], y: [0.259, 0.373] };

type Textures = Record<(typeof CHAPTERS)[number]["figure"], THREE.Texture> & { word: { texture: THREE.Texture; aspect: number } };

const worldVertex = /* glsl */ `
  varying vec3 vWorld;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

/** The picture cut to an arch with a thin gold rim; `uMirror` draws the faded reflection in the floor. */
const archFragment = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec2 uCover;
  uniform vec3 uRim;
  uniform float uMirror;
  varying vec2 vUv;
  varying vec3 vWorld;
  void main() {
    vec2 p = vec2((vUv.x - 0.5) * ${ARCH_W.toFixed(2)}, vUv.y * ${ARCH_H.toFixed(2)});
    float r = ${(ARCH_W / 2).toFixed(2)};
    float spring = ${(ARCH_H - ARCH_W / 2).toFixed(2)};
    // Signed distance to the arch outline (negative inside).
    float d = p.y < spring ? max(abs(p.x) - r, -p.y) : length(vec2(p.x, p.y - spring)) - r;
    float aa = fwidth(d) * 1.5;
    float inside = 1.0 - smoothstep(-aa, aa, d + 0.07);
    float rim = 1.0 - smoothstep(0.0, aa * 2.0, abs(d + 0.035) - 0.02);
    if (inside < 0.01 && rim < 0.01) discard;
    vec2 uv = (vUv - 0.5) * uCover + 0.5;
    vec3 col = texture2D(uMap, uv).rgb;
    col = mix(col, uRim * 1.6, rim);
    float alpha = max(inside, rim);
    if (uMirror > 0.5) alpha *= 0.32 * smoothstep(-2.6, 0.0, vWorld.y);
    gl_FragColor = vec4(col, alpha);
    #include <colorspace_fragment>
  }
`;

function archMaterial(map: THREE.Texture, mirror: boolean) {
  const img = map.image as { width: number; height: number };
  const picture = img.width / img.height;
  const frame = ARCH_W / ARCH_H;
  // Cover: crop the picture's longer side so it fills the arch.
  const cover = picture > frame ? new THREE.Vector2(frame / picture, 1) : new THREE.Vector2(1, picture / frame);
  return new THREE.ShaderMaterial({
    uniforms: { uMap: { value: map }, uCover: { value: cover }, uRim: { value: linear("gold") }, uMirror: { value: mirror ? 1 : 0 } },
    vertexShader: worldVertex,
    fragmentShader: archFragment,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: !mirror,
  });
}

const floorFragment = /* glsl */ `
  uniform vec3 uGrid;
  uniform vec3 uBase;
  uniform vec3 uFog;
  uniform vec3 uEye;
  varying vec3 vWorld;
  void main() {
    vec2 c = vWorld.xz / 2.0;
    vec2 g = abs(fract(c - 0.5) - 0.5) / fwidth(c);
    float line = 1.0 - min(min(g.x, g.y), 1.0);
    float dist = length(vWorld.xz - uEye.xz);
    vec3 col = mix(uBase, uGrid * 1.8, line);
    float fog = 1.0 - exp(-dist * 0.018);
    col = mix(col, uFog, fog);
    gl_FragColor = vec4(col, mix(0.82, 1.0, fog));
    #include <colorspace_fragment>
  }
`;

const skyFragment = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uHorizon;
  varying vec3 vWorld;
  void main() {
    float h = normalize(vWorld - cameraPosition).y;
    vec3 col = mix(uHorizon, uTop, smoothstep(0.0, 0.45, h));
    col = mix(col, uHorizon * 0.5, smoothstep(0.0, -0.2, h));
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

/** The synthwave sun: gold to orchid, with slits that widen towards the horizon. */
const sunFragment = /* glsl */ `
  uniform vec3 uHigh;
  uniform vec3 uLow;
  varying vec2 vUv;
  void main() {
    vec2 p = vUv - 0.5;
    if (length(p) > 0.5) discard;
    float y = vUv.y;
    if (y < 0.48 && fract(y * 18.0) < (0.48 - y) * 1.6) discard;
    vec3 col = mix(uLow, uHigh, smoothstep(0.1, 0.85, y));
    gl_FragColor = vec4(col * 1.4, 1.0);
    #include <colorspace_fragment>
  }
`;

function mixSky(a: Sky, b: Sky, t: number, key: keyof Sky, out: THREE.Color) {
  return out.copy(linear(a[key])).lerp(linear(b[key]), t);
}

function Walk({ textures, progress }: { textures: Textures; progress: MotionValue<number> }) {
  const { camera, size } = useThree();
  const sky = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uTop: { value: new THREE.Color() }, uHorizon: { value: new THREE.Color() } },
        vertexShader: worldVertex,
        fragmentShader: skyFragment,
        side: THREE.BackSide,
        depthWrite: false,
      }),
    [],
  );
  const floor = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uGrid: { value: new THREE.Color() }, uBase: { value: linear("night").multiplyScalar(0.6) }, uFog: { value: new THREE.Color() }, uEye: { value: new THREE.Vector3() } },
        vertexShader: worldVertex,
        fragmentShader: floorFragment,
        transparent: true,
      }),
    [],
  );
  const sun = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uHigh: { value: linear("gold") }, uLow: { value: linear("orchid") } },
        vertexShader: worldVertex,
        fragmentShader: sunFragment,
        transparent: true,
        depthWrite: false,
      }),
    [],
  );
  const marble = useMemo(() => new THREE.MeshStandardMaterial({ color: linear("marble"), roughness: 0.55 }), []);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const arches = useMemo(
    () => CHAPTERS.map((c) => ({ chapter: c, front: archMaterial(textures[c.figure], false), mirror: archMaterial(textures[c.figure], true) })),
    [textures],
  );
  const wordMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({ map: textures.word.texture, color: linear("marble"), transparent: true, opacity: 0, toneMapped: false }),
    [textures.word],
  );

  useEffect(
    () => () => {
      [sky, floor, sun, marble, wordMaterial, ...arches.flatMap((a) => [a.front, a.mirror])].forEach((m) => m.dispose());
    },
    [sky, floor, sun, marble, wordMaterial, arches],
  );

  const top = useMemo(() => new THREE.Color(), []);
  const horizon = useMemo(() => new THREE.Color(), []);
  const grid = useMemo(() => new THREE.Color(), []);

  useFrame((state) => {
    const p = progress.get();
    const shot = galleryShot(p);
    const cam = camera as THREE.PerspectiveCamera;
    // Portrait screens need a taller view to keep a whole arch in frame.
    const portrait = size.width / size.height < 0.8;
    const fov = portrait ? 62 : 48;
    if (cam.fov !== fov) {
      cam.fov = fov;
      cam.updateProjectionMatrix();
    }
    // A slow breath of movement so the held views stay alive.
    const t = state.clock.elapsedTime;
    cam.position.set(shot.eye[0] + Math.sin(t * 0.35) * 0.08, shot.eye[1] + Math.sin(t * 0.5) * 0.05, shot.eye[2]);
    // Frame the arch away from its words: to one side on wide screens, above them on phones.
    const c = CHAPTERS[shot.chapter];
    const near = Math.max(0, 1 - Math.abs(p - c.at) / 0.14);
    const side = c.arch[0] < 0 ? 1 : -1;
    cam.lookAt(shot.target[0] + (portrait ? 0 : side * 2.6 * near), shot.target[1] - (portrait ? 1.9 * near : 0), shot.target[2]);

    mixSky(shot.from, shot.to, shot.t, "top", top);
    mixSky(shot.from, shot.to, shot.t, "horizon", horizon);
    mixSky(shot.from, shot.to, shot.t, "grid", grid);
    sky.uniforms.uTop.value.copy(top).multiplyScalar(0.55);
    sky.uniforms.uHorizon.value.copy(horizon);
    floor.uniforms.uGrid.value.copy(grid);
    floor.uniforms.uFog.value.copy(horizon).multiplyScalar(0.55);
    floor.uniforms.uEye.value.copy(cam.position);
    if (hemi.current) {
      hemi.current.color.copy(horizon);
      hemi.current.groundColor.copy(top).multiplyScalar(0.5);
    }
    // The word in Aphrodite's eye bar lights up as the camera arrives.
    const lit = 1 - Math.min(1, Math.abs(p - CHAPTERS[1].at) / 0.08);
    wordMaterial.opacity = lit * (0.85 + 0.15 * Math.sin(t * 9));
  });

  const barW = (EYE_BAR.x[1] - EYE_BAR.x[0]) * ARCH_W;
  const barH = (EYE_BAR.y[1] - EYE_BAR.y[0]) * ARCH_H;
  const wordW = Math.min(barW * 0.9, barH * 0.8 * textures.word.aspect);

  return (
    <>
      <mesh material={sky}>
        <sphereGeometry args={[400, 32, 16]} />
      </mesh>
      <mesh material={sun} position={[0, 26, -330]}>
        <planeGeometry args={[150, 150]} />
      </mesh>
      <mesh material={floor} rotation-x={-Math.PI / 2} position={[0, 0, -100]}>
        <planeGeometry args={[400, 400]} />
      </mesh>
      <hemisphereLight ref={hemi} intensity={1.6} />
      <directionalLight position={[0, 20, -80]} intensity={1.2} color={linear("gold")} />
      <ambientLight intensity={0.25} />

      {Array.from({ length: 9 }, (_, i) => -i * 7 + 2).flatMap((z) =>
        [-7.5, 7.5].map((x) => (
          <group key={`${x}${z}`} position={[x, 0, z]}>
            <mesh material={marble} position={[0, 3.3, 0]}>
              <cylinderGeometry args={[0.38, 0.44, 6.6, 20]} />
            </mesh>
            <mesh material={marble} position={[0, 6.75, 0]}>
              <boxGeometry args={[1.2, 0.3, 1.2]} />
            </mesh>
            <mesh material={marble} position={[0, 0.15, 0]}>
              <boxGeometry args={[1.2, 0.3, 1.2]} />
            </mesh>
          </group>
        )),
      )}

      {arches.map(({ chapter, front, mirror }) => {
        const [x, , z] = chapter.arch;
        // Each arch turns a little towards the walk so it meets the camera.
        const turn = x < 0 ? 0.32 : -0.32;
        return (
          <group key={chapter.medium} position={[x, 0.4, z]} rotation-y={turn}>
            <mesh material={front} position={[0, ARCH_H / 2, 0]}>
              <planeGeometry args={[ARCH_W, ARCH_H]} />
            </mesh>
            <mesh material={mirror} position={[0, -ARCH_H / 2 - 0.8, 0]} scale-y={-1}>
              <planeGeometry args={[ARCH_W, ARCH_H]} />
            </mesh>
            <mesh material={marble} position={[0, -0.2, -0.1]}>
              <boxGeometry args={[ARCH_W + 0.6, 0.4, 0.9]} />
            </mesh>
            {chapter.figure === "aphrodite" && (
              <mesh material={wordMaterial} position={[((EYE_BAR.x[0] + EYE_BAR.x[1]) / 2 - 0.5) * ARCH_W, (1 - (EYE_BAR.y[0] + EYE_BAR.y[1]) / 2) * ARCH_H, 0.02]}>
                <planeGeometry args={[wordW, wordW / textures.word.aspect]} />
              </mesh>
            )}
          </group>
        );
      })}
    </>
  );
}

async function loadTextures(): Promise<Textures> {
  const loader = new THREE.TextureLoader();
  const load = async (name: string) => {
    const t = await loader.loadAsync(`/media/${name}-texture.jpg`);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  };
  const [athena, aphrodite, alexander, word] = await Promise.all([load("athena"), load("aphrodite"), load("alexander"), wordTexture("WEBSITES")]);
  return { athena, aphrodite, alexander, word };
}

/** The canvas. It renders only while `running`, and reports failure so the page can show the flat version. */
export default function GalleryScene({ progress, running, onFail }: { progress: MotionValue<number>; running: boolean; onFail: () => void }) {
  const [textures, setTextures] = useState<Textures | null>(null);
  const fail = useRef(onFail);
  fail.current = onFail;

  useEffect(() => {
    let cancelled = false;
    loadTextures()
      .then((t) => !cancelled && setTextures(t))
      .catch(() => !cancelled && fail.current());
    return () => {
      cancelled = true;
    };
  }, []);

  if (!textures) return null;
  return (
    <Canvas
      dpr={[1, 1.75]}
      frameloop={running ? "always" : "never"}
      camera={{ fov: 48, near: 0.1, far: 900, position: [0, 2.4, 7] }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          fail.current();
        });
      }}
    >
      <Walk textures={textures} progress={progress} />
    </Canvas>
  );
}
