"use client";

import Link from "next/link";
import { motion, useReducedMotion, useScroll } from "motion/react";
import { useRef } from "react";
import { RiseText } from "@/components/kinetic/RiseText";
import { SlitSun } from "@/components/kinetic/SlitSun";
import { Picture } from "@/components/media/Picture";
import { figureAlt } from "@/content/figures";
import { mediums } from "@/content/mediums";
import { statusLabels, workPath, worksByMedium } from "@/content/works";
import type { MediumInfo } from "@/content/types";
import { useRange } from "@/hooks/useRange";
import { cn } from "@/lib/utils";

/** The three figures that stand for a medium; Experiments has its own live scene further down. */
const ROOMS = mediums.filter((m) => m.figure !== "creation");

/** Aphrodite's eye bar, as a box in her picture (fractions from the left and top). */
const EYE_BAR = { left: 18.2, top: 25.9, width: 54.6, height: 11.4 };

function Room({ medium, index }: { medium: MediumInfo; index: number }) {
  const reduce = useReducedMotion();
  const row = useRef<HTMLDivElement>(null);
  const { scrollYProgress: p } = useScroll({ target: row, offset: ["start end", "end start"] });
  // Arches on the left turn in from the left, and the right ones from the right.
  const side = index % 2 ? -1 : 1;
  const rotateY = useRange(p, [0, 0.45, 1], [side * 32, 0, side * -14]);
  const rotateX = useRange(p, [0, 0.45, 1], [10, 0, -6]);
  const scale = useRange(p, [0, 0.45, 1], [0.82, 1, 0.94]);
  const sunY = useRange(p, [0, 1], ["38%", "-22%"]);
  const sunScale = useRange(p, [0, 0.5], [0.7, 1]);
  const floor = useRange(p, [0, 1], ["0px", "-480px"]);
  const list = worksByMedium(medium.slug).slice(0, 4);

  return (
    <div ref={row} className={cn("mx-auto grid max-w-[120rem] items-center gap-x-[6vw] gap-y-10 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)]", index % 2 && "md:[&>*:first-child]:order-2")}>
      <div className="relative [perspective:1400px]">
        {/* The sun sets behind each figure, and the neon floor runs under it. */}
        <motion.div aria-hidden="true" className="absolute left-1/2 top-[28%] w-[118%] -translate-x-1/2" style={reduce ? undefined : { y: sunY, scale: sunScale }}>
          <SlitSun className="w-full opacity-90" />
        </motion.div>
        <div aria-hidden="true" className="absolute inset-x-[-30%] bottom-[-6%] h-[42%] overflow-hidden [perspective:420px] [mask-image:linear-gradient(to_bottom,transparent,black_40%)]">
          <motion.div
            className="absolute inset-x-0 bottom-0 h-[260%] origin-bottom [transform:rotateX(68deg)]"
            style={{
              backgroundImage:
                "linear-gradient(to right, color-mix(in oklch, var(--orchid) 75%, transparent) 2px, transparent 2px), linear-gradient(to bottom, color-mix(in oklch, var(--orchid) 75%, transparent) 2px, transparent 2px)",
              backgroundSize: "60px 60px",
              backgroundPositionY: reduce ? undefined : floor,
            }}
          />
        </div>
        <motion.div className="relative mx-auto w-[min(100%,34rem)] [transform-style:preserve-3d]" style={reduce ? undefined : { rotateY, rotateX, scale }}>
          <div className="relative overflow-hidden rounded-t-full shadow-[0_0_0_3px_var(--gold),0_0_3rem_-0.5rem_var(--orchid)] [container-type:inline-size]">
            <Picture name={medium.figure} alt={figureAlt[medium.figure]} sizes="(min-width: 768px) 40vw, 92vw" imgClassName="aspect-[2/3] w-full object-cover" />
            {medium.figure === "aphrodite" && (
              <span
                aria-hidden="true"
                className="eyebar-word absolute flex items-center justify-center font-display text-[7.4cqw] leading-none tracking-[-0.02em] text-marble"
                style={{ left: `${EYE_BAR.left}%`, top: `${EYE_BAR.top}%`, width: `${EYE_BAR.width}%`, height: `${EYE_BAR.height}%` }}
              >
                WEBSITES
              </span>
            )}
          </div>
        </motion.div>
      </div>

      <div>
        <h3 className="font-display text-[clamp(3rem,8.5vw,8rem)] leading-[0.85] tracking-[-0.04em]">
          <RiseText text={medium.label} className="chrome-glow" letterClassName="text-chrome" />
        </h3>
        <p className="mt-6 max-w-md text-[length:var(--step-text)] leading-relaxed">{medium.line}</p>
        <ul className="mt-7 max-w-md divide-y divide-marble/15 border-y border-marble/15">
          {list.map((w) => (
            <li key={w.slug}>
              <Link href={workPath(w)} className="flex items-baseline justify-between gap-4 py-3 hover:text-gold">
                <span className="font-semibold">{w.name}</span>
                <span className="text-[0.8125rem] text-marble/70">{statusLabels[w.status]}</span>
              </Link>
            </li>
          ))}
        </ul>
        <Link href={`/work/${medium.slug}/`} className="osd osd-solid mt-6 font-semibold">
          All {medium.label.toLowerCase()}
        </Link>
      </div>
    </div>
  );
}

/**
 * What I make: each medium's figure stands in a marble arch with the sun going down behind it.
 * As the page scrolls, each arch turns towards the reader, faces them, and turns away.
 */
export function Gallery() {
  return (
    <section id="what" data-stops="0,0.2,0.53,0.86" data-holds="1800,4000" aria-labelledby="gallery-title" className="overflow-hidden bg-night px-[var(--gutter)] pb-[var(--section-gap)] pt-[clamp(6rem,12vw,10rem)] text-marble">
      <div className="mx-auto max-w-[120rem]">
        <h2 id="gallery-title" className="font-display text-[clamp(3rem,10vw,10rem)] leading-[0.85] tracking-[-0.045em]">
          <RiseText text="What I make" />
        </h2>
      </div>
      <div className="mt-[clamp(4rem,10vw,9rem)] space-y-[clamp(7rem,16vw,14rem)]">
        {ROOMS.map((m, i) => (
          <Room key={m.slug} medium={m} index={i} />
        ))}
      </div>
    </section>
  );
}
