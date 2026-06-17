import type { Classification } from "@/server/data";

/** Stable UUIDs so seed data is deterministic across runs. */
export const VEHICLE_IDS = {
  corolla: "a1000001-0000-4000-8000-000000000001",
  civic: "a1000001-0000-4000-8000-000000000002",
  mustang: "a1000001-0000-4000-8000-000000000003",
  spark: "a1000001-0000-4000-8000-000000000004",
  rogue: "a1000001-0000-4000-8000-000000000005",
  santafe: "a1000001-0000-4000-8000-000000000006",
  golf: "a1000001-0000-4000-8000-000000000007",
  cclass: "a1000001-0000-4000-8000-000000000008",
  x5: "a1000001-0000-4000-8000-000000000009",
  cx9: "a1000001-0000-4000-8000-00000000000a",
  pacifica: "a1000001-0000-4000-8000-00000000000b",
  wrangler: "a1000001-0000-4000-8000-00000000000c",
} as const;

export type SeedVehicle = {
  id: string;
  make: string;
  model: string;
  year: number;
  doors: number;
  max_passengers: number;
  classification: Classification;
  thumbnail_url: string;
  daily_rate_cents: number;
};

export const SEED_VEHICLES: SeedVehicle[] = [
  {
    id: VEHICLE_IDS.corolla,
    make: "Toyota",
    model: "Corolla",
    year: 2020,
    doors: 4,
    max_passengers: 5,
    classification: "Compact",
    thumbnail_url: "/cars/corolla",
    daily_rate_cents: 4500,
  },
  {
    id: VEHICLE_IDS.civic,
    make: "Honda",
    model: "Civic",
    year: 2021,
    doors: 4,
    max_passengers: 5,
    classification: "Compact",
    thumbnail_url: "/cars/civic",
    daily_rate_cents: 4200,
  },
  {
    id: VEHICLE_IDS.mustang,
    make: "Ford",
    model: "Mustang",
    year: 2022,
    doors: 2,
    max_passengers: 4,
    classification: "Sports",
    thumbnail_url: "/cars/mustang",
    daily_rate_cents: 16000,
  },
  {
    id: VEHICLE_IDS.spark,
    make: "Chevrolet",
    model: "Spark",
    year: 2020,
    doors: 4,
    max_passengers: 4,
    classification: "Subcompact",
    thumbnail_url: "/cars/spark",
    daily_rate_cents: 3200,
  },
  {
    id: VEHICLE_IDS.rogue,
    make: "Nissan",
    model: "Rogue",
    year: 2021,
    doors: 5,
    max_passengers: 5,
    classification: "SUV",
    thumbnail_url: "/cars/rogue",
    daily_rate_cents: 5800,
  },
  {
    id: VEHICLE_IDS.santafe,
    make: "Hyundai",
    model: "Santa Fe",
    year: 2022,
    doors: 5,
    max_passengers: 7,
    classification: "SUV",
    thumbnail_url: "/cars/santafe",
    daily_rate_cents: 7200,
  },
  {
    id: VEHICLE_IDS.golf,
    make: "Volkswagen",
    model: "Golf",
    year: 2023,
    doors: 5,
    max_passengers: 5,
    classification: "Compact",
    thumbnail_url: "/cars/golf",
    daily_rate_cents: 5600,
  },
  {
    id: VEHICLE_IDS.cclass,
    make: "Mercedes-Benz",
    model: "C-Class",
    year: 2024,
    doors: 4,
    max_passengers: 5,
    classification: "Luxury",
    thumbnail_url: "/cars/cclass",
    daily_rate_cents: 22000,
  },
  {
    id: VEHICLE_IDS.x5,
    make: "BMW",
    model: "X5",
    year: 2024,
    doors: 4,
    max_passengers: 5,
    classification: "SUV",
    thumbnail_url: "/cars/x5",
    daily_rate_cents: 17000,
  },
  {
    id: VEHICLE_IDS.cx9,
    make: "Mazda",
    model: "CX-9",
    year: 2024,
    doors: 5,
    max_passengers: 7,
    classification: "SUV",
    thumbnail_url: "/cars/cx9",
    daily_rate_cents: 7000,
  },
  {
    id: VEHICLE_IDS.pacifica,
    make: "Chrysler",
    model: "Pacifica",
    year: 2024,
    doors: 5,
    max_passengers: 8,
    classification: "Minivan",
    thumbnail_url: "/cars/pacifica",
    daily_rate_cents: 8000,
  },
  {
    id: VEHICLE_IDS.wrangler,
    make: "Jeep",
    model: "Wrangler",
    year: 2021,
    doors: 4,
    max_passengers: 5,
    classification: "SUV",
    thumbnail_url: "/cars/wrangler",
    daily_rate_cents: 8500,
  },
];

