import { Suspense } from "react";

import { FilterBar, FilterBarFallback } from "@/components/search/FilterBar";
import { VehicleFleetBoundary } from "@/components/search/VehicleFleetBoundary";
import {
  VehicleListLoader,
  vehicleListSuspenseKey,
} from "@/components/search/VehicleListLoader";
import { SearchHero } from "@/components/search/SearchHero";
import { AppShell } from "@/components/shared/AppShell";
import { hasValidDateRange, parseSearchFilters, searchParamsToURLSearchParams } from "@/lib/search-params";

export function SearchPage({
  searchParams = {},
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const filters = parseSearchFilters(
    searchParamsToURLSearchParams(searchParams),
  );
  const datesSelected = hasValidDateRange(filters);

  return (
    <AppShell
      stickySearchSlot={
        <Suspense fallback={<FilterBarFallback />}>
          <FilterBar />
        </Suspense>
      }
      heroSlot={<SearchHero />}
    >
      <div className="space-y-3 pb-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Our fleet
          </h2>
          <p className="text-muted-foreground">
            Premium vehicles without premium prices. Select a car to continue.
          </p>
        </div>

        {!datesSelected && (
          <p className="border-l-4 border-brand-lime bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            Select pick-up and return dates above, then click{" "}
            <span className="font-semibold text-foreground">Show cars</span> to
            see availability and trip pricing.
          </p>
        )}
      </div>

      <VehicleFleetBoundary>
        <Suspense
          key={vehicleListSuspenseKey(searchParams)}
          fallback={<VehicleListFallback />}
        >
          <VehicleListLoader searchParams={searchParams} />
        </Suspense>
      </VehicleFleetBoundary>
    </AppShell>
  );
}

function VehicleListFallback() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-72 animate-pulse rounded-xl border border-border bg-muted"
        />
      ))}
    </div>
  );
}
