import { VehicleListClient } from "@/components/search/VehicleListClient";
import { API } from "@/server/api";

export async function VehicleListLoader() {
  const { vehicles } = await API.searchVehicles();
  return <VehicleListClient vehicles={vehicles} />;
}
