import { themes, type Theme } from "@/hooks/useTheme";

export function ThemeSwitcher({ theme, onChange }: { theme: Theme; onChange: (theme: Theme) => void }) {
  return (
    <fieldset className="m-0 flex items-center gap-1 border-2 border-line bg-paper p-1">
      <legend className="sr-only">Reading theme</legend>
      {themes.map((option) => (
        <label key={option.id} className="relative cursor-pointer">
          <input
            type="radio"
            name="theme"
            value={option.id}
            checked={theme === option.id}
            onChange={() => onChange(option.id)}
            className="peer sr-only"
          />
          <span className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold text-ink-soft peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent">
            <span
              aria-hidden="true"
              className="size-3 rounded-full border border-line"
              style={{ backgroundColor: option.swatch }}
            />
            <span className="max-sm:sr-only">{option.label}</span>
          </span>
        </label>
      ))}
    </fieldset>
  );
}
