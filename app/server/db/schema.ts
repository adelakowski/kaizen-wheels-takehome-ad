import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const classificationEnum = pgEnum("classification", [
  "Compact",
  "SUV",
  "Sports",
  "Subcompact",
  "Minivan",
  "Luxury",
]);

export const discountTypeEnum = pgEnum("discount_type", [
  "holiday",
  "duration",
  "none",
]);

export const pricingModelEnum = pgEnum("pricing_model", [
  "per_rental",
  "per_day",
]);

export const vehicles = pgTable(
  "vehicles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    make: text("make").notNull(),
    model: text("model").notNull(),
    year: integer("year").notNull(),
    doors: integer("doors").notNull(),
    maxPassengers: integer("max_passengers").notNull(),
    classification: classificationEnum("classification").notNull(),
    thumbnailUrl: text("thumbnail_url").notNull(),
    dailyRateCents: integer("daily_rate_cents").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_vehicles_classification").on(table.classification),
    index("idx_vehicles_daily_rate").on(table.dailyRateCents),
    index("idx_vehicles_max_passengers").on(table.maxPassengers),
  ],
);

export const reservations = pgTable(
  "reservations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    vehicleId: uuid("vehicle_id")
      .notNull()
      .references(() => vehicles.id, { onDelete: "restrict" }),
    startTime: timestamp("start_time", { withTimezone: true }).notNull(),
    endTime: timestamp("end_time", { withTimezone: true }).notNull(),
    basePriceCents: integer("base_price_cents").notNull(),
    discountType: discountTypeEnum("discount_type").notNull().default("none"),
    discountCents: integer("discount_cents").notNull().default(0),
    totalPriceCents: integer("total_price_cents").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_reservations_vehicle_id").on(table.vehicleId),
    index("idx_reservations_time_range").on(
      table.vehicleId,
      table.startTime,
      table.endTime,
    ),
  ],
);

export const addons = pgTable("addons", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  pricingModel: pricingModelEnum("pricing_model").notNull(),
  priceCents: integer("price_cents").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export type VehicleRow = typeof vehicles.$inferSelect;
export type ReservationRow = typeof reservations.$inferSelect;
export type AddonRow = typeof addons.$inferSelect;
