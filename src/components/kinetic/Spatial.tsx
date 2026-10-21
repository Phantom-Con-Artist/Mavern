"use client";

import { motion, useReducedMotion, useScroll } from "motion/react";
import { useRef, type ReactNode } from "react";
import { useRange } from "@/hooks/useRange";

/**
 * Brings a section out of the screen towards the reader as it arrives: it starts deep and tilted
 * back, and settles flat by the time its top reaches the upper part of the window.
 */
export function Spatial({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start end", "start 0.2"] });
  const z = useRange(p, [0, 1], [-900, 0]);
  const rotateX = useRange(p, [0, 1], [22, 0]);
  const opacity = useRange(p, [0, 0.6], [0.25, 1]);
  if (reduce) return <div>{children}</div>;
  return (
    <div ref={ref} className="[perspective:1600px] [perspective-origin:50%_0%]">
      <motion.div className="origin-top will-change-transform" style={{ z, rotateX, opacity }}>
        {children}
      </motion.div>
    </div>
  );
}
