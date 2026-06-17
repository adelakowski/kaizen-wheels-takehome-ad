import {
  calculateRentalPrice,
  calculateRentalPriceFromIso,
  parseAndValidateTimeRange,
} from "@/lib/pricing";
import {
  getReservationById,
  getVehicleById,
  getVehicles,
} from "./data_helpers";

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

async function searchVehicles() {
  return {
    vehicles: await getVehicles(),
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
  return calculateRentalPrice(start, end, vehicle.daily_rate_cents);
}

export const API = {
  searchVehicles,
  getVehicle,
  getReservation,
  getQuote,
};

export { calculateRentalPriceFromIso };
