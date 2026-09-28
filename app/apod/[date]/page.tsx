import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ApodDetail } from "@/components/apod/ApodDetail";
import { ApodDetailSkeleton } from "@/components/apod/ApodDetailSkeleton";
import { DayNav } from "@/components/apod/DayNav";
import { RecordVisit } from "@/components/history/RecordVisit";
import { PageTransition } from "@/components/layout/PageTransition";
import { TextLink } from "@/components/ui/TextLink";
import { getApodByDate, getLatestApods } from "@/lib/apod/client";
import { getDateWindow, isInWindow, isIsoDate } from "@/lib/dates";

/**
 * ISR for detail pages:
 * - The 9 latest dates are pre-rendered at build time (`generateStaticParams`).
 * - Any other date in the window renders on its first request, then is cached.
 * - Pages regenerate at most hourly. Past dates are served from the data
 *   cache, so regenerating them doesn't call NASA again (see lib/apod/client.ts).
 *   The hourly check also retires dates that leave the rolling window.
 */
export const revalidate = 3600;

type DetailPageProps = { params: Promise<{ date: string }> };

export async function generateStaticParams() {
  const latest = await getLatestApods(9);
  return latest.map(({ date }) => ({ date }));
}

/** A date the app will ask NASA about: well-formed and inside the rolling window. */
function isBrowsableDate(date: string, dateWindow = getDateWindow()): boolean {
  return isIsoDate(date) && isInWindow(date, dateWindow);
}

export async function generateMetadata({ params }: DetailPageProps): Promise<Metadata> {
  const { date } = await params;
  const apod = isBrowsableDate(date) ? await getApodByDate(date) : null;
  return apod
    ? { title: apod.title, description: apod.explanation.slice(0, 160) }
    : { title: "Picture not found" };
}

/**
 * The route param is validated here, before the <Suspense> boundary, with no
 * upstream call. That way a bad or out-of-range date gets a real HTTP 404:
 * once a loading fallback starts streaming, the status code is already sent.
 * (This is why there's no route-level loading.tsx.)
 */
export default async function ApodDetailPage({ params }: DetailPageProps) {
  const { date } = await params;
  const dateWindow = getDateWindow();
  if (!isBrowsableDate(date, dateWindow)) notFound();

  return (
    <PageTransition>
      <div className="flex flex-col gap-6">
        {/* Outside the Suspense boundary: needs only the date, so it renders immediately. */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TextLink href="/" transitionTypes={["nav-back"]} className="font-medium">
            <span aria-hidden="true">&larr; </span>Back to all pictures
          </TextLink>
          <DayNav date={date} dateWindow={dateWindow} />
        </div>
        <Suspense fallback={<ApodDetailSkeleton />}>
          <ApodDetailContent date={date} />
        </Suspense>
      </div>
    </PageTransition>
  );
}

/**
 * Fetches and renders one entry. A valid date NASA has no entry for (e.g.
 * today's, before it's published) still shows the not-found page, but as a
 * streamed 200 marked `noindex`, because streaming has already begun.
 */
async function ApodDetailContent({ date }: { date: string }) {
  const apod = await getApodByDate(date);
  if (!apod) notFound();

  return (
    <>
      <ApodDetail apod={apod} />
      <RecordVisit date={apod.date} title={apod.title} imageUrl={apod.imageUrl} />
    </>
  );
}
