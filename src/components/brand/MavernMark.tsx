import { cn } from "@/lib/utils";

/**
 * The current Mavern mark (assets/mavern-logo.png, trimmed, unchanged in shape).
 * Drawn as a mask so it takes the theme's ink colour; set the width with className.
 */
export function MavernMark({ className, label }: { className?: string; label?: string }) {
  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn("inline-block aspect-[803/665] bg-current", className)}
      style={{
        mask: "url(/brand/mavern-mark.png) center / contain no-repeat",
        WebkitMask: "url(/brand/mavern-mark.png) center / contain no-repeat",
      }}
    />
  );
}
