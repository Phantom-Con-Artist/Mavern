"use client";

import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef } from "react";
import { useEntered } from "@/components/sound/entered";
import { plan, positionAt, type SectionStops, type Stop } from "./plan";
import { controls, setAutopilot, useAutopilot } from "./store";

const SCROLL_KEYS = new Set(["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "]);

/** Reads the route from sections marked data-stops="0,0.5" data-holds="3000,2000". */
function route(): Stop[] {
  const sections: SectionStops[] = [...document.querySelectorAll<HTMLElement>("[data-stops]")].map((el) => {
    const r = el.getBoundingClientRect();
    return {
      top: r.top + window.scrollY,
      height: r.height,
      stops: el.dataset.stops!.split(",").map(Number),
      holds: (el.dataset.holds ?? "3000").split(",").map(Number),
    };
  });
  const stops = plan(sections, window.innerHeight, document.documentElement.scrollHeight);
  // Start from where the visitor is now, resting first if they are already at a stop.
  const here = window.scrollY;
  const atStop = stops.find((s) => Math.abs(s.y - here) <= 4);
  return [{ y: here, hold: atStop ? atStop.hold : 500 }, ...stops.filter((s) => s.y > here + 4)];
}

/**
 * The engine behind the header's Autoplay toggle: the page glides from scene to scene and rests at
 * each one, like a film. It starts after the entry screen; any wheel, touch or scroll key hands
 * control back. Off under reduced motion.
 */
export function Autopilot() {
  const reduce = useReducedMotion();
  const entered = useEntered();
  const { on } = useAutopilot();
  const raf = useRef(0);

  const stop = useCallback(() => {
    cancelAnimationFrame(raf.current);
    setAutopilot({ on: false });
  }, []);

  const start = useCallback(() => {
    cancelAnimationFrame(raf.current);
    if (window.scrollY >= document.documentElement.scrollHeight - window.innerHeight - 8) window.scrollTo(0, 0);
    const stops = route();
    if (stops.length < 2) return setAutopilot({ on: false, finished: true });
    setAutopilot({ on: true, finished: false });
    const t0 = performance.now();
    const step = (now: number) => {
      const { y, done } = positionAt(stops, now - t0);
      window.scrollTo(0, y);
      if (done) setAutopilot({ on: false, finished: true });
      else raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  }, []);

  useEffect(() => {
    if (reduce) return;
    controls.start = start;
    controls.stop = stop;
    setAutopilot({ available: true });
    return () => {
      cancelAnimationFrame(raf.current);
      setAutopilot({ available: false, on: false });
    };
  }, [reduce, start, stop]);

  // Begin once the visitor is in.
  useEffect(() => {
    if (!entered || reduce) return;
    const id = setTimeout(start, 900);
    return () => clearTimeout(id);
  }, [entered, reduce, start]);

  // The visitor's own scrolling always wins.
  useEffect(() => {
    if (!on) return;
    const onKey = (e: KeyboardEvent) => SCROLL_KEYS.has(e.key) && stop();
    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("touchstart", stop, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
      window.removeEventListener("keydown", onKey);
    };
  }, [on, stop]);

  return null;
}
