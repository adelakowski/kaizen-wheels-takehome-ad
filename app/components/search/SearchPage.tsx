"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { FilterBar, FilterBarFallback } from "@/components/search/FilterBar";
import { VehicleList } from "@/components/search/VehicleList";
import { SearchHero } from "@/components/search/SearchHero";
import { AppShell } from "@/components/shared/AppShell";
import { ErrorFallback } from "@/components/shared/ErrorFallback";

export function SearchPage() {
  return (
    <AppShell
      stickySearchSlot={
        <Suspense fallback={<FilterBarFallback />}>
          <FilterBar />
        </Suspense>
      }
      heroSlot={<SearchHero />}
    >
      <div className="space-y-1 pb-4">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Our fleet
        </h2>
        <p className="text-muted-foreground">
          Premium vehicles without premium prices. Select a car to continue.
        </p>
      </div>

      <ErrorBoundary
        fallback={<ErrorFallback message="Failed to load vehicles" />}
      >
        <Suspense fallback={<VehicleListFallback />}>
          <VehicleList />
        </Suspense>
      </ErrorBoundary>
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
