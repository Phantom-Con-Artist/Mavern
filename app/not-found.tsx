import Link from "next/link";

export const metadata = { title: "Not found" };

/** A page that does not exist: said plainly, with the way back to the work. */
export default function NotFound() {
  return (
    <main id="main" className="grid min-h-svh place-items-center bg-sunset px-[var(--gutter)] text-night" data-tone="light">
      <div className="text-center">
        <p className="font-display text-[clamp(6rem,30vw,22rem)] leading-[0.8] tracking-[-0.06em]">404</p>
        <h1 className="mt-6 font-display text-[clamp(2rem,5vw,4rem)] tracking-[-0.03em]">Nothing here</h1>
        <p className="mx-auto mt-4 max-w-md">This tape ends here. The page may have moved, or the address may be mistyped.</p>
        <Link href="/work/" className="osd osd-solid osd-on-light mt-8 font-semibold">
          See the work
        </Link>
      </div>
    </main>
  );
}
