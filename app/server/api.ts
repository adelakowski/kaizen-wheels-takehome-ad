import {
  calculateRentalPrice,
  parseAndValidateTimeRange,
} from "@/lib/pricing";
import type { SearchFilters } from "@/lib/search-params";
import { DEFAULT_FILTERS } from "@/lib/search-params";
import {
  getReservationById,
  getVehicleById,
  searchVehicles as searchVehiclesQuery,
} from "./data_helpers";
import { isVehicleAvailable } from "./repositories/vehicles";

async function validateReservationAndGetVehicle(input: {
  vehicleId: string;
  startTime: string;
  endTime: string;
}) {
  const { vehicleId, startTime, endTime } = input;
  const { start, end } = parseAndValidateTimeRange(startTime, endTime);

  const vehicle = await getVehicleById(vehicleId);

  if (!vehicle) {
    throw new Error("NOT_FOUND: Vehicle not found");
  }

  return { vehicle, start, end };
}

async function searchVehicles(filters: SearchFilters = DEFAULT_FILTERS) {
  return {
    vehicles: await searchVehiclesQuery(filters),
  };
}

async function getVehicle(id: string) {
  const vehicle = await getVehicleById(id);

  if (!vehicle) {
    throw new Error("NOT_FOUND: Vehicle not found");
  }

  return vehicle;
}

async function getReservation(id: string) {
  const reservation = await getReservationById(id);
  if (!reservation) {
    throw new Error("NOT_FOUND: Reservation not found");
  }
  return reservation;
}

async function getQuote(input: {
  vehicleId: string;
  startTime: string;
  endTime: string;
}) {
  const { vehicle, start, end } = await validateReservationAndGetVehicle(input);

  const available = await isVehicleAvailable(
    vehicle.id,
    start.toJSDate(),
    end.toJSDate(),
  );

  if (!available) {
    throw new Error(
      "CONFLICT: Vehicle is not available for the selected dates",
    );
  }

  return calculateRentalPrice(start, end, vehicle.daily_rate_cents);
}

export const API = {
  searchVehicles,
  getVehicle,
  getReservation,
  getQuote,
};
