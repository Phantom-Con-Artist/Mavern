"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/** A word whose letters flip over one by one when it changes, like a departure board. */
export function FlipWord({ word, className }: { word: string; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <span className={className}>{word}</span>;

  return (
    <span className={className} aria-label={word} style={{ perspective: "600px", display: "inline-flex" }}>
      <AnimatePresence mode="popLayout" initial={false}>
        {[...word].map((ch, i) => (
          <motion.span
            key={`${word}-${i}`}
            aria-hidden="true"
            style={{ display: "inline-block", transformOrigin: "50% 50% -0.3em", whiteSpace: "pre" }}
            initial={{ rotateX: -90, opacity: 0 }}
            animate={{ rotateX: 0, opacity: 1 }}
            exit={{ rotateX: 90, opacity: 0 }}
            transition={{ duration: 0.4, delay: i * 0.03, ease: [0.16, 1, 0.3, 1] }}
          >
            {ch}
          </motion.span>
        ))}
      </AnimatePresence>
    </span>
  );
}
