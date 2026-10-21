"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { MavernMark } from "@/components/brand/MavernMark";
import { enter } from "@/components/sound/entered";
import { play, remembered, turnOff, turnOn } from "@/components/sound/player";

const SEEN = "mavern-entered";

/** Real loading work: the fonts, the opening picture, and enough of the music to start. */
function loadingTasks(): Promise<unknown>[] {
  const picture = document.querySelector<HTMLImageElement>("#overture-picture img");
  const image = picture && !picture.complete ? new Promise((r) => picture.addEventListener("load", r, { once: true })) : Promise.resolve();
  const music = new Promise((r) => {
    const a = new Audio();
    a.preload = "auto";
    a.addEventListener("canplay", r, { once: true });
    a.addEventListener("error", r, { once: true });
    a.src = "/media/lost-sky-dreams.m4a";
    setTimeout(r, 4000);
  });
  return [document.fonts.ready, image, music];
}

/**
 * The first screen of a visit: the Mavern mark fills like a level meter as the page really loads,
 * then the visitor walks in with sound or without it. Their choice is also the gesture browsers
 * require before music can play. Shown once per visit.
 */
export function EntryScreen() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const first = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN) === "1";
    } catch {
      /* Without storage the screen shows each time; nothing breaks. */
    }
    if (seen) {
      enter();
      if (remembered()) play().catch(() => undefined);
      return;
    }
    setOpen(true);
    document.documentElement.style.overflow = "hidden";
    const tasks = loadingTasks();
    let done = 0;
    let target = 0.08;
    tasks.forEach((t) => t.then(() => (target = Math.max(target, ++done / tasks.length))));
    // The counter eases towards what has really finished, never past it.
    let shown = 0;
    let raf = 0;
    const tick = () => {
      shown += (target - shown) * 0.08;
      if (target === 1 && shown > 0.995) shown = 1;
      setProgress(shown);
      if (shown < 1) raf = requestAnimationFrame(tick);
      else setReady(true);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (ready) first.current?.focus();
  }, [ready]);

  const choose = (sound: boolean) => {
    try {
      sessionStorage.setItem(SEEN, "1");
    } catch {
      /* Fine: the screen simply shows again next time. */
    }
    if (sound) void turnOn();
    else turnOff();
    document.documentElement.style.overflow = "";
    setOpen(false);
    enter();
  };

  const percent = Math.round(progress * 100);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Welcome to Mavern"
          className="fixed inset-0 z-[100] flex flex-col bg-night px-[var(--gutter)] text-marble"
          exit={reduce ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
          initial={{ clipPath: "inset(0 0 0% 0)" }}
          transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="flex flex-1 items-center justify-center">
            <div className="relative w-[min(46vw,15rem)]" aria-hidden="true">
              <MavernMark className="w-full text-marble/12" />
              <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(${100 - percent}% 0 0 0)` }}>
                <MavernMark className="w-full text-gold" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-6 pb-[clamp(1.5rem,5vh,3rem)]">
            <p className="font-display text-[clamp(5rem,18vw,15rem)] leading-[0.78] tracking-[-0.05em] tabular-nums" aria-live="polite">
              {String(percent).padStart(3, "0")}
            </p>
            <div className="flex flex-col items-start gap-1 sm:items-end">
              <p className="mb-3 max-w-[22rem] text-[0.9375rem] text-marble/75 sm:text-right">
                This site has a soundtrack: Lost Sky, &ldquo;Dreams&rdquo;. You can turn it off at any time, bottom right.
              </p>
              <button
                ref={first}
                type="button"
                disabled={!ready}
                onClick={() => choose(true)}
                className="osd font-display text-[clamp(1.5rem,3vw,2.25rem)] tracking-[-0.02em] disabled:opacity-30"
              >
                Enter with sound
              </button>
              <button type="button" disabled={!ready} onClick={() => choose(false)} className="osd text-[1rem] font-semibold disabled:opacity-30">
                Enter without sound
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
