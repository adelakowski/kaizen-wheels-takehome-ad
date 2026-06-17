import type { Reservation, Vehicle } from "./data";
import { findReservationById } from "./repositories/reservations";
import { findVehicleById, listVehicles } from "./repositories/vehicles";

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
  return listVehicles();
}
