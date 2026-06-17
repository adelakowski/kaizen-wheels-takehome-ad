import type { Vehicle } from "@/server/data";
import type { SearchFilters } from "@/lib/search-params";

export function filterVehicles(
  vehicles: Vehicle[],
  filters: SearchFilters,
): Vehicle[] {
  return vehicles.filter((vehicle) => {
    if (
      filters.classifications.length > 0 &&
      !filters.classifications.includes(vehicle.classification)
    ) {
      return false;
    }

    if (vehicle.daily_rate_cents < filters.minDailyRateCents) {
      return false;
    }

    if (vehicle.daily_rate_cents > filters.maxDailyRateCents) {
      return false;
    }

    if (vehicle.max_passengers < filters.minPassengers) {
      return false;
    }

    if (
      filters.make &&
      !vehicle.make.toLowerCase().includes(filters.make.toLowerCase())
    ) {
      return false;
    }

    return true;
  });
}
