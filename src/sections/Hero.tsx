import { MavernMark } from "@/components/brand/MavernMark";
import { NoirScene } from "@/components/art/NoirScene";
import { Panel } from "@/components/ui/Panel";
import { contactEmail, creator } from "@/content/site";
import { ButtonLink } from "@/components/ui/Button";

export function Hero() {
  return (
    <section aria-labelledby="hero-title">
      <Panel className="grid md:grid-cols-2 xl:grid-cols-[minmax(0,50rem)_minmax(0,1fr)]">
        <div className="relative z-10 flex flex-col justify-center gap-6 p-6 sm:p-10 xl:p-16">
          <h1 id="hero-title" className="max-w-2xl font-display text-[clamp(2.4rem,4.6vw,4.5rem)] leading-[1.02]">
            Software built for my own work, shared for yours.
          </h1>
          <p className="max-w-xl text-base leading-7 text-ink-soft sm:text-lg sm:leading-8">
            Mavern is where {creator.name} publishes software. The first release is Volpi, a desktop app for researchers.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-4 pt-2">
            <ButtonLink href="/software/" primary>
              See the software
            </ButtonLink>
            <ButtonLink href={`mailto:${contactEmail}`}>Get in touch</ButtonLink>
          </div>
        </div>

        <div className="slant min-h-80 md:-ml-24 md:min-h-0">
          <div className="slant-in">
            <NoirScene />
            <div className="absolute inset-0 grid place-items-center pt-[10%] md:pl-[16%] md:pt-0">
              <div className="grid aspect-square w-[52%] max-w-72 place-items-center rounded-full border-2 border-line bg-panel">
                <MavernMark className="w-[54%] text-ink" label="Mavern mark" />
              </div>
            </div>
          </div>
        </div>
      </Panel>
    </section>
  );
}
