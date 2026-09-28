/**
 * Allowlist for NASA media URLs. Shared by the API normalizer, the history
 * store (which re-validates anything read back from localStorage), and the
 * `next/image` config, so there is a single definition of "trusted media".
 */

export const ASSET_HOSTNAME = "assets.science.nasa.gov";

export const ASSET_PATH_PREFIXES = [
  "/dynamicimage/assets/science/cds/apod/",
  "/content/dam/science/cds/apod/",
] as const;

/**
 * Returns the URL without its query string if it points at an allowed NASA
 * asset path, otherwise null. Dropping the query (resize/crop params) keeps
 * the `next/image` allowlist exact: no arbitrary search strings.
 */
export function toTrustedAssetUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }

  const isTrusted =
    url.protocol === "https:" &&
    url.hostname === ASSET_HOSTNAME &&
    ASSET_PATH_PREFIXES.some((prefix) => url.pathname.startsWith(prefix));

  return isTrusted ? `${url.origin}${url.pathname}` : null;
}
