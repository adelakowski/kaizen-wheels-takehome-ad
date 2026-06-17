"use client";

import { ErrorBoundary } from "react-error-boundary";

import { ErrorFallback } from "@/components/shared/ErrorFallback";

export function VehicleFleetBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary
      fallback={<ErrorFallback message="Failed to load vehicles" />}
    >
      {children}
    </ErrorBoundary>
  );
}
