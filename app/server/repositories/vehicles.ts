import { eq } from "drizzle-orm";

import { db } from "@/server/db";
import { vehicles } from "@/server/db/schema";
import { toVehicle } from "@/server/repositories/mappers";

export async function listVehicles() {
  const rows = await db.select().from(vehicles).orderBy(vehicles.make);
  return rows.map(toVehicle);
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
