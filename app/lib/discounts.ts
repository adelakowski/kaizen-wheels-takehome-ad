import { DateTime } from "luxon";

import {
  DURATION_DISCOUNT_CENTS_PER_HOUR,
  DURATION_THRESHOLD_HOURS,
  HOLIDAY_DISCOUNT_RATE,
  qualifiesForHolidayDiscount,
} from "@/lib/holidays";
import { rentalDayCount } from "@/lib/pricing";
import type { DiscountType, QuoteBreakdown } from "@/lib/quote";

function discountPriority(type: DiscountType): number {
  switch (type) {
    case "holiday":
      return 2;
    case "duration":
      return 1;
    default:
      return 0;
  }
}

export function computeDurationHours(start: DateTime, end: DateTime): number {
  return end.diff(start, "hours").hours;
}

export function computeBasePriceCents(
  dailyRateCents: number,
  durationHours: number,
): number {
  const durationDays = rentalDayCount(durationHours);
  return dailyRateCents * durationDays;
}

export function holidayDiscountCents(basePriceCents: number): number {
  return Math.round(basePriceCents * HOLIDAY_DISCOUNT_RATE);
}

export function durationDiscountCents(durationHours: number): number {
  return Math.round(DURATION_DISCOUNT_CENTS_PER_HOUR * durationHours);
}

export function durationDiscountedBaseCents(
  dailyRateCents: number,
  durationHours: number,
): number {
  const basePriceCents = computeBasePriceCents(dailyRateCents, durationHours);
  return Math.max(0, basePriceCents - durationDiscountCents(durationHours));
}

export function calculateQuote(
  dailyRateCents: number,
  start: DateTime,
  end: DateTime,
): QuoteBreakdown {
  const durationHours = computeDurationHours(start, end);
  const durationDays = rentalDayCount(durationHours);
  const basePriceCents = computeBasePriceCents(dailyRateCents, durationHours);

  const candidates: Array<{ type: DiscountType; discountedBase: number }> = [
    { type: "none", discountedBase: basePriceCents },
  ];

  if (qualifiesForHolidayDiscount(start, end)) {
    candidates.push({
      type: "holiday",
      discountedBase: basePriceCents - holidayDiscountCents(basePriceCents),
    });
  }

  if (durationHours > DURATION_THRESHOLD_HOURS) {
    candidates.push({
      type: "duration",
      discountedBase: durationDiscountedBaseCents(dailyRateCents, durationHours),
    });
  }

  const best = candidates.reduce((a, b) =>
    a.discountedBase < b.discountedBase
      ? a
      : a.discountedBase > b.discountedBase
        ? b
        : discountPriority(a.type) >= discountPriority(b.type)
          ? a
          : b,
  );

  return {
    durationHours,
    durationDays,
    dailyRateCents,
    basePriceCents,
    discountType: best.type,
    discountCents: basePriceCents - best.discountedBase,
    discountedBaseCents: best.discountedBase,
  };
}

export function calculateQuoteFromIso(
  startTime: string,
  endTime: string,
  dailyRateCents: number,
): QuoteBreakdown {
  const start = DateTime.fromISO(startTime);
  const end = DateTime.fromISO(endTime);

  if (!start.isValid || !end.isValid) {
    throw new Error(
      "BAD REQUEST: Invalid date format. Please use ISO 8601 format.",
    );
  }

  if (end <= start) {
    throw new Error("BAD REQUEST: end_time must be after start_time");
  }

  return calculateQuote(dailyRateCents, start, end);
}
