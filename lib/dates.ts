/**
 * Date helpers. Every date in the app is an ISO calendar string ("YYYY-MM-DD").
 * Because that format sorts lexically, range checks are plain string compares
 * and no date library is needed.
 */

/** APOD publishes on US Eastern time, so "today" is evaluated there. */
export const APOD_TIME_ZONE = "America/New_York";

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export type DateWindow = { min: string; max: string };

/** True for a well-formed, real calendar date (rejects "2026-02-30"). */
export function isIsoDate(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const match = ISO_DATE_PATTERN.exec(value);
  if (!match) return false;

  const [, year, month, day] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/** Today's date in the APOD time zone. `en-CA` formats as YYYY-MM-DD. */
export function todayInApodTimeZone(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APOD_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Same calendar day one year earlier; Feb 29 falls back to Feb 28. */
export function oneYearBefore(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const daysInTargetMonth = new Date(Date.UTC(year - 1, month, 0)).getUTCDate();
  const target = new Date(
    Date.UTC(year - 1, month - 1, Math.min(day, daysInTargetMonth)),
  );
  return target.toISOString().slice(0, 10);
}

/** The rolling window users can browse: one year ago through today. */
export function getDateWindow(now: Date = new Date()): DateWindow {
  const max = todayInApodTimeZone(now);
  return { min: oneYearBefore(max), max };
}

export function isInWindow(isoDate: string, window: DateWindow): boolean {
  return isoDate >= window.min && isoDate <= window.max;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** The calendar date `days` away from `isoDate`; negative goes back in time. */
export function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/**
 * A uniformly random date in the window, both ends included.
 * `random` defaults to Math.random and is a parameter so tests can pin it.
 */
export function randomDateInWindow(
  dateWindow: DateWindow,
  random: () => number = Math.random,
): string {
  const start = Date.parse(`${dateWindow.min}T00:00:00Z`);
  const end = Date.parse(`${dateWindow.max}T00:00:00Z`);
  const dayCount = Math.round((end - start) / DAY_MS) + 1;
  const offset = Math.min(Math.floor(random() * dayCount), dayCount - 1);
  return new Date(start + offset * DAY_MS).toISOString().slice(0, 10);
}

/** The upstream single-date route expects YYMMDD, e.g. 2026-09-11 -> 260911. */
export function toApiDate(isoDate: string): string {
  return isoDate.slice(2).replaceAll("-", "");
}

/** Human-readable date. Formatted in UTC so it never shifts a day. */
export function formatDisplayDate(isoDate: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    dateStyle: "long",
  }).format(new Date(`${isoDate}T00:00:00Z`));
}
