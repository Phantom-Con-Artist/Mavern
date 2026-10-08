import { MavernMark } from "@/components/brand/MavernMark";
import { contactEmail, creator, nav, profiles } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="border-t-2 border-line bg-paper pt-10">
      <div className="flex flex-col gap-8 px-4 sm:px-6 md:flex-row lg:px-10 md:items-center md:justify-between">
        <a href="/" className="flex items-baseline gap-[0.2em] font-display text-3xl leading-none" aria-label="Mavern home">
          <MavernMark className="wordmark-mark text-ink" />
          <span>mavern</span>
        </a>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-ink-soft">
            {nav.map((item) => (
              <li key={item.id}>
                <a href={item.href} className="transition-colors hover:text-accent">
                  {item.label}
                </a>
              </li>
            ))}
            {profiles.map((profile) => (
              <li key={profile.label}>
                {profile.href ? (
                  <a href={profile.href} className="transition-colors hover:text-accent">
                    {profile.label}
                  </a>
                ) : (
                  <span className="opacity-60">{profile.label} (coming soon)</span>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="mt-8 flex flex-col gap-2 border-t border-line px-4 py-5 sm:flex-row sm:justify-between sm:px-6 lg:px-10 text-xs text-ink-soft">
        <span>
          © {new Date().getFullYear()} Mavern. Made by {creator.name}.
        </span>
        <a href={`mailto:${contactEmail}`} className="transition-colors hover:text-accent">
          {contactEmail}
        </a>
      </div>
    </footer>
  );
}
