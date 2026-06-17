import {
  parseSearchFilters,
  searchParamsToURLSearchParams,
  type SearchFilters,
} from "@/lib/search-params";
import { VehicleListClient } from "@/components/search/VehicleListClient";
import { API } from "@/server/api";

export async function VehicleListLoader({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const filters = parseSearchFilters(searchParamsToURLSearchParams(searchParams));
  const { vehicles } = await API.searchVehicles(filters);

  return <VehicleListClient vehicles={vehicles} filters={filters} />;
}

export function vehicleListSuspenseKey(
  searchParams: Record<string, string | string[] | undefined>,
): string {
  return searchParamsToURLSearchParams(searchParams).toString();
}
