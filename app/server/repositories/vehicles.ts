import {
  and,
  eq,
  gt,
  gte,
  ilike,
  inArray,
  lt,
  lte,
  notExists,
} from "drizzle-orm";

import type { SearchFilters } from "@/lib/search-params";
import { DEFAULT_FILTERS } from "@/lib/search-params";
import { hasValidDateRange } from "@/lib/search-params";
import { db } from "@/server/db";
import { reservations, vehicles } from "@/server/db/schema";
import { toVehicle } from "@/server/repositories/mappers";

function buildSearchConditions(filters: SearchFilters) {
  const conditions = [];

  if (filters.classifications.length > 0) {
    conditions.push(inArray(vehicles.classification, filters.classifications));
  }

  conditions.push(
    gte(vehicles.dailyRateCents, filters.minDailyRateCents),
    lte(vehicles.dailyRateCents, filters.maxDailyRateCents),
  );

  if (filters.minPassengers > 1) {
    conditions.push(gte(vehicles.maxPassengers, filters.minPassengers));
  }

  const make = filters.make.trim();
  if (make) {
    conditions.push(ilike(vehicles.make, `%${make}%`));
  }

  if (hasValidDateRange(filters)) {
    const requestedStart = new Date(filters.startTime!);
    const requestedEnd = new Date(filters.endTime!);

    conditions.push(
      notExists(
        db
          .select()
          .from(reservations)
          .where(
            and(
              eq(reservations.vehicleId, vehicles.id),
              lt(reservations.startTime, requestedEnd),
              gt(reservations.endTime, requestedStart),
            ),
          ),
      ),
    );
  }

  return conditions;
}

export async function searchVehicles(filters: SearchFilters) {
  const conditions = buildSearchConditions(filters);

  const rows = await db
    .select()
    .from(vehicles)
    .where(and(...conditions))
    .orderBy(vehicles.make);

  return rows.map(toVehicle);
}

export async function listVehicles() {
  return searchVehicles(DEFAULT_FILTERS);
}

export async function findVehicleById(id: string) {
  const rows = await db
    .select()
    .from(vehicles)
    .where(eq(vehicles.id, id))
    .limit(1);

  const row = rows[0];
  return row ? toVehicle(row) : null;
}

export async function isVehicleAvailable(
  vehicleId: string,
  startTime: Date,
  endTime: Date,
) {
  const conflicts = await db
    .select({ id: reservations.id })
    .from(reservations)
    .where(
      and(
        eq(reservations.vehicleId, vehicleId),
        lt(reservations.startTime, endTime),
        gt(reservations.endTime, startTime),
      ),
    )
    .limit(1);

  return conflicts.length === 0;
}
