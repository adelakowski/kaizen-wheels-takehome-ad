import { rentalDayCount } from "@/lib/pricing";
import type { AddOnLine } from "@/lib/quote";

export type PricingModel = "per_rental" | "per_day";

export type AddOnCatalogItem = {
  id: string;
  slug: string;
  name: string;
  description: string;
  pricingModel: PricingModel;
  priceCents: number;
};

export function computeAddOnLineItem(
  addon: AddOnCatalogItem,
  durationHours: number,
): { label: string; quantity: number; unitCents: number; totalCents: number } {
  if (addon.pricingModel === "per_rental") {
    return {
      label: addon.name,
      quantity: 1,
      unitCents: addon.priceCents,
      totalCents: addon.priceCents,
    };
  }

  const days = rentalDayCount(durationHours);
  return {
    label: `${addon.name} (×${days} days)`,
    quantity: days,
    unitCents: addon.priceCents,
    totalCents: addon.priceCents * days,
  };
}

export function formatPricingLabel(addon: AddOnCatalogItem): string {
  if (addon.pricingModel === "per_rental") {
    return "per rental";
  }
  return "per day";
}

export function computeSelectedAddOnLines(
  catalog: AddOnCatalogItem[],
  selectedSlugs: Set<string>,
  durationHours: number,
): AddOnLine[] {
  return catalog
    .filter((addon) => selectedSlugs.has(addon.slug))
    .map((addon) => {
      const line = computeAddOnLineItem(addon, durationHours);
      return {
        slug: addon.slug,
        label: line.label,
        totalCents: line.totalCents,
      };
    });
}
