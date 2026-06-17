export type PricingModel = "per_rental" | "per_day";

import { rentalDayCount } from "@/lib/pricing";

export type AddOnCatalogItem = {
  id: string;
  slug: string;
  name: string;
  description: string;
  pricingModel: PricingModel;
  priceCents: number;
};

export const ADDON_CATALOG: AddOnCatalogItem[] = [
  {
    id: "1",
    slug: "gps",
    name: "GPS Navigation",
    description: "Suction-mount GPS unit",
    pricingModel: "per_rental",
    priceCents: 500,
  },
  {
    id: "2",
    slug: "child_seat",
    name: "Child seat",
    description: "Forward-facing booster",
    pricingModel: "per_day",
    priceCents: 800,
  },
  {
    id: "3",
    slug: "extra_driver",
    name: "Additional driver",
    description: "Allow a second registered driver",
    pricingModel: "per_day",
    priceCents: 1200,
  },
  {
    id: "4",
    slug: "prepaid_fuel",
    name: "Pre-paid fuel",
    description: "Return the car empty",
    pricingModel: "per_rental",
    priceCents: 4000,
  },
  {
    id: "5",
    slug: "roadside",
    name: "Roadside assistance",
    description: "24/7 emergency support",
    pricingModel: "per_day",
    priceCents: 400,
  },
];

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
