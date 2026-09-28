"use client";

import { useState } from "react";
import { clearHistory, useHistory } from "@/lib/history";
import { ApodCard } from "@/components/apod/ApodCard";
import { Button } from "@/components/ui/Button";
import { CardGrid } from "@/components/ui/CardGrid";

/**
 * "Recently viewed" cards, read from the browser's history store.
 *
 * The status region is always rendered, even when the section is hidden, so
 * screen readers announce "history cleared" after the list disappears.
 */
export function HistorySection({ focusAfterClearId }: { focusAfterClearId: string }) {
  const entries = useHistory();
  const [status, setStatus] = useState("");

  function handleClear() {
    clearHistory();
    setStatus("Viewing history cleared.");
    // The button that had focus is about to unmount; move focus somewhere sensible.
    document.getElementById(focusAfterClearId)?.focus();
  }

  return (
    <>
      <p role="status" className="sr-only">
        {status}
      </p>
      {entries.length > 0 && (
        <section aria-labelledby="history-heading" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="history-heading" className="text-2xl font-bold text-white">
              Recently viewed
            </h2>
            <Button variant="secondary" size="sm" onClick={handleClear}>
              Clear history
            </Button>
          </div>
          <CardGrid>
            {/* This section sits above the latest grid, so its first row is
                often the largest thing on screen: load it eagerly. */}
            {entries.map((entry, index) => (
              <li key={entry.date}>
                <ApodCard {...entry} eager={index < 3} />
              </li>
            ))}
          </CardGrid>
        </section>
      )}
    </>
  );
}
