"use client";

import { useMemo, useState } from "react";

import { AddOnSelector } from "@/components/review/AddOnSelector";
import { PriceSummary } from "@/components/review/PriceSummary";
import { VehicleDetails } from "@/components/review/VehicleDetails";
import {
  computeSelectedAddOnLines,
  type AddOnCatalogItem,
} from "@/lib/addons";
import {
  computeFullPriceBreakdown,
  type QuoteBreakdown,
} from "@/lib/quote";
import type { Vehicle } from "@/server/data";

export function ReviewWithDatesClient({
  vehicle,
  quote,
  addons,
  start,
  end,
}: {
  vehicle: Vehicle;
  quote: QuoteBreakdown;
  addons: AddOnCatalogItem[];
  start: string;
  end: string;
}) {
  const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set());

  const startDate = new Date(start);
  const endDate = new Date(end);

  const addOnLines = useMemo(
    () =>
      computeSelectedAddOnLines(addons, selectedSlugs, quote.durationHours),
    [addons, selectedSlugs, quote.durationHours],
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
            addons={addons}
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
