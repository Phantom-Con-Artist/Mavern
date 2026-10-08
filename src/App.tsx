import { ArrowUpRight, Menu } from "lucide-react";

function App() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f6f2] text-[#21231f]">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 sm:px-10">
        <a href="#top" aria-label="Mavern home" className="flex items-center gap-3">
          <img src="/assets/mavern-logo.png" alt="" className="size-10 rounded-full object-cover" />
          <span className="text-lg font-semibold tracking-tight">mavern</span>
        </a>
        <nav className="hidden items-center gap-9 text-sm text-[#666960] sm:flex" aria-label="Main navigation">
          <a className="transition hover:text-[#21231f]" href="#about">About</a>
          <a className="transition hover:text-[#21231f]" href="mailto:hello@mavern.in">Contact</a>
        </nav>
        <a href="mailto:hello@mavern.in" className="hidden items-center gap-2 rounded-full bg-[#253d30] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#354f40] sm:flex">
          Say hello <ArrowUpRight size={16} />
        </a>
        <button className="rounded-full border border-black/10 p-2 sm:hidden" aria-label="Open menu"><Menu size={20} /></button>
      </header>

      <section id="top" className="mx-auto grid min-h-[76vh] w-full max-w-7xl items-center gap-12 px-6 pb-20 pt-12 sm:px-10 lg:grid-cols-[1.1fr_.9fr] lg:gap-20 lg:pb-28 lg:pt-16">
        <div className="relative z-10">
          <p className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#253d30]/15 bg-white/50 px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-[#526558]">
            <span className="size-1.5 rounded-full bg-[#8aa37b]" /> A new chapter begins
          </p>
          <h1 className="max-w-3xl text-[clamp(3.4rem,8vw,7.5rem)] font-medium leading-[.94] tracking-[-0.075em]">
            Good things<br />are <span className="font-serif italic font-normal text-[#77906e]">taking shape.</span>
          </h1>
          <p className="mt-8 max-w-md text-base leading-7 text-[#71746c] sm:text-lg sm:leading-8">
            A little space on the internet for what’s next. Mavern is just getting started — come back soon to see where it goes.
          </p>
          <a href="mailto:hello@mavern.in" className="mt-9 inline-flex items-center gap-3 rounded-full bg-[#253d30] px-6 py-4 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-[#354f40]">
            Get in touch <ArrowUpRight size={17} />
          </a>
        </div>

        <div className="relative mx-auto flex aspect-square w-full max-w-[520px] items-center justify-center">
          <div className="absolute inset-[7%] rounded-full bg-[#e8e9df]" />
          <div className="absolute inset-[15%] rounded-full border border-[#253d30]/10" />
          <div className="absolute inset-[25%] rounded-full border border-[#253d30]/10" />
          <div className="absolute left-[8%] top-[23%] size-3 rounded-full bg-[#c38c68]" />
          <div className="absolute bottom-[15%] right-[13%] size-2 rounded-full bg-[#77906e]" />
          <div className="relative flex size-[54%] items-center justify-center rounded-full bg-white shadow-[0_25px_80px_-35px_rgba(37,61,48,.4)]">
            <img src="/assets/mavern-logo.png" alt="Mavern mark" className="size-[75%] rounded-full object-cover" />
          </div>
          <span className="absolute right-[5%] top-[19%] rotate-6 rounded-full bg-white px-4 py-2 text-xs text-[#71746c] shadow-sm">made with intention</span>
          <span className="absolute bottom-[13%] left-[4%] -rotate-6 rounded-full bg-[#dce4d6] px-4 py-2 text-xs text-[#526558]">hello, mavern</span>
        </div>
      </section>

      <section id="about" className="border-t border-black/[0.06] bg-white/40">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-xs text-[#8a8d84] sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <span>© {new Date().getFullYear()} Mavern</span>
          <span>Thoughtfully made, wherever we’re going.</span>
          <a className="transition hover:text-[#253d30]" href="mailto:hello@mavern.in">hello@mavern.in</a>
        </div>
      </section>
    </main>
  );
}

export default App;
