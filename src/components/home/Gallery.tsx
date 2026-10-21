"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { RiseText } from "@/components/kinetic/RiseText";
import { SlitSun } from "@/components/kinetic/SlitSun";
import { Picture } from "@/components/media/Picture";
import { Vhs } from "@/components/media/Vhs";
import { figureAlt } from "@/content/figures";
import type { Figure } from "@/content/types";
import { getMedium } from "@/content/mediums";
import { statusLabels, workPath, worksByMedium } from "@/content/works";
import { useRange } from "@/hooks/useRange";
import { cn } from "@/lib/utils";
import { CHAPTERS, scrollDirection, windowOpacity, type Chapter, type Direction } from "./galleryPath";

const GalleryScene = dynamic(() => import("./GalleryScene"), { ssr: false });

/** Aphrodite's eye bar, as a box in her picture (percent from the left and top). */
const EYE_BAR = { left: 18.2, top: 25.9, width: 54.6, height: 11.4 };

type ArchMotion = { rotateY: MotionValue<number>; rotateX: MotionValue<number>; scale: MotionValue<number>; sunY: MotionValue<string>; floor: MotionValue<string> };

/** A figure in its marble arch, with the slit sun behind it and the neon floor running under it. */
export function ArchFigure({ figure, move, sizes = "(min-width: 768px) 40vw, 80vw" }: { figure: Figure; move?: ArchMotion; sizes?: string }) {
  return (
    <div className="relative [perspective:1400px]">
      <motion.div aria-hidden="true" className="absolute left-1/2 top-[28%] w-[118%] -translate-x-1/2" style={move ? { y: move.sunY } : undefined}>
        <SlitSun className="w-full opacity-90" />
      </motion.div>
      <div aria-hidden="true" className="absolute inset-x-[-30%] bottom-[-6%] h-[42%] overflow-hidden [perspective:420px] [mask-image:linear-gradient(to_bottom,transparent,black_40%)]">
        <motion.div
          className="absolute inset-x-0 bottom-0 h-[260%] origin-bottom [transform:rotateX(68deg)]"
          style={{
            backgroundImage:
              "linear-gradient(to right, color-mix(in oklch, var(--orchid) 75%, transparent) 2px, transparent 2px), linear-gradient(to bottom, color-mix(in oklch, var(--orchid) 75%, transparent) 2px, transparent 2px)",
            backgroundSize: "60px 60px",
            backgroundPositionY: move?.floor,
          }}
        />
      </div>
      <motion.div className="relative mx-auto w-[min(100%,34rem)] [transform-style:preserve-3d]" style={move ? { rotateY: move.rotateY, rotateX: move.rotateX, scale: move.scale } : undefined}>
        <div className="relative overflow-hidden rounded-t-full shadow-[0_0_0_3px_var(--gold),0_0_3rem_-0.5rem_var(--orchid)] [container-type:inline-size]">
          <Picture name={figure} alt={figureAlt[figure]} sizes={sizes} imgClassName="aspect-[2/3] w-full object-cover" />
          {figure === "aphrodite" && (
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
  );
}

/** One medium's words: its name in chrome, its line, the work in it, and the door to all of it. */
function ChapterText({ chapter, compact = false }: { chapter: Chapter; compact?: boolean }) {
  const medium = getMedium(chapter.medium)!;
  const list = worksByMedium(chapter.medium).slice(0, compact ? 3 : 4);
  return (
    <>
      <h3 className="font-display text-[clamp(2.75rem,8.5vw,8rem)] leading-[0.85] tracking-[-0.04em]">
        <RiseText text={medium.label} className="chrome-glow" letterClassName="text-chrome" />
      </h3>
      <p className="mt-5 max-w-md text-[length:var(--step-text)] leading-relaxed">{medium.line}</p>
      <ul className="mt-6 max-w-md divide-y divide-marble/15 border-y border-marble/15">
        {list.map((w) => (
          <li key={w.slug}>
            <Link href={workPath(w)} className="flex items-baseline justify-between gap-4 py-2.5 hover:text-gold">
              <span className="font-semibold">{w.name}</span>
              <span className="text-[0.8125rem] text-marble/70">{statusLabels[w.status]}</span>
            </Link>
          </li>
        ))}
      </ul>
      <Link href={`/work/${medium.slug}/`} className="osd osd-solid mt-5 font-semibold">
        All {medium.label.toLowerCase()}
      </Link>
    </>
  );
}

/** A chapter's words over the 3D walk, on the side away from its arch, fading in as the camera arrives. */
function WalkPanel({ chapter, progress }: { chapter: Chapter; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, (p) => windowOpacity(p, chapter.at, 0.13));
  const visibility = useTransform(opacity, (o) => (o > 0.02 ? "visible" : "hidden"));
  const y = useRange(progress, [chapter.at - 0.13, chapter.at, chapter.at + 0.13], ["8vh", "0vh", "-8vh"]);
  const right = chapter.arch[0] < 0;
  return (
    <motion.div
      className={cn(
        "absolute inset-x-0 bottom-0 px-[var(--gutter)] pb-20 pt-28 max-md:bg-[linear-gradient(to_top,var(--night)_60%,transparent)]",
        "md:inset-y-0 md:flex md:w-[55%] md:flex-col md:justify-center md:pb-0",
        right
          ? "md:left-auto md:right-0 md:pl-[8vw] md:pr-[max(var(--gutter),4vw)] md:bg-[linear-gradient(to_left,color-mix(in_oklch,var(--night)_88%,transparent)_45%,transparent)]"
          : "md:right-auto md:pl-[max(var(--gutter),4vw)] md:pr-[8vw] md:bg-[linear-gradient(to_right,color-mix(in_oklch,var(--night)_88%,transparent)_45%,transparent)]",
      )}
      style={{ opacity, visibility, y }}
    >
      <ChapterText chapter={chapter} compact />
    </motion.div>
  );
}

/** The same chapter, flat: arch beside its words, turning to face the reader as the tape rewinds. */
function FlatPanel({ chapter, index, progress }: { chapter: Chapter; index: number; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, (p) => windowOpacity(p, chapter.at, 0.14));
  const visibility = useTransform(opacity, (o) => (o > 0.02 ? "visible" : "hidden"));
  const side = index % 2 ? -1 : 1;
  const span = [chapter.at - 0.14, chapter.at, chapter.at + 0.14];
  const move: ArchMotion = {
    rotateY: useRange(progress, span, [side * 30, 0, side * -14]),
    rotateX: useRange(progress, span, [10, 0, -6]),
    scale: useRange(progress, span, [0.84, 1, 0.94]),
    sunY: useRange(progress, span, ["30%", "0%", "-20%"]),
    floor: useRange(progress, [0, 1], ["0px", "-1400px"]),
  };
  return (
    <motion.div
      className={cn(
        "absolute inset-0 grid content-center items-center gap-6 px-[var(--gutter)] pb-16 pt-20 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] md:gap-[6vw]",
        index % 2 && "md:[&>*:first-child]:order-2",
      )}
      style={{ opacity, visibility }}
    >
      <div className="mx-auto w-[min(48vw,14rem)] md:w-[min(100%,28rem)]">
        <ArchFigure figure={chapter.figure} move={move} />
      </div>
      <div>
        <ChapterText chapter={chapter} compact />
      </div>
    </motion.div>
  );
}

/** For reduced motion and browsers without WebGL: the arches stacked down the page, still. */
function StillGallery() {
  return (
    <div className="mt-[clamp(4rem,10vw,9rem)] space-y-[clamp(6rem,14vw,12rem)]">
      {CHAPTERS.map((c, i) => (
        <div key={c.medium} className={cn("mx-auto grid max-w-[120rem] items-center gap-x-[6vw] gap-y-10 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)]", i % 2 && "md:[&>*:first-child]:order-2")}>
          <ArchFigure figure={c.figure} />
          <div>
            <ChapterText chapter={c} />
          </div>
        </div>
      ))}
    </div>
  );
}

function webglOk(): boolean {
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}

/**
 * What I make. Scrolling down walks the dusk gallery in 3D, past each figure's arch on the neon floor.
 * Scrolling back up rewinds the tape: the same chapters, flat, each arch beside its words.
 */
export function Gallery() {
  const reduce = useReducedMotion();
  const section = useRef<HTMLElement>(null);
  const [near, setNear] = useState(false);
  const [inView, setInView] = useState(false);
  const [canDraw, setCanDraw] = useState<boolean | null>(null);
  const [direction, setDirection] = useState<Direction>("down");
  const last = useRef(0);
  const { scrollY } = useScroll();
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const introOpacity = useRange(scrollYProgress, [0, 0.05, 0.11], [1, 1, 0]);
  const introScale = useRange(scrollYProgress, [0, 0.11], [1, 1.3]);

  useEffect(() => setCanDraw(webglOk()), []);

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const mount = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "100% 0px" });
    const run = new IntersectionObserver(([e]) => setInView(e.isIntersecting));
    mount.observe(el);
    run.observe(el);
    return () => {
      mount.disconnect();
      run.disconnect();
    };
  }, []);

  useMotionValueEvent(scrollY, "change", (y) => {
    const next = scrollDirection(direction, last.current, y);
    if (Math.abs(y - last.current) > 12) last.current = y;
    if (next !== direction) setDirection(next);
  });

  const heading = (
    <h2 id="gallery-title" className="font-display text-[clamp(3rem,10vw,10rem)] leading-[0.85] tracking-[-0.045em] text-marble">
      <RiseText text="What I make" />
    </h2>
  );

  if (reduce || canDraw === false) {
    return (
      <section id="what" data-stops="0" data-holds="2000" aria-labelledby="gallery-title" className="overflow-hidden bg-night px-[var(--gutter)] pb-[var(--section-gap)] pt-[clamp(6rem,12vw,10rem)] text-marble">
        <div className="mx-auto max-w-[120rem]">{heading}</div>
        <StillGallery />
      </section>
    );
  }

  const rewinding = direction === "up";

  return (
    <section
      ref={section}
      id="what"
      data-stops={`0.02,${CHAPTERS.map((c) => c.at).join(",")}`}
      data-holds="2200,4500"
      aria-labelledby="gallery-title"
      className="relative h-[560svh] bg-night text-marble"
    >
      <div className="sticky top-0 h-svh min-h-[36rem] overflow-hidden">
        {/* Down: the 3D walk. */}
        <div className={cn("absolute inset-0 transition-opacity duration-500", rewinding && "pointer-events-none opacity-0")} aria-hidden={rewinding}>
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,var(--violet),var(--orchid))]" aria-hidden="true">
            {near && <GalleryScene progress={scrollYProgress} running={inView && !rewinding} onFail={() => setCanDraw(false)} />}
          </div>
          <div className="scanlines pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
          {CHAPTERS.map((c) => (
            <WalkPanel key={c.medium} chapter={c} progress={scrollYProgress} />
          ))}
        </div>

        {/* Up: the tape rewinds through the flat chapters. */}
        <div className={cn("absolute inset-0 bg-night transition-opacity duration-500", !rewinding && "pointer-events-none opacity-0")} aria-hidden={!rewinding}>
          <Vhs label="◀◀ REW" className="absolute inset-0">
            {CHAPTERS.map((c, i) => (
              <FlatPanel key={c.medium} chapter={c} index={i} progress={scrollYProgress} />
            ))}
          </Vhs>
        </div>

        <motion.div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-[var(--gutter)] text-center" style={{ opacity: introOpacity, scale: introScale }}>
          {heading}
          <p className="mt-5 max-w-lg text-[length:var(--step-text)] text-marble">Three figures, three kinds of work. Scroll down to walk the gallery, back up to rewind it.</p>
        </motion.div>
      </div>
    </section>
  );
}
