export type Classification =
  | "Compact"
  | "SUV"
  | "Sports"
  | "Subcompact"
  | "Minivan"
  | "Luxury";

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  doors: number;
  max_passengers: number;
  classification: Classification;
  thumbnail_url: string;
  daily_rate_cents: number;
}

export interface Reservation {
  id: string;
  vehicle_id: string;
  start_time: import("luxon").DateTime;
  end_time: import("luxon").DateTime;
  total_price_cents: number;
}
