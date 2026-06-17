import type { Vehicle } from "@/server/data";
import { useBase64Image } from "@/util/useBase64Image";
import { DoorOpen, Users } from "lucide-react";

import { Badge } from "@/components/shared/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/shared/ui/card";

export interface VehicleDetailsProps {
  vehicle: Vehicle;
}

export function VehicleDetails({ vehicle }: VehicleDetailsProps) {
  const imgData = useBase64Image(vehicle.thumbnail_url);

  return (
    <Card className="overflow-hidden rounded-sm border-border">
      <div className="relative aspect-[16/9] overflow-hidden bg-muted sm:aspect-[21/9]">
        {imgData ? (
          <img
            src={imgData}
            alt={`${vehicle.make} ${vehicle.model}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Loading image…
          </div>
        )}
      </div>
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{vehicle.classification}</Badge>
          <Badge variant="outline">{vehicle.year}</Badge>
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tight">
          {vehicle.make} {vehicle.model}
        </h2>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 pb-6 text-sm sm:grid-cols-4">
        <div>
          <p className="text-muted-foreground">Passengers</p>
          <p className="mt-1 flex items-center gap-1 font-medium tabular-nums">
            <Users className="h-4 w-4" aria-hidden="true" />
            {vehicle.max_passengers}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Doors</p>
          <p className="mt-1 flex items-center gap-1 font-medium tabular-nums">
            <DoorOpen className="h-4 w-4" aria-hidden="true" />
            {vehicle.doors}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Class</p>
          <p className="mt-1 font-medium">{vehicle.classification}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Year</p>
          <p className="mt-1 font-medium tabular-nums">{vehicle.year}</p>
        </div>
      </CardContent>
    </Card>
  );
}
