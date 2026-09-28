import { ApodCard } from "@/components/apod/ApodCard";
import { DatePicker } from "@/components/apod/DatePicker";
import { HistorySection } from "@/components/history/HistorySection";
import { PageTransition } from "@/components/layout/PageTransition";
import { CardGrid } from "@/components/ui/CardGrid";
import { getLatestApods } from "@/lib/apod/client";
import { getDateWindow } from "@/lib/dates";

/**
 * ISR: this page is pre-rendered, served from cache, and regenerated in the
 * background at most once an hour. NASA is called once per hour at most, no
 * matter how much traffic the page gets.
 */
export const revalidate = 3600;

const LATEST_HEADING_ID = "latest-heading";

export default async function HomePage() {
  const apods = await getLatestApods(9);

  return (
    <PageTransition>
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            Astronomy Picture of the Day
          </h1>
          <p className="max-w-prose text-neutral-300">
            Each day NASA features a different image or video of our universe,
            with a short explanation written by a professional astronomer.
          </p>
          <DatePicker dateWindow={getDateWindow()} />
        </div>

        <HistorySection focusAfterClearId={LATEST_HEADING_ID} />

        <section aria-labelledby={LATEST_HEADING_ID} className="flex flex-col gap-4">
          <h2 id={LATEST_HEADING_ID} tabIndex={-1} className="text-2xl font-bold text-white">
            Latest pictures
          </h2>
          {apods.length > 0 ? (
            <CardGrid>
              {apods.map((apod, index) => (
                <li key={apod.date}>
                  <ApodCard
                    date={apod.date}
                    title={apod.title}
                    imageUrl={apod.imageUrl}
                    eager={index < 3}
                    morph
                  />
                </li>
              ))}
            </CardGrid>
          ) : (
            <p className="text-neutral-300">No pictures are available right now.</p>
          )}
        </section>
      </div>
    </PageTransition>
  );
}
