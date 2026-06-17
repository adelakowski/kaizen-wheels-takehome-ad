"use client";

import { useMemo } from "react";

import { VehicleCard } from "@/components/search/VehicleCard";
import { VehicleGrid, VehicleGridEmpty } from "@/components/search/VehicleGrid";
import { calculateRentalPriceFromIso } from "@/lib/pricing";
import { toQuoteBreakdown } from "@/lib/quote";
import {
  hasValidDateRange,
  type SearchFilters,
} from "@/lib/search-params";
import type { Vehicle } from "@/server/data";

export function VehicleListClient({
  vehicles,
  filters,
}: {
  vehicles: Vehicle[];
  filters: SearchFilters;
}) {
  const datesSelected = useMemo(() => hasValidDateRange(filters), [filters]);

  if (vehicles.length === 0) {
    return (
      <VehicleGridEmpty
        datesSelected={datesSelected}
        filtersActive={hasActiveFilters(filters)}
      />
    );
  }

  return (
    <VehicleGrid
      count={vehicles.length}
      datesSelected={datesSelected}
    >
      {vehicles.map((vehicle) => {
        let quote;
        if (datesSelected && filters.startTime && filters.endTime) {
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

function hasActiveFilters(filters: SearchFilters): boolean {
  return (
    filters.classifications.length > 0 ||
    filters.minPassengers > 1 ||
    Boolean(filters.make.trim()) ||
    datesSelected(filters)
  );
}

function datesSelected(filters: SearchFilters): boolean {
  return hasValidDateRange(filters);
}
