import { describe, expect, it } from "vitest";
import { normalizeApod } from "./normalize";
import responses from "./fixtures/apod-responses.json";

// Real responses captured from the API (basic_html trimmed for size).
const [imageResponse, videoResponse] = responses;

describe("normalizeApod", () => {
  it("maps an image response into the app's shape", () => {
    const apod = normalizeApod(imageResponse);

    expect(apod).toMatchObject({
      date: "2026-09-11",
      title: "M83: The Southern Pinwheel",
      mediaType: "image",
      videoUrl: null,
      imageWidth: 3828,
      imageHeight: 3798,
    });
    expect(apod?.imageUrl).toBe(
      "https://assets.science.nasa.gov/dynamicimage/assets/science/cds/apod/apod/2026/september/M83_Final2_1x.jpg",
    );
    expect(apod?.permalink).toMatch(/^https:\/\/science\.nasa\.gov\//);
  });

  it("returns plain text for HTML fields", () => {
    const apod = normalizeApod(imageResponse);

    expect(apod?.explanation).not.toMatch(/[<>]/);
    expect(apod?.explanation.startsWith("Explanation")).toBe(false);
    expect(apod?.credit).not.toMatch(/[<>]/);
  });

  it("extracts the mp4 for video entries", () => {
    const apod = normalizeApod(videoResponse);

    expect(apod?.mediaType).toBe("video");
    expect(apod?.videoUrl).toBe(
      "https://assets.science.nasa.gov/content/dam/science/cds/apod/apod/2026/september/NoctilucentNeowise_Girotti.mp4",
    );
  });

  it("treats missing or zero image dimensions as unknown", () => {
    const hdurl = "https://assets.science.nasa.gov/content/dam/science/cds/apod/a.jpg";
    for (const query of ["?w=0&h=0", "?w=abc&h=10", ""]) {
      const apod = normalizeApod({ ...imageResponse, hdurl: hdurl + query });
      expect(apod?.imageWidth).toBeNull();
      expect(apod?.imageHeight).toBeNull();
    }
  });

  it("does not expose the raw basic_html payload", () => {
    expect(normalizeApod(imageResponse)).not.toHaveProperty("basic_html");
  });

  it("rejects media from untrusted hosts", () => {
    const apod = normalizeApod({
      ...videoResponse,
      hdurl: "https://evil.test/dynamicimage/assets/science/cds/apod/x.jpg",
      basic_html: '<video><source src="https://evil.test/x.mp4"></video>',
      permalink: "javascript:alert(1)",
    });

    expect(apod?.imageUrl).toBeNull();
    expect(apod?.videoUrl).toBeNull();
    expect(apod?.permalink).toBeNull();
  });

  it("returns null for unusable input", () => {
    expect(normalizeApod(null)).toBeNull();
    expect(normalizeApod({ title: "No date" })).toBeNull();
    expect(normalizeApod({ ...imageResponse, date: "../../etc" })).toBeNull();
  });
});
