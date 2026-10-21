import { cn } from "@/lib/utils";

/** Widths built for each picture by scripts/build-images.mjs. */
const WIDTHS: Record<string, number[]> = {
  creation: [640, 1024, 1536],
  athena: [640, 1024],
  aphrodite: [640, 1024],
  alexander: [640, 1024],
};

const SIZES: Record<string, [number, number]> = {
  creation: [1536, 1024],
  athena: [1024, 1536],
  aphrodite: [1024, 1536],
  alexander: [1145, 1374],
};

/** A figure, or `screen-<slug>`: a 1440×900 screenshot of a live work in assets/screens. */
export type PictureName = keyof typeof WIDTHS | `screen-${string}`;

/** A built picture in AVIF and WebP at the widths that exist, sized for its layout slot. */
export function Picture({
  name,
  alt,
  sizes,
  className,
  imgClassName,
  priority = false,
  id,
}: {
  name: PictureName;
  alt: string;
  sizes: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  id?: string;
}) {
  const screen = name.startsWith("screen-");
  const widths = screen ? [640, 1024, 1440] : WIDTHS[name];
  const set = (ext: string) => widths.map((w) => `/media/${name}-${w}.${ext} ${w}w`).join(", ");
  const [w, h] = screen ? [1440, 900] : SIZES[name];
  return (
    <picture id={id} className={cn("block", className)}>
      <source type="image/avif" srcSet={set("avif")} sizes={sizes} />
      <img
        src={`/media/${name}-${widths[1] ?? widths[0]}.webp`}
        srcSet={set("webp")}
        sizes={sizes}
        width={w}
        height={h}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        className={imgClassName}
      />
    </picture>
  );
}
