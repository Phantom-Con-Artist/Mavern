"use client";

import { useEffect } from "react";
import { play, remembered } from "./player";

/**
 * On pages without the entry screen: start the music if the visitor has not turned it off, as soon
 * as the browser allows it, or on their first tap, click or key press.
 */
export function SoundStart() {
  useEffect(() => {
    if (!remembered()) return;
    const events = ["pointerdown", "keydown", "touchstart"] as const;
    const onGesture = (e: Event) => {
      // A press on the deck itself is a choice about sound; let the deck handle it.
      if ((e.target as Element | null)?.closest?.("[data-sound-deck]")) return remove();
      if (remembered()) play().catch(() => undefined);
      remove();
    };
    const remove = () => events.forEach((n) => window.removeEventListener(n, onGesture, true));
    play().then(remove, () => events.forEach((n) => window.addEventListener(n, onGesture, { capture: true, passive: true })));
    return remove;
  }, []);
  return null;
}
