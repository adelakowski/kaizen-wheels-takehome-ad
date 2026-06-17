import type { Classification } from "@/server/data";

export type SearchFilters = {
  startTime?: string;
  endTime?: string;
  classifications: Classification[];
  minDailyRateCents: number;
  maxDailyRateCents: number;
  minPassengers: number;
  make: string;
};

export const DEFAULT_MIN_RATE_CENTS = 3200;
export const DEFAULT_MAX_RATE_CENTS = 22000;

export const DEFAULT_FILTERS: SearchFilters = {
  classifications: [],
  minDailyRateCents: DEFAULT_MIN_RATE_CENTS,
  maxDailyRateCents: DEFAULT_MAX_RATE_CENTS,
  minPassengers: 1,
  make: "",
};

const CLASSIFICATIONS: Classification[] = [
  "Compact",
  "SUV",
  "Sports",
  "Subcompact",
  "Minivan",
  "Luxury",
];

export function parseSearchFilters(
  params: URLSearchParams,
): SearchFilters {
  const classParam = params.get("class");
  const classifications = classParam
    ? (classParam
        .split(",")
        .filter((value): value is Classification =>
          CLASSIFICATIONS.includes(value as Classification),
        ) as Classification[])
    : [];

  const minPrice = params.get("minPrice");
  const maxPrice = params.get("maxPrice");
  const passengers = params.get("passengers");

  return {
    startTime: params.get("start") ?? undefined,
    endTime: params.get("end") ?? undefined,
    classifications,
    minDailyRateCents: minPrice
      ? Number.parseInt(minPrice, 10)
      : DEFAULT_MIN_RATE_CENTS,
    maxDailyRateCents: maxPrice
      ? Number.parseInt(maxPrice, 10)
      : DEFAULT_MAX_RATE_CENTS,
    minPassengers: passengers ? Number.parseInt(passengers, 10) : 1,
    make: params.get("make") ?? "",
  };
}

export function buildSearchParams(
  filters: SearchFilters,
): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.startTime) params.set("start", filters.startTime);
  if (filters.endTime) params.set("end", filters.endTime);
  if (filters.classifications.length > 0) {
    params.set("class", filters.classifications.join(","));
  }
  if (filters.minDailyRateCents !== DEFAULT_MIN_RATE_CENTS) {
    params.set("minPrice", String(filters.minDailyRateCents));
  }
  if (filters.maxDailyRateCents !== DEFAULT_MAX_RATE_CENTS) {
    params.set("maxPrice", String(filters.maxDailyRateCents));
  }
  if (filters.minPassengers > 1) {
    params.set("passengers", String(filters.minPassengers));
  }
  if (filters.make) params.set("make", filters.make);

  return params;
}

export function hasValidDateRange(filters: SearchFilters): boolean {
  if (!filters.startTime || !filters.endTime) return false;
  const start = new Date(filters.startTime);
  const end = new Date(filters.endTime);
  return !Number.isNaN(start.getTime()) && end > start;
}

export function searchParamsToURLSearchParams(
  params: Record<string, string | string[] | undefined>,
): URLSearchParams {
  const urlParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const item of value) {
        urlParams.append(key, item);
      }
    } else {
      urlParams.set(key, value);
    }
  }

  return urlParams;
}
