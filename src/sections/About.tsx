import { Section, sectionPad } from "@/components/ui/Section";
import { contactEmail, creator } from "@/content/site";
import { software, statusLabels } from "@/content/software";
import { cn } from "@/lib/utils";

export function About() {
  const latest = software[0];
  const facts = [
    { label: "Name", value: creator.name },
    { label: "Role", value: "Research scholar, developer" },
    { label: "Makes", value: "Software" },
    { label: "Latest", value: `${latest.name} ${latest.version}, ${statusLabels[latest.status].toLowerCase()}` },
    { label: "Contact", value: contactEmail },
  ];

  return (
    <Section id="about" number="02" label="About" title={`Made by ${creator.name}`}>
      <div
        className={cn(
          "grid gap-10 py-8 sm:py-10 md:grid-cols-[auto_minmax(0,1fr)] md:gap-12 lg:py-12 xl:grid-cols-[auto_minmax(0,1fr)_minmax(0,22rem)]",
          sectionPad,
        )}
      >
        <figure className="flex flex-col items-center gap-3 md:w-56">
          <img
            src={creator.avatar.src}
            alt={creator.avatar.alt}
            width={512}
            height={512}
            loading="lazy"
            className="avatar size-40 rounded-full border-2 border-line object-contain p-3 sm:size-48"
          />
          <figcaption className="text-center text-xs text-ink-soft">{creator.avatar.caption}</figcaption>
        </figure>

        <div className="max-w-2xl space-y-5 self-center font-serif text-lg leading-8">
          <p>Mavern is where I publish the things I make. I am {creator.name}, a research scholar.</p>
          <p className="text-ink-soft">
            My own work was split across a PDF reader, a notes app, a reference manager, a spreadsheet and a word processor, and none of
            them talked to each other. Volpi is the tool I built to fix that, and it is the first thing Mavern has released.
          </p>
          <p className="text-ink-soft">For now, Mavern publishes software. Each release has its own site.</p>
        </div>

        <dl className="dossier self-center md:col-span-2 xl:col-span-1">
          {facts.map((fact) => (
            <div key={fact.label} className="grid grid-cols-[5.5rem_1fr] gap-3 py-2.5">
              <dt className="text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-ink-soft">{fact.label}</dt>
              <dd className="text-sm font-medium">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
}
