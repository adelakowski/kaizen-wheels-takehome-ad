/**
 * Half-open interval overlap for reservations [start, end).
 * Conflicts when reservation.start < requestedEnd AND reservation.end > requestedStart.
 */
export function reservationIntervalsOverlap(
  requestedStart: Date,
  requestedEnd: Date,
  reservationStart: Date,
  reservationEnd: Date,
): boolean {
  return reservationStart < requestedEnd && reservationEnd > requestedStart;
}
