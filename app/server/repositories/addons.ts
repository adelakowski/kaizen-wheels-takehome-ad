import { asc, eq } from "drizzle-orm";

import { db } from "@/server/db";
import { addons } from "@/server/db/schema";
import { toAddonCatalogItem } from "@/server/repositories/mappers";

export async function listActiveAddons() {
  const rows = await db
    .select()
    .from(addons)
    .where(eq(addons.isActive, true))
    .orderBy(asc(addons.sortOrder));

  return rows.map(toAddonCatalogItem);
}