export type SeedReservationTemplate = {
  id: string;
  vehicle_id: string;
  start_offset_days: number;
  end_offset_days: number;
  total_price_cents: number;
};

/** Offsets are relative to rental-TZ start of today (matches legacy data.ts). */
export const SEED_RESERVATION_TEMPLATES: SeedReservationTemplate[] = [
  {
    id: "b2000001-0000-4000-8000-000000000001",
    vehicle_id: VEHICLE_IDS.corolla,
    start_offset_days: 0,
    end_offset_days: 2,
    total_price_cents: 1000,
  },
  {
    id: "b2000001-0000-4000-8000-000000000002",
    vehicle_id: VEHICLE_IDS.civic,
    start_offset_days: 1,
    end_offset_days: 4,
    total_price_cents: 1500,
  },
  {
    id: "b2000001-0000-4000-8000-000000000003",
    vehicle_id: VEHICLE_IDS.mustang,
    start_offset_days: 2,
    end_offset_days: 5,
    total_price_cents: 2000,
  },
  {
    id: "b2000001-0000-4000-8000-000000000004",
    vehicle_id: VEHICLE_IDS.spark,
    start_offset_days: -3,
    end_offset_days: 2,
    total_price_cents: 1200,
  },
  {
    id: "b2000001-0000-4000-8000-000000000005",
    vehicle_id: VEHICLE_IDS.santafe,
    start_offset_days: 7,
    end_offset_days: 9,
    total_price_cents: 1800,
  },
  {
    id: "b2000001-0000-4000-8000-000000000006",
    vehicle_id: VEHICLE_IDS.spark,
    start_offset_days: 10,
    end_offset_days: 12,
    total_price_cents: 2200,
  },
  {
    id: "b2000001-0000-4000-8000-000000000007",
    vehicle_id: VEHICLE_IDS.mustang,
    start_offset_days: 13,
    end_offset_days: 15,
    total_price_cents: 2600,
  },
  {
    id: "b2000001-0000-4000-8000-000000000008",
    vehicle_id: VEHICLE_IDS.x5,
    start_offset_days: 0,
    end_offset_days: 2,
    total_price_cents: 3000,
  },
  {
    id: "b2000001-0000-4000-8000-000000000009",
    vehicle_id: VEHICLE_IDS.golf,
    start_offset_days: 10,
    end_offset_days: 12,
    total_price_cents: 3000,
  },
];

export const SEED_ADDONS = [
  {
    id: "c3000001-0000-4000-8000-000000000001",
    slug: "gps",
    name: "GPS Navigation",
    description: "Suction-mount GPS unit",
    pricing_model: "per_rental" as const,
    price_cents: 500,
    sort_order: 1,
  },
  {
    id: "c3000001-0000-4000-8000-000000000002",
    slug: "child_seat",
    name: "Child seat",
    description: "Forward-facing booster",
    pricing_model: "per_day" as const,
    price_cents: 800,
    sort_order: 2,
  },
  {
    id: "c3000001-0000-4000-8000-000000000003",
    slug: "extra_driver",
    name: "Additional driver",
    description: "Allow a second registered driver",
    pricing_model: "per_day" as const,
    price_cents: 1200,
    sort_order: 3,
  },
  {
    id: "c3000001-0000-4000-8000-000000000004",
    slug: "prepaid_fuel",
    name: "Pre-paid fuel",
    description: "Return the car empty",
    pricing_model: "per_rental" as const,
    price_cents: 4000,
    sort_order: 4,
  },
  {
    id: "c3000001-0000-4000-8000-000000000005",
    slug: "roadside",
    name: "Roadside assistance",
    description: "24/7 emergency support",
    pricing_model: "per_day" as const,
    price_cents: 400,
    sort_order: 5,
  },
];

export const RENTAL_TIMEZONE = "America/Los_Angeles";
