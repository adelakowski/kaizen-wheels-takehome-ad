import { describe, expect, it } from "vitest";

import {
  buildSearchParams,
  DEFAULT_FILTERS,
  DEFAULT_MAX_RATE_CENTS,
  DEFAULT_MIN_RATE_CENTS,
  hasValidDateRange,
  parseSearchFilters,
  searchParamsToURLSearchParams,
  type SearchFilters,
} from "@/lib/search-params";

describe("parseSearchFilters", () => {
  it("parses defaults when params are absent", () => {
    expect(parseSearchFilters(new URLSearchParams())).toEqual(DEFAULT_FILTERS);
  });

  it("parses dates, classes, price range, passengers, and make", () => {
    const params = new URLSearchParams({
      start: "2025-06-01T10:00:00.000Z",
      end: "2025-06-03T10:00:00.000Z",
      class: "Compact,SUV,Invalid",
      minPrice: "5000",
      maxPrice: "15000",
      passengers: "4",
      make: "Toyota",
    });

    expect(parseSearchFilters(params)).toEqual({
      startTime: "2025-06-01T10:00:00.000Z",
      endTime: "2025-06-03T10:00:00.000Z",
      classifications: ["Compact", "SUV"],
      minDailyRateCents: 5000,
      maxDailyRateCents: 15000,
      minPassengers: 4,
      make: "Toyota",
    });
  });
});

describe("buildSearchParams", () => {
  it("omits default values from the URL", () => {
    expect(buildSearchParams(DEFAULT_FILTERS).toString()).toBe("");
  });

  it("serializes non-default filters", () => {
    const params = buildSearchParams({
      startTime: "2025-06-01T10:00:00.000Z",
      endTime: "2025-06-03T10:00:00.000Z",
      classifications: ["Luxury"],
      minDailyRateCents: DEFAULT_MIN_RATE_CENTS + 100,
      maxDailyRateCents: DEFAULT_MAX_RATE_CENTS - 100,
      minPassengers: 2,
      make: "BMW",
    });

    expect(params.get("start")).toBe("2025-06-01T10:00:00.000Z");
    expect(params.get("end")).toBe("2025-06-03T10:00:00.000Z");
    expect(params.get("class")).toBe("Luxury");
    expect(params.get("minPrice")).toBe(String(DEFAULT_MIN_RATE_CENTS + 100));
    expect(params.get("maxPrice")).toBe(String(DEFAULT_MAX_RATE_CENTS - 100));
    expect(params.get("passengers")).toBe("2");
    expect(params.get("make")).toBe("BMW");
  });
});

describe("hasValidDateRange", () => {
  it("requires both dates with end after start", () => {
    expect(hasValidDateRange(DEFAULT_FILTERS)).toBe(false);
    expect(
      hasValidDateRange({
        ...DEFAULT_FILTERS,
        startTime: "2025-06-01T10:00:00.000Z",
      }),
    ).toBe(false);
    expect(
      hasValidDateRange({
        ...DEFAULT_FILTERS,
        startTime: "2025-06-03T10:00:00.000Z",
        endTime: "2025-06-01T10:00:00.000Z",
      }),
    ).toBe(false);
    expect(
      hasValidDateRange({
        ...DEFAULT_FILTERS,
        startTime: "2025-06-01T10:00:00.000Z",
        endTime: "2025-06-03T10:00:00.000Z",
      }),
    ).toBe(true);
    expect(
      hasValidDateRange({
        ...DEFAULT_FILTERS,
        startTime: "not-a-date",
        endTime: "2025-06-03T10:00:00.000Z",
      }),
    ).toBe(false);
  });
});

describe("searchParamsToURLSearchParams", () => {
  it("copies scalar and repeated values", () => {
    const params = searchParamsToURLSearchParams({
      start: "2025-06-01T10:00:00.000Z",
      class: ["Compact", "SUV"],
      ignored: undefined,
    });

    expect(params.get("start")).toBe("2025-06-01T10:00:00.000Z");
    expect(params.getAll("class")).toEqual(["Compact", "SUV"]);
    expect(params.has("ignored")).toBe(false);
  });
});

describe("filter round-trip (README Part 3)", () => {
  it("preserves active filters through parse and build", () => {
    const filters: SearchFilters = {
      startTime: "2025-06-01T10:00:00.000Z",
      endTime: "2025-06-05T10:00:00.000Z",
      classifications: ["Compact", "SUV"],
      minDailyRateCents: 5000,
      maxDailyRateCents: 15000,
      minPassengers: 4,
      make: "Toyota",
    };

    const roundTripped = parseSearchFilters(buildSearchParams(filters));

    expect(roundTripped).toEqual(filters);
    expect(hasValidDateRange(roundTripped)).toBe(true);
  });
});
