import { MavernMark } from "@/components/brand/MavernMark";
import { RiseText } from "@/components/kinetic/RiseText";
import { contactEmail, creator } from "@/content/site";

const STEPS = [
  { title: "Tell me about it", body: `Write to ${contactEmail} with what you want to make, who it is for and when you need it.` },
  { title: "A plan you can read", body: "I reply with questions, then a short plan: what I will build, in what order, and what it will cost." },
  { title: "Built in the open", body: "You see working builds early and often, so there is no big reveal at the end and no surprises." },
  { title: "Yours to keep", body: "You get the finished work, its source and notes on how it fits together." },
];

const OFFER = ["Websites and web apps", "Desktop software", "Interactive 3D for the web", "Phone apps"];

/** Who is behind Mavern, what a client can hire it for, and how the work runs. */
export function About() {
  return (
    <section id="about" data-stops="0" data-holds="5000" aria-labelledby="about-title" className="bg-violet py-[var(--section-gap)] text-marble">
      <div className="mx-auto grid max-w-[110rem] gap-16 px-[var(--gutter)] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div>
          <h2 id="about-title" className="font-display text-[clamp(3rem,8vw,8rem)] leading-[0.85] tracking-[-0.045em]">
            <RiseText text="About Mavern" />
          </h2>
          <div className="mt-10 max-w-2xl space-y-5 text-[length:var(--step-statement)] leading-[1.35]">
            <p>
              Mavern is the independent creative practice of {creator.name}. It is home to the software, websites, apps and experiments I make, and the name I take on client work under.
            </p>
            <p className="text-[length:var(--step-text)] leading-relaxed">
              I care about the whole thing: the idea, the interface, the code underneath and how it feels to use. Most of what I build is React and TypeScript on the web, Rust and Tauri on the desktop, and Three.js when a project needs 3D.
            </p>
          </div>
          <h3 className="mt-14 font-display text-[1.75rem] tracking-[-0.02em] text-gold">You can hire me for</h3>
          <ul className="mt-5 font-display text-[clamp(1.6rem,3.4vw,2.75rem)] leading-[1.08] tracking-[-0.025em]">
            {OFFER.map((o) => (
              <li key={o} className="flex items-center gap-4">
                <MavernMark className="w-[0.7em] shrink-0 text-orchid" />
                {o}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-[clamp(1.75rem,3vw,2.5rem)] tracking-[-0.02em] text-gold">How a project runs</h3>
          <ol className="mt-8 space-y-0">
            {STEPS.map((s, i) => (
              <li key={s.title} className="grid grid-cols-[3.5rem_1fr] gap-4 border-t border-marble/25 py-7">
                <span className="font-display text-[2rem] leading-none text-orchid" aria-hidden="true">
                  {i + 1}
                </span>
                <div>
                  <p className="text-[1.25rem] font-semibold">{s.title}</p>
                  <p className="mt-2 text-marble/90">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
