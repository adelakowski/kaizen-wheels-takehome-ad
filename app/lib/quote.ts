export type DiscountType = "holiday" | "duration" | "none";

export type QuoteBreakdown = {
  durationHours: number;
  hourlyRateCents: number;
  basePriceCents: number;
  discountType: DiscountType;
  discountCents: number;
  discountedBaseCents: number;
};

export function toQuoteBreakdown(quote: {
  totalPriceCents: number;
  hourlyRateCents: number;
  durationInHours: number;
}): QuoteBreakdown {
  return {
    durationHours: quote.durationInHours,
    hourlyRateCents: quote.hourlyRateCents,
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
