"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { AddOnSelector } from "@/components/review/AddOnSelector";
import { PriceSummary } from "@/components/review/PriceSummary";
import { VehicleDetails } from "@/components/review/VehicleDetails";
import { AppShell } from "@/components/shared/AppShell";
import { ErrorFallback } from "@/components/shared/ErrorFallback";
import { Button } from "@/components/shared/ui/button";
import { ADDON_CATALOG, computeAddOnLineItem } from "@/lib/addons";
import { computeFullPriceBreakdown, toQuoteBreakdown } from "@/lib/quote";
import { API } from "@/server/api";

function ReviewWithDates({
  vehicleId,
  start,
  end,
}: {
  vehicleId: string;
  start: string;
  end: string;
}) {
  const vehicle = API.getVehicle(vehicleId);
  const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set());

  const startDate = new Date(start);
  const endDate = new Date(end);

  const rawQuote = API.getQuote({
    vehicleId,
    startTime: startDate.toISOString(),
    endTime: endDate.toISOString(),
  });

  const quote = toQuoteBreakdown(rawQuote);

  const addOnLines = useMemo(
    () =>
      ADDON_CATALOG.filter((addon) => selectedSlugs.has(addon.slug)).map(
        (addon) => {
          const line = computeAddOnLineItem(addon, quote.durationHours);
          return {
            slug: addon.slug,
            label: line.label,
            totalCents: line.totalCents,
          };
        },
      ),
    [selectedSlugs, quote.durationHours],
  );

  const breakdown = computeFullPriceBreakdown(quote, addOnLines);

  const toggleAddOn = (slug: string) => {
    setSelectedSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  };

  const handleConfirm = () => {
    console.error("Not implemented");
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Complete your booking
        </h1>
        <p className="text-muted-foreground">
          Review your vehicle, add extras, and confirm — no hidden costs.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <VehicleDetails vehicle={vehicle} />
          <AddOnSelector
            durationHours={quote.durationHours}
            selectedSlugs={selectedSlugs}
            onToggle={toggleAddOn}
          />
        </div>

        <PriceSummary
          breakdown={breakdown}
          startDate={startDate}
          endDate={endDate}
          onConfirm={handleConfirm}
        />
      </div>
    </div>
  );
}

function ReviewContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!id) {
    throw new Error("No reservation ID found");
  }

  if (!start || !end) {
    const vehicle = API.getVehicle(id);

    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Complete your booking
          </h1>
          <p className="text-muted-foreground">
            Select pick-up and return dates on the search page to see your quote.
          </p>
        </header>
        <VehicleDetails vehicle={vehicle} />
        <Button asChild variant="outline">
          <a href="/">Back to search</a>
        </Button>
      </div>
    );
  }

  return <ReviewWithDates vehicleId={id} start={start} end={end} />;
}

export function ReviewPage() {
  return (
    <AppShell>
      <ErrorBoundary
        fallback={<ErrorFallback message="Failed to load reservation" />}
      >
        <Suspense fallback={<ReviewPageFallback />}>
          <ReviewContent />
        </Suspense>
      </ErrorBoundary>
    </AppShell>
  );
}

function ReviewPageFallback() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-64 animate-pulse rounded-lg bg-muted" />
      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="h-96 animate-pulse rounded-xl bg-muted" />
        <div className="h-80 animate-pulse rounded-xl bg-muted" />
      </div>
    </div>
  );
}
