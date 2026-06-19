import { describe, expect, it } from "vitest";

import {
  computeFullPriceBreakdown,
  formatDiscountLabel,
  type QuoteBreakdown,
} from "@/lib/quote";

const baseQuote: QuoteBreakdown = {
  durationHours: 48,
  durationDays: 2,
  dailyRateCents: 4500,
  basePriceCents: 9000,
  discountType: "none",
  discountCents: 0,
  discountedBaseCents: 9000,
};

describe("formatDiscountLabel", () => {
  it("returns empty string when no discount applies", () => {
    expect(formatDiscountLabel(baseQuote)).toBe("");
  });

  it("labels holiday discounts", () => {
    expect(
      formatDiscountLabel({ ...baseQuote, discountType: "holiday" }),
    ).toBe("Holiday discount (−17%)");
  });

  it("labels duration discounts per day", () => {
    expect(
      formatDiscountLabel({
        ...baseQuote,
        discountType: "duration",
        durationDays: 4,
      }),
    ).toBe("Long-trip discount (−$10/day × 4 days)");

    expect(
      formatDiscountLabel({
        ...baseQuote,
        discountType: "duration",
        durationDays: 1,
      }),
    ).toBe("Long-trip discount (−$10/day × 1 day)");
  });
});

describe("computeFullPriceBreakdown", () => {
  it("adds add-on totals after the discounted base", () => {
    const breakdown = computeFullPriceBreakdown(baseQuote, [
      { slug: "gps", label: "GPS Navigation", totalCents: 500 },
      { slug: "child_seat", label: "Child seat (×2 days)", totalCents: 1600 },
    ]);

    expect(breakdown.addOnsSubtotalCents).toBe(2100);
    expect(breakdown.grandTotalCents).toBe(11100);
    expect(breakdown.discountedBaseCents).toBe(9000);
  });

  it("handles no selected add-ons", () => {
    const breakdown = computeFullPriceBreakdown(baseQuote, []);
    expect(breakdown.addOnsSubtotalCents).toBe(0);
    expect(breakdown.grandTotalCents).toBe(9000);
  });

  it("does not apply discounts to add-on line items", () => {
    const discountedQuote: QuoteBreakdown = {
      durationHours: 120,
      durationDays: 5,
      dailyRateCents: 4500,
      basePriceCents: 22500,
      discountType: "duration",
      discountCents: 5000,
      discountedBaseCents: 17500,
    };
    const addOnLines = [
      { slug: "gps", label: "GPS Navigation", totalCents: 500 },
      { slug: "child_seat", label: "Child seat (×5 days)", totalCents: 4000 },
    ];
    const breakdown = computeFullPriceBreakdown(discountedQuote, addOnLines);

    expect(breakdown.grandTotalCents).toBe(22000);
    expect(breakdown.grandTotalCents).toBe(
      discountedQuote.discountedBaseCents + breakdown.addOnsSubtotalCents,
    );

    const cartWideHolidayDiscount = Math.round(
      (discountedQuote.basePriceCents + breakdown.addOnsSubtotalCents) * 0.83,
    );
    expect(breakdown.grandTotalCents).not.toBe(cartWideHolidayDiscount);
  });
});
