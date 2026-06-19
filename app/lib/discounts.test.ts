import { DateTime } from "luxon";
import { describe, expect, it } from "vitest";

import {
  calculateQuote,
  calculateQuoteFromIso,
  computeBasePriceCents,
  computeDurationHours,
  durationDiscountCents,
  durationDiscountedBaseCents,
  holidayDiscountCents,
} from "@/lib/discounts";
import { RENTAL_TIMEZONE } from "@/lib/holidays";

const la = (iso: string) =>
  DateTime.fromISO(iso, { zone: RENTAL_TIMEZONE });

describe("computeDurationHours", () => {
  it("returns fractional hours", () => {
    const start = la("2025-06-01T10:00:00");
    const end = start.plus({ hours: 72, minutes: 30 });
    expect(computeDurationHours(start, end)).toBeCloseTo(72.5, 5);
  });
});

describe("computeBasePriceCents", () => {
  it("uses daily rate times billable days", () => {
    expect(computeBasePriceCents(4500, 25)).toBe(9000);
    expect(computeBasePriceCents(4500, 24)).toBe(4500);
  });
});

describe("holidayDiscountCents", () => {
  it("applies 17% rounded to integer cents", () => {
    expect(holidayDiscountCents(10000)).toBe(1700);
    expect(holidayDiscountCents(9999)).toBe(Math.round(9999 * 0.17));
  });
});

describe("durationDiscountCents", () => {
  it("applies $10 per billable day", () => {
    expect(durationDiscountCents(96)).toBe(4000);
    expect(durationDiscountCents(25)).toBe(2000);
    expect(durationDiscountCents(24)).toBe(1000);
  });
});

describe("durationDiscountedBaseCents", () => {
  it("subtracts duration discount from base and clamps at zero", () => {
    expect(durationDiscountedBaseCents(4500, 96)).toBe(14000);
    expect(durationDiscountedBaseCents(500, 96)).toBe(0);
  });
});

describe("calculateQuote", () => {
  it("applies no discount for short non-holiday trips", () => {
    const start = la("2025-03-01T10:00:00");
    const end = start.plus({ hours: 48 });
    const quote = calculateQuote(4500, start, end);

    expect(quote.discountType).toBe("none");
    expect(quote.basePriceCents).toBe(9000);
    expect(quote.discountedBaseCents).toBe(9000);
    expect(quote.discountCents).toBe(0);
  });

  it("applies holiday discount when eligible", () => {
    const start = la("2025-01-20T10:00:00");
    const end = la("2025-01-22T10:00:00");
    const quote = calculateQuote(10000, start, end);

    expect(quote.discountType).toBe("holiday");
    expect(quote.basePriceCents).toBe(20000);
    expect(quote.discountCents).toBe(3400);
    expect(quote.discountedBaseCents).toBe(16600);
  });

  it("does not apply duration discount at exactly 72 hours", () => {
    const start = la("2025-06-01T10:00:00");
    const end = start.plus({ hours: 72 });
    const quote = calculateQuote(4500, start, end);

    expect(quote.discountType).toBe("none");
  });

  it("applies duration discount above 72 hours using $10/day", () => {
    const start = la("2025-06-01T10:00:00");
    const end = start.plus({ hours: 72, minutes: 30 });
    const quote = calculateQuote(4500, start, end);

    expect(quote.discountType).toBe("duration");
    expect(quote.durationDays).toBe(4);
    expect(quote.basePriceCents).toBe(18000);
    expect(quote.discountCents).toBe(4000);
    expect(quote.discountedBaseCents).toBe(14000);
  });

  it("prefers the better discount when both qualify", () => {
    const start = la("2025-01-19T10:00:00");
    const end = start.plus({ days: 5 });
    const quote = calculateQuote(4500, start, end);

    expect(["holiday", "duration"]).toContain(quote.discountType);
    expect(quote.discountedBaseCents).toBeLessThan(quote.basePriceCents);
  });

  it("prefers duration when it saves more than holiday", () => {
    const start = la("2025-01-19T10:00:00");
    const end = start.plus({ days: 5 });
    const quote = calculateQuote(4500, start, end);

    expect(quote.discountType).toBe("duration");
    expect(quote.discountedBaseCents).toBe(17500);
  });

  it("prefers holiday on a tie between holiday and duration discounts", () => {
    const start = la("2025-01-19T10:00:00");
    const end = start.plus({ hours: 85 });
    const quote = calculateQuote(5882, start, end);

    expect(quote.durationDays).toBe(4);
    expect(quote.discountCents).toBe(4000);
    expect(quote.discountType).toBe("holiday");
  });

  it("breaks ties at zero base using discount priority", () => {
    const start = la("2025-01-20T10:00:00");
    const end = start.plus({ hours: 96 });
    const quote = calculateQuote(0, start, end);

    expect(quote.basePriceCents).toBe(0);
    expect(quote.discountedBaseCents).toBe(0);
    expect(quote.discountType).toBe("holiday");
  });
});

describe("calculateQuoteFromIso", () => {
  it("returns a quote for valid ISO input", () => {
    const quote = calculateQuoteFromIso(
      "2025-06-01T10:00:00.000-07:00",
      "2025-06-02T10:00:00.000-07:00",
      4500,
    );
    expect(quote.basePriceCents).toBe(4500);
  });

  it("rejects invalid ISO input", () => {
    expect(() =>
      calculateQuoteFromIso("bad", "2025-06-02T10:00:00.000Z", 4500),
    ).toThrow("BAD REQUEST: Invalid date format");
  });

  it("rejects non-increasing ranges", () => {
    expect(() =>
      calculateQuoteFromIso(
        "2025-06-02T10:00:00.000Z",
        "2025-06-01T10:00:00.000Z",
        4500,
      ),
    ).toThrow("BAD REQUEST: end_time must be after start_time");
  });
});
