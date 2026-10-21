"use client";

import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useEntered } from "@/components/sound/entered";
import { cn } from "@/lib/utils";
import { plan, positionAt, type SectionStops, type Stop } from "./plan";

const SCROLL_KEYS = new Set(["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " ", "Space"]);

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
  // Start from where the visitor is now, at the next stop ahead.
  const here = window.scrollY;
  const ahead = stops.filter((s) => s.y > here + 4);
  return [{ y: here, hold: ahead.length && stops[0].y >= here - 4 && stops[0].y <= here + 4 ? stops[0].hold : 600 }, ...ahead];
}

/**
 * The home page plays itself like a film: after the entry screen it glides from scene to scene and
 * rests at each one. Any wheel, touch or scroll key hands control back; the button resumes the tour.
 * Off under reduced motion.
 */
export function Autopilot() {
  const reduce = useReducedMotion();
  const entered = useEntered();
  const [on, setOn] = useState(false);
  const [finished, setFinished] = useState(false);
  const raf = useRef(0);

  const stop = useCallback(() => {
    cancelAnimationFrame(raf.current);
    setOn(false);
  }, []);

  const start = useCallback(() => {
    cancelAnimationFrame(raf.current);
    const stops = route();
    if (stops.length < 2) return setFinished(true);
    setFinished(false);
    setOn(true);
    const t0 = performance.now();
    const step = (now: number) => {
      const { y, done } = positionAt(stops, now - t0);
      window.scrollTo(0, y);
      if (done) {
        setOn(false);
        setFinished(true);
      } else raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  }, []);

  // Begin once the visitor is in, unless they asked for less motion.
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

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  if (reduce || !entered) return null;

  return (
    <div className="hud-bottom fixed bottom-3 left-[var(--gutter)] z-50 text-marble">
      <button
        type="button"
        aria-pressed={on}
        onClick={() => (on ? stop() : finished ? (window.scrollTo(0, 0), setTimeout(start, 50)) : start())}
        className="osd gap-2 text-[0.8125rem] font-semibold"
      >
        <span aria-hidden="true" className={cn("inline-block size-2", on ? "animate-pulse bg-ember motion-reduce:animate-none" : "bg-current")} />
        <span className="sm:hidden">{on ? "Autoplay" : finished ? "Again" : "Autoplay"}</span>
        <span className="max-sm:sr-only">{on ? "Autoplay on. Scroll to take over" : finished ? "Watch again" : "Resume autoplay"}</span>
      </button>
    </div>
  );
}
