import { DateTime } from "luxon";
import { describe, expect, it } from "vitest";

import {
  FICTITIOUS_HOLIDAYS,
  isHolidayDate,
  qualifiesForHolidayDiscount,
  RENTAL_TIMEZONE,
  spansHoliday,
} from "@/lib/holidays";

const la = (iso: string) =>
  DateTime.fromISO(iso, { zone: RENTAL_TIMEZONE });

describe("isHolidayDate", () => {
  it("matches fictitious holidays regardless of year", () => {
    expect(isHolidayDate(la("2025-01-21T15:00:00"))).toBe(true);
    expect(isHolidayDate(la("2026-06-16T08:00:00"))).toBe(true);
    expect(isHolidayDate(la("2025-01-20T15:00:00"))).toBe(false);
  });

  it("covers every configured holiday", () => {
    for (const holiday of FICTITIOUS_HOLIDAYS) {
      expect(
        isHolidayDate(
          DateTime.fromObject(
            { year: 2025, month: holiday.month, day: holiday.day },
            { zone: RENTAL_TIMEZONE },
          ),
        ),
      ).toBe(true);
    }
  });
});

describe("spansHoliday", () => {
  it("returns true when an interior day is a holiday", () => {
    const start = la("2025-01-20T10:00:00");
    const end = la("2025-01-22T10:00:00");
    expect(spansHoliday(start, end)).toBe(true);
  });

  it("returns false when no holiday falls in range", () => {
    const start = la("2025-01-10T10:00:00");
    const end = la("2025-01-12T10:00:00");
    expect(spansHoliday(start, end)).toBe(false);
  });
});

describe("qualifiesForHolidayDiscount", () => {
  it("qualifies when trip spans a holiday but not on pickup or dropoff days", () => {
    const start = la("2025-01-20T10:00:00");
    const end = la("2025-01-22T10:00:00");
    expect(qualifiesForHolidayDiscount(start, end)).toBe(true);
  });

  it("rejects pickup on a holiday", () => {
    const start = la("2025-06-16T10:00:00");
    const end = la("2025-06-18T10:00:00");
    expect(qualifiesForHolidayDiscount(start, end)).toBe(false);
  });

  it("rejects dropoff on a holiday", () => {
    const start = la("2025-11-01T10:00:00");
    const end = la("2025-11-05T10:00:00");
    expect(qualifiesForHolidayDiscount(start, end)).toBe(false);
  });

  it("rejects when trip does not span a holiday", () => {
    const start = la("2025-03-01T10:00:00");
    const end = la("2025-03-03T10:00:00");
    expect(qualifiesForHolidayDiscount(start, end)).toBe(false);
  });

  it("rejects pickup on a holiday even when another holiday is in range", () => {
    const start = la("2025-06-16T10:00:00");
    const end = la("2025-07-28T10:00:00");
    expect(spansHoliday(start, end)).toBe(true);
    expect(qualifiesForHolidayDiscount(start, end)).toBe(false);
  });

  it("rejects dropoff on Dec 18 even when the trip spans other holidays", () => {
    const start = la("2025-11-20T10:00:00");
    const end = la("2025-12-18T10:00:00");
    expect(spansHoliday(start, end)).toBe(true);
    expect(qualifiesForHolidayDiscount(start, end)).toBe(false);
  });

  it("still applies a single holiday discount when multiple holidays are spanned", () => {
    const start = la("2025-07-20T10:00:00");
    const end = la("2025-08-05T10:00:00");
    expect(spansHoliday(start, end)).toBe(true);
    expect(qualifiesForHolidayDiscount(start, end)).toBe(true);
  });
});
