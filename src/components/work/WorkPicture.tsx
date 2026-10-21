import { Picture } from "@/components/media/Picture";
import { Vhs } from "@/components/media/Vhs";
import type { Work } from "@/content/types";
import { TitleCard } from "./TitleCard";

/** A work's picture: a screenshot of it running, played back like a tape, or its title card. */
export function WorkPicture({ work, sizes, priority = false, className }: { work: Work; sizes: string; priority?: boolean; className?: string }) {
  if (!work.screenshot) return <TitleCard work={work} className={className} />;
  return (
    <Vhs className={className}>
      <Picture
        name={`screen-${work.slug}`}
        alt={`${work.name}: ${work.summary}`}
        sizes={sizes}
        priority={priority}
        imgClassName="aspect-[16/10] w-full object-cover object-top"
      />
    </Vhs>
  );
}
