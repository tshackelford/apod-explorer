import { describe, expect, it } from "vitest";
import { toTrustedAssetUrl } from "./assets";

describe("toTrustedAssetUrl", () => {
  it("allows APOD asset paths and strips the query string", () => {
    expect(
      toTrustedAssetUrl("https://assets.science.nasa.gov/content/dam/science/cds/apod/a.jpg?w=10"),
    ).toBe("https://assets.science.nasa.gov/content/dam/science/cds/apod/a.jpg");
  });

  it("rejects other hosts, protocols, paths and traversal", () => {
    for (const url of [
      "http://assets.science.nasa.gov/content/dam/science/cds/apod/a.jpg",
      "https://assets.science.nasa.gov.evil.test/content/dam/science/cds/apod/a.jpg",
      "https://assets.science.nasa.gov/other/a.jpg",
      "https://assets.science.nasa.gov/content/dam/science/cds/apod/../../../secret.jpg",
      "not a url",
      42,
    ]) {
      expect(toTrustedAssetUrl(url)).toBeNull();
    }
  });
});
