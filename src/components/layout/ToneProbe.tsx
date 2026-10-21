"use client";

import { useEffect } from "react";

/**
 * Tells the fixed header and tape deck what ground is under them: sections marked data-tone="light"
 * turn the text there to night. Written to <html> as data-top-tone and data-bottom-tone.
 */
export function ToneProbe() {
  useEffect(() => {
    let raf = 0;
    const toneAt = (y: number) => {
      for (const el of document.querySelectorAll<HTMLElement>("[data-tone]")) {
        const r = el.getBoundingClientRect();
        if (r.top <= y && r.bottom > y) return el.dataset.tone ?? "dark";
      }
      return "dark";
    };
    const update = () => {
      raf = 0;
      const root = document.documentElement;
      root.dataset.topTone = toneAt(32);
      root.dataset.bottomTone = toneAt(window.innerHeight - 32);
    };
    const schedule = () => (raf ||= requestAnimationFrame(update));
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(raf);
    };
  }, []);
  return null;
}
