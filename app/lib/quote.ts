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

export function toQuoteBreakdown(quote: {
  totalPriceCents: number;
  dailyRateCents: number;
  durationInHours: number;
  durationDays: number;
}): QuoteBreakdown {
  return {
    durationHours: quote.durationInHours,
    durationDays: quote.durationDays,
    dailyRateCents: quote.dailyRateCents,
    basePriceCents: quote.totalPriceCents,
    discountType: "none",
    discountCents: 0,
    discountedBaseCents: quote.totalPriceCents,
  };
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
