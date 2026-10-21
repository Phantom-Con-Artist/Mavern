"use client";

import { cn } from "@/lib/utils";
import { controls, useAutopilot } from "./store";

/** The header's switch for the self-playing tour, shown on pages that have one. */
export function AutoplayToggle({ className }: { className?: string }) {
  const { available, on } = useAutopilot();
  if (!available) return null;
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => (on ? controls.stop() : controls.start())}
      title={on ? "The page is scrolling itself. Scroll or press to take over." : "Let the page scroll itself, pausing at each scene"}
      className={cn("osd gap-2 text-[0.9375rem] font-semibold", className)}
    >
      <span aria-hidden="true" className={cn("inline-block size-2", on ? "animate-pulse bg-ember motion-reduce:animate-none" : "border border-current")} />
      Autoplay
      <span className="sr-only">{on ? " is on" : " is off"}</span>
    </button>
  );
}
