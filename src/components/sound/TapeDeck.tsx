"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { position, turnOff, turnOn, useSound } from "./player";

function clock(s: number) {
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

/**
 * The music control, drawn as a VCR's on-screen display: ▶ and a running counter while the track
 * plays, ■ when it is stopped. Pressing it turns the music on or off.
 */
export function TapeDeck({ className }: { className?: string }) {
  const { wanted, playing } = useSound();
  const counter = useRef<HTMLSpanElement>(null);
  const on = wanted && playing;

  // The counter ticks without re-rendering React.
  useEffect(() => {
    if (!on) return;
    const id = setInterval(() => counter.current && (counter.current.textContent = clock(position())), 500);
    return () => clearInterval(id);
  }, [on]);

  return (
    <button
      type="button"
      data-sound-deck
      onClick={() => (on ? turnOff() : turnOn())}
      aria-pressed={on}
      aria-label={on ? "Music is on. Turn it off" : "Music is off. Turn it on"}
      title="Lost Sky – Dreams [NCS Release]"
      className={cn("group flex items-center gap-3 px-2 py-2 text-left leading-none", className)}
    >
      <span aria-hidden="true" className="text-[1.1rem] leading-none">{on ? "▶" : "■"}</span>
      <span className="flex flex-col gap-1 max-sm:hidden">
        <span className="text-[0.8125rem] font-semibold">{on ? "Play" : "Stop"}</span>
        <span className="text-[0.75rem] opacity-80 max-sm:hidden">Lost Sky – Dreams</span>
      </span>
      <span ref={counter} aria-hidden="true" className="font-display text-[1.1rem] tabular-nums tracking-[0.02em]">
        {clock(position())}
      </span>
      <span aria-hidden="true" className="flex h-4 items-end gap-[3px]">
        {[0.9, 0.5, 1, 0.7].map((h, i) => (
          <span
            key={i}
            className={cn("w-[3px] origin-bottom bg-current", on && "animate-[eq_0.9s_ease-in-out_infinite_alternate] motion-reduce:animate-none")}
            style={{ height: `${h * 100}%`, transform: on ? undefined : "scaleY(0.2)", animationDelay: `${i * -0.23}s` }}
          />
        ))}
      </span>
    </button>
  );
}
