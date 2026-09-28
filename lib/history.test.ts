import { describe, expect, it } from "vitest";
import { addEntry, parseHistory, type HistoryEntry } from "./history";

const dateWindow = { min: "2025-09-28", max: "2026-09-28" };
const image = "https://assets.science.nasa.gov/content/dam/science/cds/apod/a.jpg";

const entry = (date: string): HistoryEntry => ({ date, title: `APOD ${date}`, imageUrl: image });

describe("parseHistory", () => {
  it("returns an empty list for missing or corrupt storage", () => {
    expect(parseHistory(null, dateWindow)).toEqual([]);
    expect(parseHistory("{not json", dateWindow)).toEqual([]);
    expect(parseHistory('{"date":"2026-01-01"}', dateWindow)).toEqual([]);
  });

  it("prunes dates that have left the rolling window", () => {
    const raw = JSON.stringify([entry("2026-09-01"), entry("2025-09-27"), entry("2026-09-29")]);
    expect(parseHistory(raw, dateWindow).map((e) => e.date)).toEqual(["2026-09-01"]);
  });

  it("drops malformed entries and duplicate dates", () => {
    const raw = JSON.stringify([
      entry("2026-09-01"),
      entry("2026-09-01"),
      { date: "2026-09-02" },
      { date: "not-a-date", title: "x" },
      "junk",
    ]);
    expect(parseHistory(raw, dateWindow)).toEqual([entry("2026-09-01")]);
  });

  it("discards image URLs that are not on the NASA allowlist", () => {
    const raw = JSON.stringify([{ ...entry("2026-09-01"), imageUrl: "https://evil.test/x.jpg" }]);
    expect(parseHistory(raw, dateWindow)[0].imageUrl).toBeNull();
  });
});

describe("addEntry", () => {
  it("puts the newest visit first", () => {
    const result = addEntry([entry("2026-09-01")], entry("2026-09-02"));
    expect(result.map((e) => e.date)).toEqual(["2026-09-02", "2026-09-01"]);
  });

  it("moves a revisited date to the front instead of duplicating it", () => {
    const result = addEntry([entry("2026-09-02"), entry("2026-09-01")], entry("2026-09-01"));
    expect(result.map((e) => e.date)).toEqual(["2026-09-01", "2026-09-02"]);
  });

  it("caps the list at 50 entries", () => {
    const many = Array.from({ length: 50 }, (_, i) => entry(`entry-${i}`));
    expect(addEntry(many, entry("2026-09-01"))).toHaveLength(50);
  });
});
