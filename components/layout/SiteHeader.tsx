import Link from "next/link";

/**
 * Site header. It has its own view-transition name, so it stays anchored
 * while page content slides beneath it (see app/globals.css).
 */
export function SiteHeader() {
  return (
    <header className="border-b-2 border-nasa-blue bg-surface" style={{ viewTransitionName: "site-header" }}>
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
        <Link
          href="/"
          transitionTypes={["nav-back"]}
          className="flex w-fit items-center gap-2 text-lg font-bold tracking-tight text-white transition-colors hover:text-nasa-red"
        >
          <span aria-hidden="true" className="size-2.5 rounded-full bg-nasa-red" />
          APOD Explorer
        </Link>
      </div>
    </header>
  );
}
