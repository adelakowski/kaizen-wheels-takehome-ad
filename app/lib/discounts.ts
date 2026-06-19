import { DateTime } from "luxon";

import {
  DURATION_DISCOUNT_CENTS_PER_DAY,
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

/** Base rental = vehicle daily rate × billable days (ceil of hours / 24, min 1). */
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
  return DURATION_DISCOUNT_CENTS_PER_DAY * rentalDayCount(durationHours);
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

  const best = [...candidates].sort((a, b) => {
    if (a.discountedBase !== b.discountedBase) {
      return a.discountedBase - b.discountedBase;
    }
    return discountPriority(b.type) - discountPriority(a.type);
  })[0];

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
