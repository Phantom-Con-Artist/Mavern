import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A worn-tape look for one picture or video at a time: scan lines, drifting grain, and a tracking band
 * that rolls down now and then. `split` adds the red and blue fringing of a tape out of alignment.
 * Decoration only: hidden from assistive tech, and still under reduced motion.
 */
export function Vhs({ children, className, split = false, label }: { children: ReactNode; className?: string; split?: boolean; label?: string }) {
  return (
    <div className={cn("relative isolate overflow-hidden", className)}>
      <div className="h-full w-full" style={split ? { filter: "url(#vhs-split) saturate(1.15)" } : undefined}>
        {children}
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="scanlines absolute inset-0 opacity-70" />
        <div className="vhs-grain absolute inset-[-50%]" />
        <div className="vhs-band absolute inset-x-0 h-[14%]" />
        {label && (
          <span className="absolute left-[3%] top-[4%] font-display text-[clamp(0.9rem,1.6vw,1.4rem)] tracking-[0.02em] text-marble [text-shadow:2px_0_0_color-mix(in_oklch,var(--ember)_80%,transparent),-2px_0_0_color-mix(in_oklch,oklch(70%_0.15_220)_80%,transparent)]">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}

/** The SVG filter Vhs uses for its colour fringing. Rendered once, in the layout. */
export function VhsFilters() {
  return (
    <svg aria-hidden="true" width="0" height="0" className="absolute">
      <filter id="vhs-split" colorInterpolationFilters="sRGB">
        <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red" />
        <feOffset in="red" dx="3" dy="0" result="redShift" />
        <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" result="cyan" />
        <feOffset in="cyan" dx="-2" dy="0" result="cyanShift" />
        <feBlend in="redShift" in2="cyanShift" mode="screen" />
      </filter>
    </svg>
  );
}
