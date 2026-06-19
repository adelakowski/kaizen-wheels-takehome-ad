import { describe, expect, it } from "vitest";

import {
  calculateRentalPrice,
  calculateRentalPriceFromIso,
  parseAndValidateTimeRange,
  rentalDayCount,
} from "@/lib/pricing";

describe("rentalDayCount", () => {
  it("bills at least one day", () => {
    expect(rentalDayCount(0)).toBe(1);
    expect(rentalDayCount(1)).toBe(1);
    expect(rentalDayCount(24)).toBe(1);
  });

  it("ceilings partial days", () => {
    expect(rentalDayCount(25)).toBe(2);
    expect(rentalDayCount(48)).toBe(2);
    expect(rentalDayCount(49)).toBe(3);
  });
});

describe("parseAndValidateTimeRange", () => {
  it("parses valid ISO range", () => {
    const { start, end } = parseAndValidateTimeRange(
      "2025-06-01T10:00:00.000Z",
      "2025-06-03T10:00:00.000Z",
    );
    expect(start.isValid).toBe(true);
    expect(end.isValid).toBe(true);
    expect(end > start).toBe(true);
  });

  it("rejects invalid dates", () => {
    expect(() =>
      parseAndValidateTimeRange("not-a-date", "2025-06-03T10:00:00.000Z"),
    ).toThrow("BAD REQUEST: Invalid date format");
  });

  it("rejects end before or equal to start", () => {
    expect(() =>
      parseAndValidateTimeRange(
        "2025-06-03T10:00:00.000Z",
        "2025-06-01T10:00:00.000Z",
      ),
    ).toThrow("BAD REQUEST: end_time must be after start_time");

    expect(() =>
      parseAndValidateTimeRange(
        "2025-06-01T10:00:00.000Z",
        "2025-06-01T10:00:00.000Z",
      ),
    ).toThrow("BAD REQUEST: end_time must be after start_time");
  });
});

describe("calculateRentalPrice", () => {
  it("multiplies daily rate by billable days", () => {
    const start = parseAndValidateTimeRange(
      "2025-06-01T10:00:00.000Z",
      "2025-06-03T10:00:00.000Z",
    ).start;
    const end = parseAndValidateTimeRange(
      "2025-06-01T10:00:00.000Z",
      "2025-06-03T10:00:00.000Z",
    ).end;

    const result = calculateRentalPrice(start, end, 4500);
    expect(result.durationDays).toBe(2);
    expect(result.totalPriceCents).toBe(9000);
    expect(result.dailyRateCents).toBe(4500);
  });
});

describe("calculateRentalPriceFromIso", () => {
  it("delegates to calculateRentalPrice", () => {
    const result = calculateRentalPriceFromIso(
      "2025-06-01T10:00:00.000Z",
      "2025-06-02T10:00:00.000Z",
      22000,
    );
    expect(result.totalPriceCents).toBe(22000);
    expect(result.durationDays).toBe(1);
  });
});
