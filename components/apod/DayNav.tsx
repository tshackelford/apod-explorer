import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import { addDays, formatDisplayDate, isInWindow, type DateWindow } from "@/lib/dates";

type DayNavProps = { date: string; dateWindow: DateWindow };

/**
 * Previous / next day links for the detail page. A link is only shown when
 * its date is inside the browsable window, so there's no "next" on today and
 * no "previous" on the oldest day.
 */
export function DayNav({ date, dateWindow }: DayNavProps) {
  const previous = addDays(date, -1);
  const next = addDays(date, 1);

  return (
    <nav aria-label="Browse by day" className="flex gap-2">
      {isInWindow(previous, dateWindow) && <DayLink date={previous} direction="previous" />}
      {isInWindow(next, dateWindow) && <DayLink date={next} direction="next" />}
    </nav>
  );
}

function DayLink({ date, direction }: { date: string; direction: "previous" | "next" }) {
  const isPrevious = direction === "previous";

  return (
    <Link
      href={`/apod/${date}`}
      // Prefetching would render both neighbouring pages (and call NASA for
      // any that aren't cached yet) on every detail view, whether or not the
      // visitor goes there. The page loads on click instead, with a skeleton.
      prefetch={false}
      transitionTypes={[isPrevious ? "nav-back" : "nav-forward"]}
      className={`${buttonClasses({ variant: "secondary", size: "sm" })} gap-1.5`}
    >
      {isPrevious && <span aria-hidden="true">&larr;</span>}
      {isPrevious ? "Previous day" : "Next day"}
      <span className="sr-only">, {formatDisplayDate(date)}</span>
      {!isPrevious && <span aria-hidden="true">&rarr;</span>}
    </Link>
  );
}
