"use client";

import { ArrowRight, Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/shared/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/shared/ui/card";
import { Separator } from "@/components/shared/ui/separator";
import { cn } from "@/lib/classnames";
import { formatCents } from "@/lib/formatters";
import type { FullPriceBreakdown } from "@/lib/quote";

export interface PriceSummaryProps {
  breakdown: FullPriceBreakdown;
  startDate?: Date;
  endDate?: Date;
  onConfirm: () => void;
  className?: string;
}

function LineItem({
  label,
  value,
  muted,
  emphasis,
}: {
  label: string;
  value: string;
  muted?: boolean;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span
        className={cn(
          muted && "text-accent-foreground",
          emphasis && "text-base font-semibold",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "shrink-0 tabular-nums",
          muted && "font-semibold text-accent-foreground",
          emphasis && "text-xl font-semibold",
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function PriceSummary({
  breakdown,
  startDate,
  endDate,
  onConfirm,
  className,
}: PriceSummaryProps) {
  const hoursLabel =
    breakdown.durationHours === 1
      ? "1 hr"
      : `${breakdown.durationHours.toFixed(1)} hrs`;

  return (
    <Card
      className={cn(
        "sticky top-24 overflow-hidden rounded-xl border-border shadow-lg",
        className,
      )}
    >
      <CardHeader className="border-b border-white/10 bg-hero py-4 text-white">
        <CardTitle className="text-base font-semibold tracking-tight">
          Booking summary
        </CardTitle>
        {startDate && endDate && (
          <div className="space-y-2 pt-2 text-sm text-white/70">
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <div>
                <p className="font-medium text-white">Pick-up</p>
                <p>{format(startDate, "PPpp")}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <div>
                <p className="font-medium text-white">Return</p>
                <p>{format(endDate, "PPpp")}</p>
              </div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3 p-6">
        <LineItem
          label={`Base rental (${hoursLabel})`}
          value={formatCents(breakdown.basePriceCents)}
        />

        {breakdown.discountCents > 0 && (
          <LineItem
            label={
              breakdown.discountType === "holiday"
                ? "Holiday discount"
                : "Long-trip discount"
            }
            value={`−${formatCents(breakdown.discountCents)}`}
            muted
          />
        )}

        {breakdown.addOnLines.map((line) => (
          <LineItem
            key={line.slug}
            label={line.label}
            value={`+${formatCents(line.totalCents)}`}
          />
        ))}

        <Separator />

        <LineItem
          label="Total"
          value={formatCents(breakdown.grandTotalCents)}
          emphasis
        />

        <p className="text-xs text-muted-foreground">
          No hidden costs. Discounts apply to base rental only.
        </p>
      </CardContent>

      <CardFooter className="border-t border-border bg-muted/30 p-6 pt-4">
        <Button
          type="button"
          className="kaizen-cta w-full cursor-pointer gap-2"
          size="lg"
          onClick={onConfirm}
        >
          Confirm booking
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </CardFooter>
    </Card>
  );
}
