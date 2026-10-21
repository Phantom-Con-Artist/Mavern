"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { FlipWord } from "@/components/kinetic/FlipWord";
import { mediums } from "@/content/mediums";
import { usePageActive } from "@/hooks/usePageActive";
import { HeroFallback } from "./HeroFallback";

const HeadCityScene = dynamic(() => import("./HeadCityScene"), { ssr: false });
const words = mediums.map((m) => m.word);

function canAnimate(): boolean {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}

export function Hero() {
  const stage = useRef<HTMLDivElement>(null);
  const active = usePageActive(stage);
  const [live, setLive] = useState(false);
  const [failed, setFailed] = useState(false);
  const [paused, setPaused] = useState(false);
  const [word, setWord] = useState(0);

  // Load the scene once the page is idle, so text and layout paint first.
  useEffect(() => {
    if (!canAnimate()) return;
    const start = () => setLive(true);
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(start, { timeout: 1500 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(start, 300);
    return () => clearTimeout(id);
  }, []);

  const showScene = live && !failed;
  const medium = mediums[word];

  return (
    <section aria-labelledby="hero-title" className="bg-ultraviolet text-sun">
      <div
        ref={stage}
        className="relative aspect-[4/5] max-h-[78svh] w-full sm:aspect-[16/9]"
        aria-hidden="true"
      >
        {showScene ? (
          <HeadCityScene words={words} running={active && !paused} onWord={setWord} onFail={() => setFailed(true)} />
        ) : (
          <HeroFallback className="absolute inset-0 m-auto h-full w-full" />
        )}
      </div>

      <div className="px-[var(--gutter)] pb-[clamp(3rem,8vw,6rem)]">
        <h1
          id="hero-title"
          className="font-display text-[clamp(1.6rem,6.4vw,6.5rem)] leading-[var(--leading-display)] tracking-[var(--tracking-display)]"
        >
          Mavern, by Subhradeep Sarkar
        </h1>

        <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] md:items-end">
          <p className="max-w-2xl text-[length:var(--step-statement)] leading-snug">
            An independent creative practice. Software, websites, apps and experiments, finished or still in progress.
          </p>

          <div className="flex flex-col items-start gap-5 md:items-end md:text-right">
            <p className="text-[length:var(--step-small)]">
              <span>Now turning to </span>
              <a href={`/work/${medium.slug}/`} className="font-display text-[1.5rem] underline decoration-2 underline-offset-[6px]">
                <FlipWord word={medium.label} />
              </a>
            </p>
            {showScene && (
              <button
                type="button"
                aria-pressed={paused}
                onClick={() => setPaused((p) => !p)}
                className="text-[length:var(--step-small)] font-semibold underline underline-offset-4"
              >
                {paused ? "Play the animation" : "Pause the animation"}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
