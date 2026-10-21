import { SlitSun } from "@/components/kinetic/SlitSun";
import type { Work } from "@/content/types";
import { cn } from "@/lib/utils";

/**
 * The picture for work with nothing live to show yet: its title card, set like the end frame of an
 * 80s tape, with the sun on the horizon and the grid floor running towards it.
 */
export function TitleCard({ work, className }: { work: Work; className?: string }) {
  return (
    <div className={cn("relative isolate aspect-[16/10] overflow-hidden bg-[linear-gradient(to_bottom,var(--night)_0%,var(--violet)_55%,var(--orchid)_62%,var(--night)_62.2%)] [container-type:inline-size]", className)}>
      <SlitSun className="absolute left-1/2 top-[18%] w-[44%] -translate-x-1/2" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[38%] overflow-hidden [perspective:300px]">
        <div
          className="absolute inset-x-[-50%] bottom-0 h-[220%] origin-bottom [transform:rotateX(70deg)]"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--orchid) 2px, transparent 2px), linear-gradient(to bottom, var(--orchid) 2px, transparent 2px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>
      <div className="absolute inset-x-0 top-[44%] -translate-y-1/2 px-[6%] text-center">
        <p className="chrome-glow font-display text-[clamp(1.5rem,10cqw,7rem)] leading-[0.9] tracking-[-0.04em]">
          <span className="text-chrome">{work.name}</span>
        </p>
      </div>
      <p className="absolute inset-x-0 bottom-[5%] text-center text-[clamp(0.75rem,2cqw,1rem)] font-semibold text-marble">{work.kind}</p>
      <div className="scanlines pointer-events-none absolute inset-0 opacity-60" />
    </div>
  );
}
