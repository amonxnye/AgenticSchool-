import { describe, expect, it } from "vitest";
import { bucketByDay } from "./analytics";

describe("bucketByDay", () => {
  it("zero-fills every day in the window and counts turns per UTC day", () => {
    const now = new Date("2026-09-07T10:00:00Z");
    const turns = [
      new Date("2026-09-07T01:00:00Z"),
      new Date("2026-09-07T23:00:00Z"),
      new Date("2026-09-05T12:00:00Z"),
      new Date("2026-08-01T12:00:00Z"), // outside the window
    ];
    const days = bucketByDay(turns, 3, now);
    expect(days).toEqual([
      { day: "2026-09-05", turns: 1 },
      { day: "2026-09-06", turns: 0 },
      { day: "2026-09-07", turns: 2 },
    ]);
  });
});
