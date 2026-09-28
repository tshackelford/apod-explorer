import Image from "next/image";
import Link from "next/link";
import { ViewTransition, type ReactNode } from "react";
import { formatDisplayDate } from "@/lib/dates";

type ApodCardProps = {
  date: string;
  title: string;
  imageUrl: string | null;
  /** Load immediately instead of lazily; set for cards above the fold. */
  eager?: boolean;
  /**
   * Morph this card's image into the detail page's media frame on navigation.
   * View-transition names must be unique on a page, so only the latest grid
   * opts in. A date shown in both the grid and history is named just once.
   */
  morph?: boolean;
};

/**
 * Used for both the "latest" grid and the history list. The whole card is one
 * link, and its accessible name comes from the visible title and date. The
 * image is decorative here (empty alt), so screen readers don't announce the
 * card twice. The detail page uses the API's descriptive alt text.
 */
export function ApodCard({ date, title, imageUrl, eager = false, morph = false }: ApodCardProps) {
  const thumbnail = (
    <div className="relative aspect-[16/10] bg-neutral-900">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt=""
          fill
          loading={eager ? "eager" : "lazy"}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      ) : (
        <span className="absolute inset-0 grid place-items-center text-sm text-neutral-400">
          No preview available
        </span>
      )}
    </div>
  );

  return (
    <Link
      href={`/apod/${date}`}
      transitionTypes={["nav-forward"]}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface-raised transition-colors hover:border-nasa-red focus-visible:border-nasa-red"
    >
      {morph ? <Morph date={date}>{thumbnail}</Morph> : thumbnail}
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="text-[15px] font-semibold leading-snug text-white group-hover:text-nasa-red">
          {title}
        </h3>
        <time dateTime={date} className="font-mono text-xs uppercase tracking-wide text-neutral-400">
          {formatDisplayDate(date)}
        </time>
      </div>
    </Link>
  );
}

/** Pairs with the same-named frame in ApodMedia. */
function Morph({ date, children }: { date: string; children: ReactNode }) {
  return (
    <ViewTransition name={`apod-${date}`} share="morph" default="none">
      {children}
    </ViewTransition>
  );
}
