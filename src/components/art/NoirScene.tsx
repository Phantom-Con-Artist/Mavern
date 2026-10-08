import { useMemo } from "react";
import { seeded } from "@/lib/random";

const DROPS = 46;

/**
 * The hero art: blind shadows drifting slowly across the panel and thin rain falling in front.
 * Fills its positioned parent. Colours come from the theme's line token. Static with reduced motion.
 */
export function NoirScene() {
  const rain = useMemo(() => {
    const rand = seeded(42);
    return Array.from({ length: DROPS }, (_, i) => ({
      id: i,
      x: rand() * 104 - 2,
      y: rand() * 100,
      length: 5 + rand() * 9,
    }));
  }, []);

  const drops = (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-1/2 w-full">
      {rain.map((drop) => (
        <line
          key={drop.id}
          x1={drop.x}
          y1={drop.y}
          x2={drop.x - drop.length * 0.18}
          y2={drop.y + drop.length}
          stroke="currentColor"
          strokeWidth={1.1}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <div className="noir-scene-blinds" />
      <div className="noir-rain text-line">
        {drops}
        {drops}
      </div>
    </div>
  );
}
