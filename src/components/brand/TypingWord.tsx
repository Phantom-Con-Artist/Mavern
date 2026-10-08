import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

const TYPE_MS = 140;
const DELETE_MS = 70;
const HOLD_MS = 2600;
const PAUSE_MS = 700;

/**
 * Types a word, holds it, deletes it and starts again, with a blinking caret.
 * The full word reserves its width so nothing around it moves. Decorative only:
 * give the surrounding link or heading its own accessible name. Static with reduced motion.
 */
export function TypingWord({ word }: { word: string }) {
  const reduceMotion = useReducedMotion();
  const [count, setCount] = useState(word.length);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (reduceMotion) return;
    let delay = deleting ? DELETE_MS : TYPE_MS;
    if (!deleting && count === word.length) delay = HOLD_MS;
    if (deleting && count === 0) delay = PAUSE_MS;

    const timer = window.setTimeout(() => {
      if (!deleting && count === word.length) setDeleting(true);
      else if (deleting && count === 0) setDeleting(false);
      else setCount((n) => n + (deleting ? -1 : 1));
    }, delay);
    return () => window.clearTimeout(timer);
  }, [count, deleting, reduceMotion, word.length]);

  if (reduceMotion) return <span aria-hidden="true">{word}</span>;

  return (
    <span aria-hidden="true" className="relative inline-block">
      <span className="invisible">{word}</span>
      <span className="absolute inset-y-0 left-0 whitespace-nowrap">
        {word.slice(0, count)}
        <span className="typing-caret" />
      </span>
    </span>
  );
}
