"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FlipWord } from "@/components/kinetic/FlipWord";
import { RiseText } from "@/components/kinetic/RiseText";
import { Picture } from "@/components/media/Picture";
import { mediums } from "@/content/mediums";
import { usePageActive } from "@/hooks/usePageActive";

const LiveScene = dynamic(() => import("@/components/scene/LiveScene"), { ssr: false });

function canAnimate(): boolean {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}

/**
 * Experiments: the live diorama and the Punkkyber city, running in the browser. Sliced type locks into
 * MAVERN from one viewpoint, the camera dives through the statue's eye, and each medium's word only
 * reads from its own street corner.
 */
export function Experiments() {
  const stage = useRef<HTMLDivElement>(null);
  const wash = useRef<HTMLDivElement>(null);
  const active = usePageActive(stage);
  const [live, setLive] = useState(false);
  const [failed, setFailed] = useState(false);
  const [paused, setPaused] = useState(false);
  const [word, setWord] = useState(0);

  // Load the scene's 2 MB only when the section is close.
  useEffect(() => {
    const el = stage.current;
    if (!el || !canAnimate()) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setLive(true), io.disconnect()), { rootMargin: "60% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const showScene = live && !failed;
  const medium = mediums[word];

  return (
    <section id="experiments" data-stops="0" data-holds="8000" aria-labelledby="experiments-title" className="relative bg-night pb-[var(--section-gap)] pt-[clamp(5rem,10vw,9rem)] text-marble">
      <div className="mx-auto grid max-w-[110rem] gap-8 px-[var(--gutter)] md:grid-cols-[1fr_auto] md:items-end">
        <h2 id="experiments-title" className="font-display text-[clamp(3rem,10vw,10rem)] leading-[0.85] tracking-[-0.045em]">
          <RiseText text="Experiments" letterClassName="text-sunset" />
        </h2>
        <p className="max-w-md text-[length:var(--step-text)] leading-relaxed">
          Some work exists to find something out. This scene runs live in your browser: a clay diorama, then a city where each word only reads from its own street corner.
        </p>
      </div>

      <div ref={stage} className="relative mx-[var(--gutter)] mt-12 aspect-[4/5] max-h-[82svh] overflow-hidden bg-sunset sm:aspect-[16/9]" aria-hidden="true">
        {showScene ? (
          <>
            <LiveScene running={active && !paused} wash={wash} onMedium={setWord} onFail={() => setFailed(true)} />
            <div ref={wash} className="pointer-events-none absolute inset-0 opacity-0" />
          </>
        ) : (
          <Picture name="creation" alt="" sizes="100vw" className="absolute inset-0" imgClassName="h-full w-full object-cover opacity-80" />
        )}
        <div className="scanlines pointer-events-none absolute inset-0 opacity-40" />
        <span className="absolute left-3 top-3 flex items-center gap-2 text-[0.8125rem] font-semibold text-marble [text-shadow:0_0_8px_var(--night)]">
          <span className="size-2 animate-pulse bg-ember motion-reduce:animate-none" />
          Live in your browser
        </span>
        <span className="absolute right-3 top-3 text-[0.8125rem] font-semibold text-marble [text-shadow:0_0_8px_var(--night)]">Three.js</span>
      </div>

      <div className="mx-auto mt-6 flex max-w-[110rem] flex-wrap items-center justify-between gap-4 px-[var(--gutter)]">
        <p className="text-[length:var(--step-small)]">
          <span className="text-marble/75">Now spelling </span>
          <Link href={`/work/${medium.slug}/`} className="font-display text-[1.5rem] text-gold underline decoration-2 underline-offset-[6px]">
            <FlipWord word={medium.label} />
          </Link>
        </p>
        <div className="flex items-center gap-3">
          {showScene && (
            <button
              type="button"
              aria-pressed={paused}
              onClick={() => setPaused((p) => !p)}
              className="osd font-semibold"
            >
              {paused ? "Play the scene" : "Pause the scene"}
            </button>
          )}
          <Link href="/work/experiments/" className="osd osd-solid font-semibold">
            All experiments
          </Link>
        </div>
      </div>
    </section>
  );
}
