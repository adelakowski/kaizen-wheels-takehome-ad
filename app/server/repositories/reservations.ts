import { eq } from "drizzle-orm";

import { db } from "@/server/db";
import { reservations } from "@/server/db/schema";
import { toReservation } from "@/server/repositories/mappers";

export async function findReservationById(id: string) {
  const rows = await db
    .select()
    .from(reservations)
    .where(eq(reservations.id, id))
    .limit(1);

  const row = rows[0];
  return row ? toReservation(row) : null;
}
