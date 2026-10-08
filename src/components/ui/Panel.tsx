import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * An ink panel cut like the buttons: a slanted four-sided outline over an offset green slab
 * (styles/components.css, .panel). className lays out the content inside the panel face.
 * Eases in once when scrolled into view.
 */
export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="panel"
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <span aria-hidden="true" className="panel-slab" />
      <span aria-hidden="true" className="panel-ink" />
      <div className={cn("panel-face", className)}>{children}</div>
    </motion.div>
  );
}
