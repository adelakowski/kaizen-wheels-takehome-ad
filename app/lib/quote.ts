export type DiscountType = "holiday" | "duration" | "none";

export type QuoteBreakdown = {
  durationHours: number;
  durationDays: number;
  dailyRateCents: number;
  basePriceCents: number;
  discountType: DiscountType;
  discountCents: number;
  discountedBaseCents: number;
};

export function formatDiscountLabel(breakdown: QuoteBreakdown): string {
  if (breakdown.discountType === "holiday") {
    return "Holiday discount (−17%)";
  }
  if (breakdown.discountType === "duration") {
    const days =
      breakdown.durationDays === 1
        ? "1 day"
        : `${breakdown.durationDays} days`;
    return `Long-trip discount (−$10/day × ${days})`;
  }
  return "";
}

export type AddOnLine = {
  slug: string;
  label: string;
  totalCents: number;
};

export type FullPriceBreakdown = QuoteBreakdown & {
  addOnLines: AddOnLine[];
  addOnsSubtotalCents: number;
  grandTotalCents: number;
};

export function computeFullPriceBreakdown(
  quote: QuoteBreakdown,
  addOnLines: AddOnLine[],
): FullPriceBreakdown {
  const addOnsSubtotalCents = addOnLines.reduce(
    (sum, line) => sum + line.totalCents,
    0,
  );

  return {
    ...quote,
    addOnLines,
    addOnsSubtotalCents,
    grandTotalCents: quote.discountedBaseCents + addOnsSubtotalCents,
  };
}
