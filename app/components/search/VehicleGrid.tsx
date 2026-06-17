import { Car } from "lucide-react";

import { cn } from "@/lib/classnames";

export interface VehicleGridProps {
  children: React.ReactNode;
  count?: number;
  className?: string;
}

export function VehicleGrid({ children, count, className }: VehicleGridProps) {
  return (
    <section className={cn("space-y-5", className)}>
      {typeof count === "number" && (
        <p className="text-sm text-muted-foreground">
          <span className="font-bold uppercase tracking-wide text-foreground">
            {count}
          </span>{" "}
          vehicles available
        </p>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </section>
  );
}

export function VehicleGridEmpty() {
  return (
    <div className="flex flex-col items-center justify-center rounded-sm border border-dashed border-border bg-card px-6 py-16 text-center">
      <Car className="mb-4 h-10 w-10 text-muted-foreground" aria-hidden="true" />
      <h3 className="text-lg font-bold uppercase tracking-tight">
        No vehicles found
      </h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Adjust your dates or filters, then click Show cars to search again.
      </p>
    </div>
  );
}
