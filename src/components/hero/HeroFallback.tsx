import { bitmap } from "./pixelFont";

const rows = bitmap("MAVERN");
const PAD = 1;

/** The sculpture seen head-on: MAVERN in flat blocks. Shown first, without WebGL and with reduced motion. */
export function HeroFallback({ className }: { className?: string }) {
  const width = rows[0].length + PAD * 2;
  const height = rows.length + PAD * 2;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={className} aria-hidden="true" data-hero-fallback>
      {rows.flatMap((row, y) =>
        row.map((on, x) =>
          on ? <rect key={`${x}-${y}`} x={x + PAD + 0.04} y={y + PAD + 0.04} width={0.92} height={0.92} fill="var(--sun)" /> : null,
        ),
      )}
    </svg>
  );
}
