import type { Apod } from "@/lib/apod/types";
import { TextLink } from "@/components/ui/TextLink";
import { formatDisplayDate } from "@/lib/dates";
import { ApodMedia } from "./ApodMedia";

export function ApodDetail({ apod }: { apod: Apod }) {
  const videoUnavailable = apod.mediaType === "video" && !apod.videoUrl;

  return (
    <article className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <time dateTime={apod.date} className="font-mono text-sm font-medium uppercase tracking-wider text-nasa-red">
          {formatDisplayDate(apod.date)}
        </time>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">{apod.title}</h1>
      </header>

      <ApodMedia apod={apod} />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          {videoUnavailable && (
            <p className="text-neutral-300">
              This entry is a video that can only be played on NASA&apos;s site.
            </p>
          )}
          {apod.explanation && (
            <p className="text-lg leading-relaxed text-neutral-200">{apod.explanation}</p>
          )}
        </div>

        <aside
          aria-label="Details"
          className="flex h-fit flex-col gap-4 rounded-xl border border-border bg-surface-raised p-5"
        >
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-neutral-400">Date</dt>
            <dd className="text-white">{formatDisplayDate(apod.date)}</dd>
            <dt className="text-neutral-400">Type</dt>
            <dd className="capitalize text-white">{apod.mediaType}</dd>
            {apod.credit && (
              <>
                <dt className="text-neutral-400">Credit</dt>
                <dd className="text-white">{apod.credit}</dd>
              </>
            )}
          </dl>
          {apod.permalink && (
            <TextLink href={apod.permalink} newTab className="font-medium">
              View on science.nasa.gov
            </TextLink>
          )}
        </aside>
      </div>
    </article>
  );
}
