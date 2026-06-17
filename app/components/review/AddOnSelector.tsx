"use client";

import { Checkbox } from "@/components/shared/ui/checkbox";
import { Label } from "@/components/shared/ui/label";
import { cn } from "@/lib/classnames";
import {
  computeAddOnLineItem,
  formatPricingLabel,
  type AddOnCatalogItem,
} from "@/lib/addons";
import { formatCents } from "@/lib/formatters";

export interface AddOnSelectorProps {
  addons: AddOnCatalogItem[];
  durationHours: number;
  selectedSlugs: Set<string>;
  onToggle: (slug: string) => void;
  className?: string;
}

function AddOnRow({
  addon,
  durationHours,
  selected,
  onToggle,
}: {
  addon: AddOnCatalogItem;
  durationHours: number;
  selected: boolean;
  onToggle: () => void;
}) {
  const line = computeAddOnLineItem(addon, durationHours);
  const inputId = `addon-${addon.slug}`;

  return (
    <div
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-sm border border-border p-4 transition-colors duration-200",
        "hover:border-primary/40 hover:bg-accent/40",
        selected && "border-primary/50 bg-accent/60",
      )}
    >
      <Checkbox
        id={inputId}
        checked={selected}
        onCheckedChange={onToggle}
        className="mt-0.5"
      />
      <Label htmlFor={inputId} className="flex flex-1 cursor-pointer flex-col gap-1">
        <span className="flex items-center justify-between gap-2 font-medium text-foreground">
          {addon.name}
          <span className="shrink-0 tabular-nums text-sm text-muted-foreground">
            {selected ? formatCents(line.totalCents) : formatCents(addon.priceCents)}
          </span>
        </span>
        <span className="text-sm text-muted-foreground">{addon.description}</span>
        <span className="text-xs text-accent-foreground">
          {formatCents(addon.priceCents)} {formatPricingLabel(addon)}
        </span>
      </Label>
    </div>
  );
}

export function AddOnSelector({
  addons,
  durationHours,
  selectedSlugs,
  onToggle,
  className,
}: AddOnSelectorProps) {
  const perRental = addons.filter((a) => a.pricingModel === "per_rental");
  const perDay = addons.filter((a) => a.pricingModel === "per_day");

  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h3 className="text-base font-black uppercase tracking-tight">
          Optional extras
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Enhance your trip with extras. Totals update live in your summary.
        </p>
      </div>

      {perRental.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Per rental
          </p>
          <div className="space-y-2">
            {perRental.map((addon) => (
              <AddOnRow
                key={addon.slug}
                addon={addon}
                durationHours={durationHours}
                selected={selectedSlugs.has(addon.slug)}
                onToggle={() => onToggle(addon.slug)}
              />
            ))}
          </div>
        </div>
      )}

      {perDay.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Per day
          </p>
          <div className="space-y-2">
            {perDay.map((addon) => (
              <AddOnRow
                key={addon.slug}
                addon={addon}
                durationHours={durationHours}
                selected={selectedSlugs.has(addon.slug)}
                onToggle={() => onToggle(addon.slug)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
