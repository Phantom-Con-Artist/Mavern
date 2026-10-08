import type { ReactNode } from "react";
import { NoirBackdrop } from "@/components/art/NoirBackdrop";
import type { NavItem } from "@/content/types";
import { useTheme } from "@/hooks/useTheme";
import { Masthead } from "./Masthead";
import { SiteFooter } from "./SiteFooter";

/** Shared frame for every page: noir backdrop, masthead, main column and footer. */
export function SiteLayout({ current, children }: { current: NavItem["id"]; children: ReactNode }) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex min-h-screen flex-col">
      <NoirBackdrop />
      <a
        href="#main"
        className="sr-only z-50 border-2 border-line bg-paper px-4 py-2 text-sm font-semibold focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <Masthead current={current} theme={theme} onThemeChange={setTheme} />
      <main id="main" className="flex flex-1 flex-col gap-20 px-4 py-8 sm:px-6 lg:gap-28 lg:px-10 lg:py-10">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
