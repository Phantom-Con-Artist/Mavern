import { cn } from "@/lib/utils";

/** A four-point star that flares on chrome type now and then, as light catches it. */
export function Glint({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <svg
      viewBox="0 0 40 40"
      aria-hidden="true"
      className={cn("pointer-events-none absolute size-[0.42em] animate-[glint_4.8s_ease-in-out_infinite] text-marble opacity-0 motion-reduce:hidden", className)}
      style={{ animationDelay: `${delay}s`, filter: "drop-shadow(0 0 6px var(--orchid))" }}
    >
      <path fill="currentColor" d="M20 0c1.2 10.2 9.8 18.8 20 20-10.2 1.2-18.8 9.8-20 20-1.2-10.2-9.8-18.8-20-20C10.2 18.8 18.8 10.2 20 0z" />
    </svg>
  );
}
