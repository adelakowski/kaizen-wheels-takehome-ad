import type { SearchFilters } from "@/lib/search-params";
import { DEFAULT_FILTERS } from "@/lib/search-params";
import type { Reservation, Vehicle } from "./data";
import { findReservationById } from "./repositories/reservations";
import {
  findVehicleById,
  searchVehicles as searchVehiclesRepo,
} from "./repositories/vehicles";

export async function getVehicleById(
  id: string,
): Promise<Vehicle | undefined> {
  const vehicle = await findVehicleById(id);
  return vehicle ?? undefined;
}

export async function getReservationById(
  id: string,
): Promise<Reservation | undefined> {
  const reservation = await findReservationById(id);
  return reservation ?? undefined;
}

export async function getVehicles(): Promise<Vehicle[]> {
  return searchVehiclesRepo(DEFAULT_FILTERS);
}

export async function searchVehicles(
  filters: SearchFilters,
): Promise<Vehicle[]> {
  return searchVehiclesRepo(filters);
}
