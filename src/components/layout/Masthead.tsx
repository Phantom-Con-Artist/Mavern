import { MavernMark } from "@/components/brand/MavernMark";
import { TypingWord } from "@/components/brand/TypingWord";
import { nav } from "@/content/site";
import type { NavItem } from "@/content/types";
import type { Theme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "./ThemeSwitcher";

type Props = { current: NavItem["id"]; theme: Theme; onThemeChange: (theme: Theme) => void };

/** One header bar: the wordmark, page links and the theme switcher. Links wrap to their own row on phones. */
export function Masthead({ current, theme, onThemeChange }: Props) {
  return (
    <header className="border-b-2 border-line bg-paper/95">
      <div className="flex flex-wrap items-center gap-x-10 gap-y-3 px-4 py-4 sm:px-6 lg:px-10">
        <a
          href="/"
          aria-label="Mavern home"
          className="flex items-baseline gap-[0.2em] font-display text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight"
        >
          <MavernMark className="wordmark-mark text-ink" />
          <TypingWord word="mavern" />
        </a>

        <nav aria-label="Main" className="order-last w-full border-t border-line pt-3 md:order-none md:ml-auto md:w-auto md:border-0 md:pt-0">
          <ul className="flex flex-wrap gap-x-8 gap-y-2 text-sm font-semibold">
            {nav.map((item) => (
              <li key={item.id}>
                <a
                  href={item.href}
                  aria-current={item.id === current ? "page" : undefined}
                  className={cn(
                    "transition-colors hover:text-accent",
                    item.id === current && "text-accent underline decoration-2 underline-offset-[6px]",
                  )}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto md:ml-0">
          <ThemeSwitcher theme={theme} onChange={onThemeChange} />
        </div>
      </div>
    </header>
  );
}
