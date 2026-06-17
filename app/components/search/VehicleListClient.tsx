"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { VehicleCard } from "@/components/search/VehicleCard";
import { VehicleGrid, VehicleGridEmpty } from "@/components/search/VehicleGrid";
import { filterVehicles } from "@/lib/filters";
import { calculateRentalPriceFromIso } from "@/lib/pricing";
import { toQuoteBreakdown } from "@/lib/quote";
import { parseSearchFilters } from "@/lib/search-params";
import type { Vehicle } from "@/server/data";

export function VehicleListClient({ vehicles }: { vehicles: Vehicle[] }) {
  const searchParams = useSearchParams();
  const filters = useMemo(
    () => parseSearchFilters(searchParams),
    [searchParams],
  );

  const filteredVehicles = useMemo(
    () => filterVehicles(vehicles, filters),
    [vehicles, filters],
  );

  if (filteredVehicles.length === 0) {
    return <VehicleGridEmpty />;
  }

  return (
    <VehicleGrid count={filteredVehicles.length}>
      {filteredVehicles.map((vehicle) => {
        let quote;
        if (filters.startTime && filters.endTime) {
          try {
            const raw = calculateRentalPriceFromIso(
              filters.startTime,
              filters.endTime,
              vehicle.daily_rate_cents,
            );
            quote = toQuoteBreakdown(raw);
          } catch {
            quote = undefined;
          }
        }

        return (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            quote={quote}
            startTime={filters.startTime}
            endTime={filters.endTime}
          />
        );
      })}
    </VehicleGrid>
  );
}
