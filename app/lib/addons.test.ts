import { describe, expect, it } from "vitest";

import {
  computeAddOnLineItem,
  computeSelectedAddOnLines,
  formatPricingLabel,
  type AddOnCatalogItem,
} from "@/lib/addons";
import { SEED_ADDONS } from "@/server/seed/fixtures";

const readmeCatalog: AddOnCatalogItem[] = SEED_ADDONS.map((addon) => ({
  id: addon.id,
  slug: addon.slug,
  name: addon.name,
  description: addon.description,
  pricingModel: addon.pricing_model,
  priceCents: addon.price_cents,
}));

const gps = readmeCatalog.find((addon) => addon.slug === "gps")!;
const childSeat = readmeCatalog.find((addon) => addon.slug === "child_seat")!;
const extraDriver = readmeCatalog.find((addon) => addon.slug === "extra_driver")!;
const prepaidFuel = readmeCatalog.find((addon) => addon.slug === "prepaid_fuel")!;
const roadside = readmeCatalog.find((addon) => addon.slug === "roadside")!;

describe("computeAddOnLineItem", () => {
  it("charges per rental add-ons once", () => {
    expect(computeAddOnLineItem(gps, 72)).toEqual({
      label: "GPS Navigation",
      quantity: 1,
      unitCents: 500,
      totalCents: 500,
    });
  });

  it("charges per day add-ons by billable days", () => {
    expect(computeAddOnLineItem(childSeat, 25)).toEqual({
      label: "Child seat (×2 days)",
      quantity: 2,
      unitCents: 800,
      totalCents: 1600,
    });
  });

  it("prices every README catalog add-on at seed rates", () => {
    expect(computeAddOnLineItem(gps, 48).totalCents).toBe(500);
    expect(computeAddOnLineItem(childSeat, 48).totalCents).toBe(1600);
    expect(computeAddOnLineItem(extraDriver, 48).totalCents).toBe(2400);
    expect(computeAddOnLineItem(prepaidFuel, 48).totalCents).toBe(4000);
    expect(computeAddOnLineItem(roadside, 48).totalCents).toBe(800);
  });
});

describe("formatPricingLabel", () => {
  it("labels pricing models for display", () => {
    expect(formatPricingLabel(gps)).toBe("per rental");
    expect(formatPricingLabel(childSeat)).toBe("per day");
  });
});

describe("computeSelectedAddOnLines", () => {
  it("returns only selected catalog items in catalog order", () => {
    const lines = computeSelectedAddOnLines(
      [gps, childSeat],
      new Set(["child_seat", "gps"]),
      48,
    );

    expect(lines).toEqual([
      { slug: "gps", label: "GPS Navigation", totalCents: 500 },
      { slug: "child_seat", label: "Child seat (×2 days)", totalCents: 1600 },
    ]);
  });

  it("returns an empty list when nothing is selected", () => {
    expect(
      computeSelectedAddOnLines(readmeCatalog, new Set(), 48),
    ).toEqual([]);
  });
});
