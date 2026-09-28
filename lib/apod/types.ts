/** An APOD entry after normalization: the only shape the UI works with. */
export type Apod = {
  /** ISO calendar date, YYYY-MM-DD. */
  date: string;
  title: string;
  mediaType: "image" | "video";
  /** Plain text; the API's HTML has been stripped. */
  explanation: string;
  /** Plain text. */
  credit: string;
  alt: string;
  /** Allowlisted NASA asset URL without a query string, or null. */
  imageUrl: string | null;
  /** Intrinsic image size, or null when the API doesn't report it. */
  imageWidth: number | null;
  imageHeight: number | null;
  /** Allowlisted .mp4 URL for video entries, or null. */
  videoUrl: string | null;
  /** Article on science.nasa.gov, or null if the API sent anything else. */
  permalink: string | null;
};
