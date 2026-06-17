"use client";

import Link from "next/link";
import { DoorOpen, Users } from "lucide-react";

import { Badge } from "@/components/shared/ui/badge";
import { Button } from "@/components/shared/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/shared/ui/card";
import { cn } from "@/lib/classnames";
import { formatCents } from "@/lib/formatters";
import { hasValidDateRange, DEFAULT_FILTERS } from "@/lib/search-params";
import type { QuoteBreakdown } from "@/lib/quote";
import type { Vehicle } from "@/server/data";
import { useBase64Image } from "@/util/useBase64Image";

export interface VehicleCardProps {
  vehicle: Vehicle;
  quote?: QuoteBreakdown;
  startTime?: string;
  endTime?: string;
}

export function VehicleCard({
  vehicle,
  quote,
  startTime,
  endTime,
}: VehicleCardProps) {
  const imgData = useBase64Image(vehicle.thumbnail_url);
  const datesSelected = hasValidDateRange({
    ...DEFAULT_FILTERS,
    startTime,
    endTime,
  });

  const reviewHref =
    datesSelected && startTime && endTime
      ? `/review?id=${vehicle.id}&start=${encodeURIComponent(startTime)}&end=${encodeURIComponent(endTime)}`
      : `/review?id=${vehicle.id}`;

  const showDiscount = quote && quote.discountCents > 0;

  return (
    <Card
      className={cn(
        "group overflow-hidden rounded-xl border-border bg-card transition-all duration-200",
        "hover:border-primary/40 hover:shadow-md motion-reduce:transition-none",
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {imgData ? (
          <img
            src={imgData}
            alt={`${vehicle.make} ${vehicle.model}`}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transform-none"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Loading…
          </div>
        )}
        <Badge
          variant="secondary"
          className="absolute left-3 top-3 rounded-md bg-primary uppercase tracking-wide text-primary-foreground"
        >
          {vehicle.classification}
        </Badge>
        {showDiscount && (
          <Badge
            variant="default"
            className="absolute right-3 top-3 rounded-sm uppercase tracking-wide"
          >
            {quote.discountType === "holiday"
              ? "17% off"
              : "Long-trip deal"}
          </Badge>
        )}
      </div>

      <CardHeader className="space-y-1 p-4 pb-2">
        <h2 className="text-lg font-semibold tracking-tight">
          {vehicle.make} {vehicle.model}
        </h2>
        <p className="text-sm text-muted-foreground">{vehicle.year}</p>
      </CardHeader>

      <CardContent className="flex items-center gap-4 px-4 pb-2 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Users className="h-4 w-4" aria-hidden="true" />
          {vehicle.max_passengers} seats
        </span>
        <span className="inline-flex items-center gap-1">
          <DoorOpen className="h-4 w-4" aria-hidden="true" />
          {vehicle.doors} doors
        </span>
      </CardContent>

      <CardFooter className="flex items-end justify-between border-t border-border p-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            From
          </p>
          <p className="text-xl font-black tabular-nums">
            {formatCents(vehicle.daily_rate_cents)}
            <span className="text-sm font-normal text-muted-foreground">/day</span>
          </p>
          {quote && datesSelected && (
            <p className="mt-0.5 text-sm font-semibold tabular-nums text-accent-foreground">
              {showDiscount && (
                <span className="mr-1.5 font-normal text-muted-foreground line-through">
                  {formatCents(quote.basePriceCents)}
                </span>
              )}
              {formatCents(quote.discountedBaseCents)} total
            </p>
          )}
        </div>
        <Button
          asChild
          size="sm"
          className="kaizen-cta cursor-pointer px-5"
        >
          <Link href={reviewHref}>
            {datesSelected ? "Select" : "Details"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
