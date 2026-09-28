import { describe, expect, it } from "vitest";
import {
  addDays,
  formatDisplayDate,
  getDateWindow,
  isInWindow,
  isIsoDate,
  oneYearBefore,
  randomDateInWindow,
  toApiDate,
  todayInApodTimeZone,
} from "./dates";

describe("isIsoDate", () => {
  it("accepts real calendar dates", () => {
    expect(isIsoDate("2026-09-11")).toBe(true);
    expect(isIsoDate("2024-02-29")).toBe(true);
  });

  it("rejects malformed or impossible dates", () => {
    for (const value of ["2026-9-11", "2026-02-30", "2025-02-29", "2026-13-01", "../etc", "", null, 20260911]) {
      expect(isIsoDate(value)).toBe(false);
    }
  });
});

describe("todayInApodTimeZone", () => {
  it("uses US Eastern time, not UTC", () => {
    // 02:00 UTC on Sep 29 is still 22:00 on Sep 28 in New York.
    expect(todayInApodTimeZone(new Date("2026-09-29T02:00:00Z"))).toBe("2026-09-28");
  });
});

describe("oneYearBefore", () => {
  it("returns the same calendar day a year earlier", () => {
    expect(oneYearBefore("2026-09-28")).toBe("2025-09-28");
  });

  it("clamps leap day to Feb 28", () => {
    expect(oneYearBefore("2028-02-29")).toBe("2027-02-28");
  });
});

describe("date window", () => {
  const dateWindow = getDateWindow(new Date("2026-09-28T16:00:00Z"));

  it("spans one year back from today", () => {
    expect(dateWindow).toEqual({ min: "2025-09-28", max: "2026-09-28" });
  });

  it("includes both ends and excludes dates outside", () => {
    expect(isInWindow("2025-09-28", dateWindow)).toBe(true);
    expect(isInWindow("2026-09-28", dateWindow)).toBe(true);
    expect(isInWindow("2025-09-27", dateWindow)).toBe(false);
    expect(isInWindow("2026-09-29", dateWindow)).toBe(false);
  });
});

describe("addDays", () => {
  it("moves forward and back across month and year boundaries", () => {
    expect(addDays("2026-01-31", 1)).toBe("2026-02-01");
    expect(addDays("2026-01-01", -1)).toBe("2025-12-31");
  });

  it("handles leap years", () => {
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
    expect(addDays("2027-02-28", 1)).toBe("2027-03-01");
  });
});

describe("randomDateInWindow", () => {
  const dateWindow = { min: "2025-09-28", max: "2026-09-28" };

  it("covers both ends of the window", () => {
    expect(randomDateInWindow(dateWindow, () => 0)).toBe("2025-09-28");
    expect(randomDateInWindow(dateWindow, () => 0.999999)).toBe("2026-09-28");
  });

  it("always returns a valid date inside the window", () => {
    for (let i = 0; i < 500; i++) {
      const date = randomDateInWindow(dateWindow);
      expect(isIsoDate(date)).toBe(true);
      expect(isInWindow(date, dateWindow)).toBe(true);
    }
  });
});

describe("formatting", () => {
  it("converts to the upstream YYMMDD route format", () => {
    expect(toApiDate("2026-09-11")).toBe("260911");
  });

  it("formats for display without shifting the day", () => {
    expect(formatDisplayDate("2026-01-01")).toBe("January 1, 2026");
  });
});
