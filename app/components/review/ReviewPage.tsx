import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { ReviewWithDatesClient } from "@/components/review/ReviewWithDatesClient";
import { VehicleDetails } from "@/components/review/VehicleDetails";
import { AppShell } from "@/components/shared/AppShell";
import { ErrorFallback } from "@/components/shared/ErrorFallback";
import { Button } from "@/components/shared/ui/button";
import { toQuoteBreakdown } from "@/lib/quote";
import { API } from "@/server/api";

export async function ReviewPage({
  id,
  start,
  end,
}: {
  id?: string;
  start?: string;
  end?: string;
}) {
  if (!id) {
    throw new Error("No vehicle ID found");
  }

  const vehicle = await API.getVehicle(id);

  if (!start || !end) {
    return (
      <AppShell>
        <div className="mx-auto max-w-2xl space-y-6">
          <header className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Complete your booking
            </h1>
            <p className="text-muted-foreground">
              Select pick-up and return dates on the search page to see your
              quote.
            </p>
          </header>
          <VehicleDetails vehicle={vehicle} />
          <Button asChild variant="outline">
            <a href="/">Back to search</a>
          </Button>
        </div>
      </AppShell>
    );
  }

  const rawQuote = await API.getQuote({
    vehicleId: id,
    startTime: new Date(start).toISOString(),
    endTime: new Date(end).toISOString(),
  });
  const quote = toQuoteBreakdown(rawQuote);

  return (
    <AppShell>
      <ReviewWithDatesClient
        vehicle={vehicle}
        quote={quote}
        start={start}
        end={end}
      />
    </AppShell>
  );
}

export function ReviewPageShell({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; start?: string; end?: string }>;
}) {
  return (
    <ErrorBoundary
      fallback={<ErrorFallback message="Failed to load reservation" />}
    >
      <Suspense fallback={<ReviewPageFallback />}>
        <ReviewPageWrapper searchParams={searchParams} />
      </Suspense>
    </ErrorBoundary>
  );
}

async function ReviewPageWrapper({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; start?: string; end?: string }>;
}) {
  const params = await searchParams;
  return (
    <ReviewPage id={params.id} start={params.start} end={params.end} />
  );
}

function ReviewPageFallback() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="h-10 w-64 animate-pulse rounded-lg bg-muted" />
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="h-96 animate-pulse rounded-xl bg-muted" />
          <div className="h-80 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    </AppShell>
  );
}
