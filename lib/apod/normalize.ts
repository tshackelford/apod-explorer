/**
 * Maps a raw APOD API response into the app's `Apod` shape.
 *
 * Pure and dependency-free, so it's easy to test against captured responses.
 * This is the trust boundary for upstream data:
 * - HTML fields become plain text.
 * - Media URLs must pass the NASA asset allowlist.
 * - The large `basic_html` field is dropped, so it never reaches the page.
 */
import { toTrustedAssetUrl } from "../assets";
import { isIsoDate } from "../dates";
import { htmlToText } from "../html";
import type { Apod } from "./types";

type RawApod = Record<string, unknown>;

export function normalizeApod(input: unknown): Apod | null {
  if (typeof input !== "object" || input === null) return null;
  const raw = input as RawApod;

  const title = asText(raw.title);
  if (!isIsoDate(raw.date) || !title) return null;

  const imageUrl = toTrustedAssetUrl(raw.hdurl);
  const size = imageUrl ? readImageSize(raw.hdurl) : null;

  return {
    date: raw.date,
    title,
    mediaType: raw.media_type === "video" ? "video" : "image",
    explanation: asText(raw.explanation).replace(/^Explanation:\s*/i, ""),
    credit: asText(raw.credit || raw.copyright).replace(/^(image|video)?\s*credit[^:]*:\s*/i, ""),
    alt: asText(raw.alt),
    imageUrl,
    imageWidth: size?.width ?? null,
    imageHeight: size?.height ?? null,
    videoUrl: raw.media_type === "video" ? extractVideoUrl(raw.basic_html) : null,
    permalink: toPermalink(raw.permalink),
  };
}

function asText(value: unknown): string {
  return typeof value === "string" ? htmlToText(value) : "";
}

/**
 * `hdurl` carries the source image's size as resize params (`?w=3828&h=3798`).
 * They're read here, before the query string is stripped. Some entries report
 * `w=0&h=0`, which counts as unknown.
 */
function readImageSize(hdurl: unknown): { width: number; height: number } | null {
  if (typeof hdurl !== "string") return null;
  try {
    const params = new URL(hdurl).searchParams;
    const width = Number(params.get("w"));
    const height = Number(params.get("h"));
    const isValid = (n: number) => Number.isInteger(n) && n > 0 && n <= 50_000;
    return isValid(width) && isValid(height) ? { width, height } : null;
  } catch {
    return null;
  }
}

/** Video APODs only expose the mp4 inside `basic_html`'s <source> tag. */
function extractVideoUrl(basicHtml: unknown): string | null {
  if (typeof basicHtml !== "string") return null;
  const src = /<source[^>]*\bsrc="([^"]+)"/i.exec(basicHtml)?.[1];
  const url = toTrustedAssetUrl(src);
  return url?.toLowerCase().endsWith(".mp4") ? url : null;
}

function toPermalink(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "science.nasa.gov" ? url.href : null;
  } catch {
    return null;
  }
}
