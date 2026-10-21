"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { RiseText } from "@/components/kinetic/RiseText";
import { Picture } from "@/components/media/Picture";
import { getMedium } from "@/content/mediums";
import { statusLabels, workPath, works } from "@/content/works";
import type { Work } from "@/content/types";

/** Side A: work you can open today, featured first. Side B: work still being made. */
const sideA = [...works.filter((w) => w.screenshot && w.featured), ...works.filter((w) => w.screenshot && !w.featured)];
const sideB = works.filter((w) => !w.screenshot);

function Track({ work, code, onFocus, active }: { work: Work; code: string; onFocus?: () => void; active?: boolean }) {
  return (
    <li>
      <Link
        href={workPath(work)}
        onMouseEnter={onFocus}
        onFocus={onFocus}
        aria-current={active ? "true" : undefined}
        className="group grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-baseline gap-x-3 py-3 transition-colors duration-150 aria-[current]:bg-night aria-[current]:text-marble hover:bg-night hover:text-marble md:px-3"
      >
        <span className="font-display text-[0.95rem] text-violet group-hover:text-gold group-aria-[current]:text-gold">{code}</span>
        <span className="flex min-w-0 items-baseline gap-3">
          <span className="truncate font-display text-[clamp(1.35rem,2.6vw,2.25rem)] leading-[1.05] tracking-[-0.025em]">{work.name}</span>
          <span aria-hidden="true" className="mb-[0.3em] hidden flex-1 border-b-2 border-dotted border-current opacity-30 sm:block" />
        </span>
        <span className="text-[0.875rem] font-semibold">{statusLabels[work.status]}</span>
        <span className="col-start-2 col-end-4 mt-1 text-[0.9375rem] opacity-80">
          {work.kind}
          {work.version ? `, v${work.version}` : ""}
        </span>
      </Link>
    </li>
  );
}

/**
 * The catalogue as a mixtape's J-card. Side A lists the work that is live, and the track in focus
 * plays on a tilted screen beside it; Side B lists what is still being made.
 */
export function SelectedWork() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const current = sideA[active];

  return (
    <section id="work" data-tone="light" data-stops="0,0.55" data-holds="3500,3500" aria-labelledby="work-title" className="bg-marble py-[var(--section-gap)] text-night">
      <div className="mx-auto max-w-[120rem] px-[var(--gutter)]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 id="work-title" className="font-display text-[clamp(3rem,9vw,9rem)] leading-[0.85] tracking-[-0.045em]">
            <RiseText text="Selected work" />
          </h2>
          <Link href="/work/" className="osd osd-solid osd-on-light font-semibold">
            Every project
          </Link>
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          <div>
            <h3 className="flex items-baseline justify-between border-b-4 border-night pb-2 font-display text-[1.5rem] tracking-[-0.02em]">
              Side A <span className="text-[0.9375rem] font-semibold [font-family:var(--font-body)]">Live now</span>
            </h3>
            <ol className="divide-y divide-night/15">
              {sideA.map((w, i) => (
                <Track key={w.slug} work={w} code={`A${i + 1}`} onFocus={() => setActive(i)} active={i === active} />
              ))}
            </ol>
          </div>

          {/* The tilted screen: sticky beside the list on wide screens. */}
          <div className="max-lg:hidden">
            <div className="sticky top-28 [perspective:1600px]">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.figure
                  key={current.slug}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, rotateY: -38, rotateX: 8, x: 60 }}
                  animate={{ opacity: 1, rotateY: -14, rotateX: 5, x: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, rotateY: 12, x: -40 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="origin-left [transform-style:preserve-3d]"
                >
                  <div className="bg-night p-[0.6rem] shadow-[2.5rem_2.5rem_0_-0.5rem_var(--orchid)]">
                    <Picture
                      name={`screen-${current.slug}`}
                      alt={`${current.name}: ${current.summary}`}
                      sizes="(min-width: 1024px) 50vw, 92vw"
                      imgClassName="aspect-[16/10] w-full object-cover object-top"
                    />
                  </div>
                  <figcaption className="mt-10 max-w-xl">
                    <p className="font-display text-[clamp(2rem,3.5vw,3.25rem)] leading-none tracking-[-0.03em]">{current.name}</p>
                    <p className="mt-3">{current.summary}</p>
                    <p className="mt-2 text-[0.9375rem] font-semibold text-violet">{getMedium(current.medium)?.label}</p>
                  </figcaption>
                </motion.figure>
              </AnimatePresence>
            </div>
          </div>

          {/* Phones have no hover: each live work shows its own screen in a strip. */}
          <div className="-mx-[var(--gutter)] flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--gutter)] pb-2 lg:hidden">
            {sideA.map((w) => (
              <Link key={w.slug} href={workPath(w)} className="w-[78vw] max-w-[26rem] shrink-0 snap-start">
                <div className="bg-night p-1.5">
                  <Picture name={`screen-${w.slug}`} alt={`${w.name}: ${w.kind}`} sizes="78vw" imgClassName="aspect-[16/10] w-full object-cover object-top" />
                </div>
                <p className="mt-3 font-display text-[1.4rem] leading-none tracking-[-0.02em]">{w.name}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-24">
          <h3 className="flex items-baseline justify-between border-b-4 border-night pb-2 font-display text-[1.5rem] tracking-[-0.02em]">
            Side B <span className="text-[0.9375rem] font-semibold [font-family:var(--font-body)]">In the works</span>
          </h3>
          <ol className="grid divide-night/15 md:grid-cols-2 md:gap-x-12 [&>li]:border-b [&>li]:border-night/15">
            {sideB.map((w, i) => (
              <Track key={w.slug} work={w} code={`B${i + 1}`} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
