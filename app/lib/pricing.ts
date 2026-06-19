import { DateTime } from "luxon";

export function rentalDayCount(durationHours: number): number {
  return Math.max(1, Math.ceil(durationHours / 24));
}

export function parseAndValidateTimeRange(startTime: string, endTime: string) {
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

  return { start, end };
}

export function calculateRentalPrice(
  start: DateTime,
  end: DateTime,
  dailyRateCents: number,
) {
  const durationInHours = end.diff(start, "hours").hours;
  const durationDays = rentalDayCount(durationInHours);

  return {
    totalPriceCents: dailyRateCents * durationDays,
    dailyRateCents,
    durationInHours,
    durationDays,
  };
}

export function calculateRentalPriceFromIso(
  startTime: string,
  endTime: string,
  dailyRateCents: number,
) {
  const { start, end } = parseAndValidateTimeRange(startTime, endTime);
  return calculateRentalPrice(start, end, dailyRateCents);
}
