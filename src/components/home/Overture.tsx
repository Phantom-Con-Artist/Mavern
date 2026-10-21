"use client";

import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRange } from "@/hooks/useRange";
import { useEffect, useRef, useState } from "react";
import { Glint } from "@/components/kinetic/Glint";
import { RiseText } from "@/components/kinetic/RiseText";
import { useEntered } from "@/components/sound/entered";
import { Picture } from "@/components/media/Picture";
import { Vhs } from "@/components/media/Vhs";
import { coverPoint } from "@/lib/cover";

/** The creation picture's size, how it is cropped, and where its orb is (fractions of the picture). */
const IMAGE = { w: 1536, h: 1024 };
const POSITION: [number, number] = [0.66, 0.4];
const ORB: [number, number] = [0.694, 0.293];

/**
 * The spark. Two marble hands reach for a glowing orb; scrolling pushes the camera into the orb,
 * its light fills the screen, and inside it the name holds still while the page cuts around it.
 */
export function Overture() {
  const reduce = useReducedMotion();
  const entered = useEntered();
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [orb, setOrb] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const measure = () => setOrb(coverPoint({ w: el.clientWidth, h: el.clientHeight }, IMAGE, POSITION, ORB));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { scrollYProgress: p } = useScroll({ target: section, offset: ["start start", "end end"] });
  const zoom = useRange(p, [0, 0.62], [1, 7.5]);
  const shade = useRange(p, [0, 0.3], [1, 0]);
  const textY = useRange(p, [0, 0.3], ["0%", "-18%"]);
  const textScale = useRange(p, [0, 0.3], [1, 1.12]);
  const textOpacity = useRange(p, [0, 0.22], [1, 0]);
  const glow = useRange(p, [0.18, 0.6], [0.6, 14]);
  const glowOpacity = useRange(p, [0.05, 0.3, 0.7, 0.85], [0.35, 1, 1, 0]);
  const reveal = useRange(p, [0.48, 0.8], [0, 160]);
  const clip = useTransform(reveal, (r) => `circle(${r}% at ${orb.x}px ${orb.y}px)`);
  const lineOpacity = useRange(p, [0.74, 0.84, 0.97, 1], [0, 1, 1, 0.6]);
  const lineY = useRange(p, [0.74, 0.86], ["30%", "0%"]);

  // The match cut only plays while its light is open.
  useMotionValueEvent(p, "change", (v) => {
    const el = video.current;
    if (!el) return;
    if (v > 0.42 && el.paused) el.play().catch(() => undefined);
    if (v <= 0.42 && !el.paused) el.pause();
  });

  const intro = (
    <div className="relative z-10 flex h-full flex-col justify-end px-[var(--gutter)] pb-[max(4.25rem,6vh)] md:pb-[clamp(3.5rem,7vh,4.5rem)]">
      <div className="grid max-w-[120rem] gap-6 md:grid-cols-[minmax(0,30rem)_auto] md:items-end md:justify-between">
        <p className="text-[length:var(--step-statement)] leading-[1.3] text-marble">
          The independent studio of Subhradeep Sarkar. I design and build software, websites and apps, for my own projects and for clients.
        </p>
        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          <a href="/work/" className="osd osd-solid font-semibold">
            See the work
          </a>
          <a href="#contact" className="osd font-semibold">
            Get in touch
          </a>
        </div>
      </div>
      <h1 id="overture-title" className="relative -mb-[0.06em] mt-[clamp(1rem,3vh,2rem)] font-display text-[clamp(4.5rem,17.6vw,26rem)] uppercase leading-[0.8] tracking-[-0.05em]">
        <RiseText text="Mavern" className="chrome-glow" letterClassName="text-chrome" stagger={0.07} delay={0.1} ready={entered} />
        <Glint className="left-[13%] top-[8%]" delay={1.4} />
        <Glint className="left-[71%] top-[52%] size-[0.32em]" delay={2.3} />
      </h1>
    </div>
  );

  if (reduce) {
    return (
      <section aria-labelledby="overture-title" className="relative h-svh min-h-[36rem] overflow-hidden bg-night text-marble">
        <Picture name="creation" alt="" sizes="100vw" priority className="absolute inset-0" imgClassName="h-full w-full object-cover object-[66%_40%]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,var(--night)_0%,transparent_65%)]" />
        {intro}
      </section>
    );
  }

  return (
    <section ref={section} data-stops="0,0.93" data-holds="3200,2600" aria-labelledby="overture-title" className="relative h-[320svh] bg-night text-marble">
      <div ref={stage} className="sticky top-0 h-svh min-h-[36rem] overflow-hidden">
        <motion.div className="absolute inset-0 will-change-transform" style={{ scale: zoom, transformOrigin: `${orb.x}px ${orb.y}px` }}>
          <Picture
            id="overture-picture"
            name="creation"
            alt="Two marble hands reach for a glowing orb above a violet sea of clouds."
            sizes="100vw"
            priority
            className="absolute inset-0"
            imgClassName="h-full w-full object-cover"
          />
        </motion.div>
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute size-[34vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--marble)_0%,var(--orchid)_28%,color-mix(in_oklch,var(--violet)_60%,transparent)_55%,transparent_70%)] will-change-transform"
          style={{ left: orb.x, top: orb.y, scale: glow, opacity: glowOpacity }}
        />
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(to_top,var(--night)_0%,color-mix(in_oklch,var(--night)_55%,transparent)_35%,transparent_70%)]"
          style={{ opacity: shade }}
        />
        <motion.div className="absolute inset-0" style={{ y: textY, scale: textScale, opacity: textOpacity, transformOrigin: "20% 100%" }}>
          {intro}
        </motion.div>

        <motion.div aria-hidden="true" className="absolute inset-0 bg-night" style={{ clipPath: clip }}>
          <Vhs split label="PLAY ▶" className="h-full w-full">
          <video
            ref={video}
            muted
            loop
            playsInline
            preload="metadata"
            poster="/media/match-cut-poster.jpg"
            className="h-full w-full object-cover"
          >
            <source src="/media/match-cut.webm" type="video/webm" />
            <source src="/media/match-cut.mp4" type="video/mp4" />
          </video>
          </Vhs>
        </motion.div>
        <motion.p
          className="absolute inset-x-0 bottom-[12vh] px-[var(--gutter)] text-center font-display text-[clamp(2rem,6.5vw,6rem)] leading-[0.95] tracking-[-0.03em] text-marble [text-shadow:0_0.06em_0.4em_var(--night)]"
          style={{ opacity: lineOpacity, y: lineY }}
        >
          Every project starts as a spark.
        </motion.p>
      </div>
    </section>
  );
}
