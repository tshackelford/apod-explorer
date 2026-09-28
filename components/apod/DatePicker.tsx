"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type SubmitEvent } from "react";
import { Button } from "@/components/ui/Button";
import {
  formatDisplayDate,
  isInWindow,
  isIsoDate,
  randomDateInWindow,
  type DateWindow,
} from "@/lib/dates";

/**
 * A native date input. It gives us keyboard support, screen-reader support
 * and a localized calendar for free. The server passes in the allowed window
 * so the picker, the detail route and history pruning all share one rule.
 * "Surprise me" jumps to a random date in that same window.
 */
export function DatePicker({ dateWindow }: { dateWindow: DateWindow }) {
  const router = useRouter();
  const [value, setValue] = useState(dateWindow.max);
  const inputId = useId();
  const hintId = useId();

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    // The browser enforces min/max, but a typed value can still slip past in
    // some browsers. The detail route validates again on the server.
    if (isIsoDate(value) && isInWindow(value, dateWindow)) {
      openDate(value);
    }
  }

  function handleSurprise() {
    const date = randomDateInWindow(dateWindow);
    setValue(date);
    openDate(date);
  }

  function openDate(date: string) {
    router.push(`/apod/${date}`, { transitionTypes: ["nav-forward"] });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-surface-raised p-4"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor={inputId} className="text-sm font-medium text-neutral-200">
          Pick a date
        </label>
        <input
          id={inputId}
          type="date"
          required
          min={dateWindow.min}
          max={dateWindow.max}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          aria-describedby={hintId}
          className="rounded-md border border-neutral-600 bg-surface px-3 py-2 text-white [color-scheme:dark]"
        />
      </div>
      <Button type="submit">View picture</Button>
      <Button variant="secondary" onClick={handleSurprise}>
        Surprise me<span className="sr-only"> with a random date</span>
      </Button>
      <p id={hintId} className="basis-full text-sm text-neutral-400">
        Any date from {formatDisplayDate(dateWindow.min)} to{" "}
        {formatDisplayDate(dateWindow.max)}.
      </p>
    </form>
  );
}
