"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { City, cityViews, loadCity, type CityAssets } from "./City";
import { linear } from "./colour";
import { Diorama, dioramaViews, loadDiorama, type DioramaAssets } from "./Diorama";
import { advance, pose, type LoopState, type PoseName } from "./loop";
import { lerpView, type Viewpoint } from "./views";

type Props = {
  running: boolean;
  /** The sun-coloured layer over the canvas that hides each change of scene. */
  wash: RefObject<HTMLDivElement | null>;
  onMedium: (index: number) => void;
  onFail: () => void;
};

type Assets = { diorama: DioramaAssets; city: CityAssets };

const views: Record<PoseName, Viewpoint> = { ...dioramaViews, ...cityViews } as Record<PoseName, Viewpoint>;
const night = linear("ink").multiplyScalar(0.5);

function Director({ assets, running, wash, onMedium }: { assets: Assets } & Omit<Props, "onFail">) {
  const { camera, scene, size } = useThree();
  const state = useRef<LoopState>({ segment: 0, t: 0 });
  const medium = useRef(-1);
  const [inCity, setInCity] = useState(false);
  const aspect = Math.round((size.width / size.height) * 10) / 10;

  // Fog stays on: the diorama sits closer than where it starts, and switching it off and on would rebuild every material.
  useEffect(() => {
    scene.fog = new THREE.Fog(night, 25, 150);
  }, [scene]);

  useFrame((_, delta) => {
    if (running) state.current = advance(state.current, delta * 1000);
    const p = pose(state.current);
    const city = p.scene === "city";
    if (city !== inCity) setInCity(city);
    if (p.medium !== medium.current) {
      medium.current = p.medium;
      onMedium(p.medium);
    }

    scene.background = city ? night : null;
    if (wash.current) {
      wash.current.style.opacity = String(p.wash);
      wash.current.style.backgroundColor = `var(--${p.washColour})`;
    }

    const a = views[p.from];
    const b = views[p.to];
    const shot = lerpView(a, b, p.t, p.from === p.to || p.to === "eye" ? 0 : city ? 2 : 0.3);
    const cam = camera as THREE.PerspectiveCamera;
    const fov = a.fov + (b.fov - a.fov) * p.t;
    if (Math.abs(cam.fov - fov) > 0.01) {
      cam.fov = fov;
      cam.updateProjectionMatrix();
    }
    // Haze thins with height, so the sky views see the whole city and the street stays moody.
    const fog = scene.fog as THREE.Fog | null;
    if (fog) {
      fog.near = 25 + shot.eye.y * 1.5;
      fog.far = 150 + shot.eye.y * 5;
    }
    cam.position.copy(shot.eye);
    cam.lookAt(shot.target);
  });

  return (
    <>
      <Diorama assets={assets.diorama} visible={!inCity} />
      <City assets={assets.city} visible={inCity} aspect={aspect} />
    </>
  );
}

/** The hero: the clay diorama where MAVERN locks in, then through the small arch into the night city. */
export default function HeroScene({ running, wash, onMedium, onFail }: Props) {
  const [assets, setAssets] = useState<Assets | null>(null);
  // Held in a ref so a new callback from the parent does not reload the assets.
  const fail = useRef(onFail);
  fail.current = onFail;

  useEffect(() => {
    let cancelled = false;
    const loader = new GLTFLoader();
    Promise.all([loadDiorama(loader), loadCity(loader)])
      .then(([diorama, city]) => !cancelled && setAssets({ diorama, city }))
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
      camera={{ fov: dioramaViews.approach.fov, near: 0.01, far: 3000, position: dioramaViews.approach.eye }}
      gl={{ antialias: true, alpha: true, logarithmicDepthBuffer: true }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          fail.current();
        });
      }}
    >
      <Director assets={assets} running={running} wash={wash} onMedium={onMedium} />
    </Canvas>
  );
}
