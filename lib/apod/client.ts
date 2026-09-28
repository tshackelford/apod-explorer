/**
 * Server-side client for NASA's APOD service.
 *
 * `server-only` makes the build fail if a client component ever imports this
 * file, so the optional API key can't end up in the browser bundle.
 *
 * Note: the service is a WordPress REST route. The documented `date`,
 * `start_date` and `count` query params are ignored by it, so this client uses
 * the routes the service actually exposes (see README, "The NASA API").
 */
import "server-only";
import { cache } from "react";
import { toApiDate, todayInApodTimeZone } from "../dates";
import { normalizeApod } from "./normalize";
import type { Apod } from "./types";

const API_BASE = "https://science.nasa.gov/wp-json/wp/v2/apod-basic";
const REQUEST_TIMEOUT_MS = 8_000;

/** Seconds to cache upstream responses in the Next.js data cache. */
const ONE_HOUR = 60 * 60;
const ONE_DAY = 24 * ONE_HOUR;

class ApodRequestError extends Error {
  constructor(status: number) {
    super(`APOD request failed with status ${status}`);
    this.name = "ApodRequestError";
  }
}

/** Returns parsed JSON, or null on 404. Throws on other failures. */
async function request(path: string, revalidate: number): Promise<unknown> {
  const url = new URL(`${API_BASE}${path}`);
  const apiKey = process.env.NASA_API_KEY;
  if (apiKey) url.searchParams.set("api_key", apiKey);

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    next: { revalidate },
  });

  if (response.status === 404) return null;
  if (!response.ok) throw new ApodRequestError(response.status);
  return response.json();
}

/** The N most recent APODs, newest first. One upstream call (max 25). */
export async function getLatestApods(count = 9): Promise<Apod[]> {
  const data = await request(`?per_page=${count}`, ONE_HOUR);
  if (!Array.isArray(data)) return [];
  return data.map(normalizeApod).filter((apod) => apod !== null);
}

/**
 * A single APOD, or null if none exists for that date.
 * Past entries never change, so they are cached for a day. Today's entry is
 * cached for an hour in case it has not been published yet.
 * Wrapped in `cache()` so `generateMetadata` and the page share one call.
 */
export const getApodByDate = cache(async (isoDate: string): Promise<Apod | null> => {
  const revalidate = isoDate === todayInApodTimeZone() ? ONE_HOUR : ONE_DAY;
  const data = await request(`/${toApiDate(isoDate)}`, revalidate);
  return data ? normalizeApod(data) : null;
});
