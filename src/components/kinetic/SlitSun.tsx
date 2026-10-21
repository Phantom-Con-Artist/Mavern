import { cn } from "@/lib/utils";

/** The synthwave sun: gold fading to orchid, its lower half cut by bands that widen towards the horizon. */
export function SlitSun({ className }: { className?: string }) {
  const bands = [0.56, 0.63, 0.7, 0.77, 0.84, 0.91];
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={cn("block", className)}>
      <defs>
        <linearGradient id="sun-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.1" stopColor="var(--gold)" />
          <stop offset="0.6" stopColor="var(--orchid)" />
          <stop offset="1" stopColor="var(--ember)" />
        </linearGradient>
        <mask id="sun-slits">
          <rect width="100" height="100" fill="white" />
          {bands.map((y, i) => (
            <rect key={y} x="0" y={y * 100} width="100" height={1 + i * 0.9} fill="black" />
          ))}
        </mask>
      </defs>
      <circle cx="50" cy="50" r="50" fill="url(#sun-fill)" mask="url(#sun-slits)" />
    </svg>
  );
}
