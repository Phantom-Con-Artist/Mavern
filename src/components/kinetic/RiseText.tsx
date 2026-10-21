"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { splitLetters } from "@/lib/splitLetters";
import { cn } from "@/lib/utils";

/**
 * Display text whose letters rise into place one after another the first time it comes into view.
 * Words never break across lines. Screen readers get the plain text.
 */
export function RiseText({
  text,
  as: Tag = "span",
  className,
  letterClassName,
  delay = 0,
  stagger = 0.035,
  id,
  ready = true,
}: {
  text: string;
  as?: "span" | "p" | "div";
  className?: string;
  letterClassName?: string;
  delay?: number;
  stagger?: number;
  id?: string;
  /** Hold the letters back until this turns true (the opening waits for the entry screen). */
  ready?: boolean;
}) {
  const reduce = useReducedMotion();
  // Watch the whole line: each letter starts clipped out of view, so it could never see itself arrive.
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  let n = 0;
  return (
    <Tag ref={ref as never} id={id} className={className} aria-label={text}>
      {text.split(" ").map((word, w) => (
        <span key={w} aria-hidden="true" className="inline-block whitespace-nowrap">
          {splitLetters(word).map((l) => {
            const i = n++;
            return (
              <span key={l.key} className="inline-block overflow-hidden pb-[0.08em] align-bottom leading-[inherit]">
                <motion.span
                  className={cn("inline-block", letterClassName)}
                  initial={reduce ? false : { y: "110%", rotate: 8 }}
                  animate={(inView && ready) || reduce ? { y: "0%", rotate: 0 } : undefined}
                  transition={{ duration: 0.9, delay: delay + i * stagger, ease: [0.16, 1, 0.3, 1] }}
                >
                  {l.char}
                </motion.span>
              </span>
            );
          })}
          {w < text.split(" ").length - 1 && <span className="inline-block w-[0.28em]" />}
        </span>
      ))}
    </Tag>
  );
}
