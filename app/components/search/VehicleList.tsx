"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { VehicleCard } from "@/components/search/VehicleCard";
import { VehicleGrid, VehicleGridEmpty } from "@/components/search/VehicleGrid";
import { filterVehicles } from "@/lib/filters";
import { parseSearchFilters } from "@/lib/search-params";
import { toQuoteBreakdown } from "@/lib/quote";
import { API } from "@/server/api";

export function VehicleList() {
  const searchParams = useSearchParams();
  const filters = useMemo(
    () => parseSearchFilters(searchParams),
    [searchParams],
  );

  const searchResponse = API.searchVehicles();
  const vehicles = useMemo(
    () => filterVehicles(searchResponse.vehicles, filters),
    [searchResponse.vehicles, filters],
  );

  if (vehicles.length === 0) {
    return <VehicleGridEmpty />;
  }

  return (
    <VehicleGrid count={vehicles.length}>
      {vehicles.map((vehicle) => {
        let quote;
        if (filters.startTime && filters.endTime) {
          try {
            const raw = API.getQuote({
              vehicleId: vehicle.id,
              startTime: filters.startTime,
              endTime: filters.endTime,
            });
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
