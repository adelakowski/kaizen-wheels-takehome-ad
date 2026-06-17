import { DateTime } from "luxon";

import type { Reservation, Vehicle } from "@/server/data";
import type {
  AddonRow,
  ReservationRow,
  VehicleRow,
} from "@/server/db/schema";

export function toVehicle(row: VehicleRow): Vehicle {
  return {
    id: row.id,
    make: row.make,
    model: row.model,
    year: row.year,
    doors: row.doors,
    max_passengers: row.maxPassengers,
    classification: row.classification,
    thumbnail_url: row.thumbnailUrl,
    daily_rate_cents: row.hourlyRateCents,
  };
}

export function toReservation(row: ReservationRow): Reservation {
  return {
    id: row.id,
    vehicle_id: row.vehicleId,
    start_time: DateTime.fromJSDate(row.startTime, { zone: "utc" }),
    end_time: DateTime.fromJSDate(row.endTime, { zone: "utc" }),
    total_price_cents: row.totalPriceCents,
  };
}

export function toAddonCatalogItem(row: AddonRow) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    pricingModel: row.pricingModel,
    priceCents: row.priceCents,
  };
}
