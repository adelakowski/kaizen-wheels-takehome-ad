import { describe, expect, it } from "vitest";

import { reservationIntervalsOverlap } from "@/lib/availability";

describe("reservationIntervalsOverlap", () => {
  const requestedStart = new Date("2025-06-10T10:00:00.000Z");
  const requestedEnd = new Date("2025-06-12T10:00:00.000Z");

  it("detects overlapping reservations", () => {
    expect(
      reservationIntervalsOverlap(
        requestedStart,
        requestedEnd,
        new Date("2025-06-11T10:00:00.000Z"),
        new Date("2025-06-13T10:00:00.000Z"),
      ),
    ).toBe(true);
  });

  it("allows back-to-back bookings under half-open semantics", () => {
    expect(
      reservationIntervalsOverlap(
        requestedStart,
        requestedEnd,
        new Date("2025-06-08T10:00:00.000Z"),
        requestedStart,
      ),
    ).toBe(false);

    expect(
      reservationIntervalsOverlap(
        requestedStart,
        requestedEnd,
        requestedEnd,
        new Date("2025-06-14T10:00:00.000Z"),
      ),
    ).toBe(false);
  });

  it("detects fully enclosed and identical overlaps", () => {
    expect(
      reservationIntervalsOverlap(
        requestedStart,
        requestedEnd,
        new Date("2025-06-10T12:00:00.000Z"),
        new Date("2025-06-11T12:00:00.000Z"),
      ),
    ).toBe(true);
  });

  it("returns false for separated ranges", () => {
    expect(
      reservationIntervalsOverlap(
        requestedStart,
        requestedEnd,
        new Date("2025-06-05T10:00:00.000Z"),
        new Date("2025-06-07T10:00:00.000Z"),
      ),
    ).toBe(false);
  });

  it("models seeded corolla reservation blocking an overlapping search window", () => {
    const reservationStart = new Date("2025-06-10T10:00:00.000Z");
    const reservationEnd = new Date("2025-06-12T10:00:00.000Z");
    const searchStart = new Date("2025-06-11T10:00:00.000Z");
    const searchEnd = new Date("2025-06-13T10:00:00.000Z");

    expect(
      reservationIntervalsOverlap(
        searchStart,
        searchEnd,
        reservationStart,
        reservationEnd,
      ),
    ).toBe(true);
  });

  it("allows a search that ends exactly when a reservation begins", () => {
    const reservationStart = new Date("2025-06-10T10:00:00.000Z");
    const reservationEnd = new Date("2025-06-12T10:00:00.000Z");
    const searchStart = new Date("2025-06-08T10:00:00.000Z");
    const searchEnd = reservationStart;

    expect(
      reservationIntervalsOverlap(
        searchStart,
        searchEnd,
        reservationStart,
        reservationEnd,
      ),
    ).toBe(false);
  });
});
