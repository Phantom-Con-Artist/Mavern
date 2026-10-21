"use client";

import { motion, useAnimationFrame, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, useVelocity } from "motion/react";
import { useRef, type ReactNode } from "react";

/**
 * A band that drifts sideways forever and leans into the reader's scroll: faster and skewed while
 * the page moves, settling when it stops. Still under reduced motion.
 */
export function Marquee({ children, speed = 40 }: { children: ReactNode; speed?: number }) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 300 });
  const boost = useTransform(velocity, [-2000, 0, 2000], [-4, 1, 4], { clamp: false });
  const skew = useTransform(velocity, [-2000, 2000], [8, -8]);
  const track = useRef<HTMLDivElement>(null);

  useAnimationFrame((_, delta) => {
    if (reduce || !track.current) return;
    const half = track.current.scrollWidth / 2;
    let next = x.get() - (speed * boost.get() * delta) / 1000;
    if (next <= -half) next += half;
    if (next > 0) next -= half;
    x.set(next);
  });

  return (
    <div className="overflow-hidden" aria-hidden="true">
      <motion.div ref={track} className="flex w-max" style={{ x, skewX: reduce ? 0 : skew }}>
        {children}
        {children}
      </motion.div>
    </div>
  );
}
