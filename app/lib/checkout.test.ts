import { DateTime } from "luxon";
import { describe, expect, it } from "vitest";

import {
  computeSelectedAddOnLines,
  type AddOnCatalogItem,
} from "@/lib/addons";
import { calculateQuote } from "@/lib/discounts";
import { RENTAL_TIMEZONE } from "@/lib/holidays";
import { computeFullPriceBreakdown } from "@/lib/quote";
import { SEED_ADDONS } from "@/server/seed/fixtures";

const la = (iso: string) =>
  DateTime.fromISO(iso, { zone: RENTAL_TIMEZONE });

const readmeCatalog: AddOnCatalogItem[] = SEED_ADDONS.map((addon) => ({
  id: addon.id,
  slug: addon.slug,
  name: addon.name,
  description: addon.description,
  pricingModel: addon.pricing_model,
  priceCents: addon.price_cents,
}));

const allAddOnSlugs = new Set(readmeCatalog.map((addon) => addon.slug));

describe("checkout pipeline (README Parts 4–5)", () => {
  it("grand total equals discounted base plus add-ons, not a cart-wide discount", () => {
    const start = la("2025-01-19T10:00:00");
    const end = start.plus({ days: 5 });
    const quote = calculateQuote(4500, start, end);
    const addOnLines = computeSelectedAddOnLines(
      readmeCatalog,
      allAddOnSlugs,
      quote.durationHours,
    );
    const breakdown = computeFullPriceBreakdown(quote, addOnLines);

    expect(quote.discountCents).toBeGreaterThan(0);
    expect(breakdown.addOnsSubtotalCents).toBeGreaterThan(0);
    expect(breakdown.grandTotalCents).toBe(
      quote.discountedBaseCents + breakdown.addOnsSubtotalCents,
    );

    const holidayDiscountOnFullCart = Math.round(
      (quote.basePriceCents + breakdown.addOnsSubtotalCents) * 0.17,
    );
    expect(breakdown.grandTotalCents).not.toBe(
      quote.basePriceCents +
        breakdown.addOnsSubtotalCents -
        holidayDiscountOnFullCart,
    );
  });

  it("matches README smoke flow math for a 2-day trip with GPS and child seat", () => {
    const start = la("2025-06-10T10:00:00");
    const end = start.plus({ hours: 48 });
    const quote = calculateQuote(4500, start, end);
    const addOnLines = computeSelectedAddOnLines(
      readmeCatalog,
      new Set(["gps", "child_seat"]),
      quote.durationHours,
    );
    const breakdown = computeFullPriceBreakdown(quote, addOnLines);

    expect(quote.discountType).toBe("none");
    expect(quote.basePriceCents).toBe(9000);
    expect(breakdown.addOnsSubtotalCents).toBe(2100);
    expect(breakdown.grandTotalCents).toBe(11100);
  });

  it("wires calculateQuoteFromIso-style input through add-ons to grand total", () => {
    const quote = calculateQuote(
      4500,
      DateTime.fromISO("2025-06-01T10:00:00.000-07:00"),
      DateTime.fromISO("2025-06-04T10:00:00.000-07:00"),
    );
    const addOnLines = computeSelectedAddOnLines(
      readmeCatalog,
      new Set(["prepaid_fuel", "roadside"]),
      quote.durationHours,
    );
    const breakdown = computeFullPriceBreakdown(quote, addOnLines);

    expect(quote.durationDays).toBe(3);
    expect(breakdown.addOnsSubtotalCents).toBe(5200);
    expect(breakdown.grandTotalCents).toBe(
      quote.discountedBaseCents + breakdown.addOnsSubtotalCents,
    );
  });
});
