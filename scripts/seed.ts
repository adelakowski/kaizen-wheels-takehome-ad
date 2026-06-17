import "dotenv/config";

import { sql } from "drizzle-orm";
import { DateTime } from "luxon";

import { db } from "../app/server/db/index";
import { addons, reservations, vehicles } from "../app/server/db/schema";
import {
  RENTAL_TIMEZONE,
  SEED_ADDONS,
  SEED_RESERVATION_TEMPLATES,
  SEED_VEHICLES,
} from "../app/server/seed/fixtures";

async function seed() {
  const today = DateTime.now().setZone(RENTAL_TIMEZONE).startOf("day");

  console.log("Clearing existing data…");
  await db.execute(sql`TRUNCATE TABLE reservations, vehicles, addons CASCADE`);

  console.log(`Seeding ${SEED_VEHICLES.length} vehicles…`);
  await db.insert(vehicles).values(
    SEED_VEHICLES.map((vehicle) => ({
      id: vehicle.id,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      doors: vehicle.doors,
      maxPassengers: vehicle.max_passengers,
      classification: vehicle.classification,
      thumbnailUrl: vehicle.thumbnail_url,
      dailyRateCents: vehicle.daily_rate_cents,
    })),
  );

  console.log(`Seeding ${SEED_RESERVATION_TEMPLATES.length} reservations…`);
  await db.insert(reservations).values(
    SEED_RESERVATION_TEMPLATES.map((template) => {
      const start = today.plus({ days: template.start_offset_days });
      const end = today.plus({ days: template.end_offset_days });

      return {
        id: template.id,
        vehicleId: template.vehicle_id,
        startTime: start.toUTC().toJSDate(),
        endTime: end.toUTC().toJSDate(),
        basePriceCents: template.total_price_cents,
        discountType: "none" as const,
        discountCents: 0,
        totalPriceCents: template.total_price_cents,
      };
    }),
  );

  console.log(`Seeding ${SEED_ADDONS.length} add-ons…`);
  await db.insert(addons).values(
    SEED_ADDONS.map((addon) => ({
      id: addon.id,
      slug: addon.slug,
      name: addon.name,
      description: addon.description,
      pricingModel: addon.pricing_model,
      priceCents: addon.price_cents,
      isActive: true,
      sortOrder: addon.sort_order,
    })),
  );

  console.log("Seed complete.");
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
