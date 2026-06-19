import { DateTime } from "luxon";

export const FICTITIOUS_HOLIDAYS = [
  { month: 1, day: 21 },
  { month: 2, day: 12 },
  { month: 3, day: 4 },
  { month: 5, day: 2 },
  { month: 6, day: 16 },
  { month: 7, day: 26 },
  { month: 8, day: 3 },
  { month: 9, day: 1 },
  { month: 11, day: 5 },
  { month: 12, day: 18 },
] as const;

export const HOLIDAY_DISCOUNT_RATE = 0.17;
/** Long-trip discount: $10 off per billable rental day (same day-count as base pricing). */
export const DURATION_DISCOUNT_CENTS_PER_DAY = 1000;
export const DURATION_THRESHOLD_HOURS = 72;
export const RENTAL_TIMEZONE = "America/Los_Angeles";

export function isHolidayDate(dt: DateTime): boolean {
  return FICTITIOUS_HOLIDAYS.some(
    (h) => dt.month === h.month && dt.day === h.day,
  );
}

export function spansHoliday(start: DateTime, end: DateTime): boolean {
  let cursor = start.setZone(RENTAL_TIMEZONE).startOf("day");
  const lastDay = end.setZone(RENTAL_TIMEZONE).startOf("day");

  while (cursor <= lastDay) {
    if (isHolidayDate(cursor)) {
      return true;
    }
    cursor = cursor.plus({ days: 1 });
  }

  return false;
}

export function qualifiesForHolidayDiscount(
  start: DateTime,
  end: DateTime,
): boolean {
  const pickupDay = start.setZone(RENTAL_TIMEZONE).startOf("day");
  const dropoffDay = end.setZone(RENTAL_TIMEZONE).startOf("day");

  return (
    spansHoliday(start, end) &&
    !isHolidayDate(pickupDay) &&
    !isHolidayDate(dropoffDay)
  );
}
