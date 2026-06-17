"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import {
  Calendar,
  Car,
  ChevronDown,
  ChevronUp,
  Minus,
  Plus,
  Repeat,
  Search,
  SlidersHorizontal,
  Truck,
  User,
  Users,
} from "lucide-react";

import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { Label } from "@/components/shared/ui/label";
import { RangeSlider } from "@/components/shared/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/shared/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shared/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/shared/ui/toggle-group";
import { cn } from "@/lib/classnames";
import { formatCents } from "@/lib/formatters";
import {
  buildSearchParams,
  DEFAULT_MAX_RATE_CENTS,
  DEFAULT_MIN_RATE_CENTS,
  parseSearchFilters,
  type SearchFilters,
} from "@/lib/search-params";
import type { Classification } from "@/server/data";

const CLASSIFICATIONS: Classification[] = [
  "Compact",
  "SUV",
  "Sports",
  "Subcompact",
  "Minivan",
  "Luxury",
];

const SERVICE_TABS = [
  { id: "cars", label: "Cars", icon: Car, active: true },
  { id: "trucks", label: "Trucks", icon: Truck, active: false },
  { id: "subscription", label: "Subscription", icon: Repeat, active: false },
  { id: "transfer", label: "Airport transfer", icon: User, active: false },
] as const;

const DRIVER_AGE_OPTIONS = ["21+", "25+", "30+", "35+"];

type DateTimeParts = { date: string; time: string };

function splitDateTime(iso?: string): DateTimeParts {
  if (!iso) return { date: "", time: "12:00" };
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return { date: "", time: "12:00" };
  return {
    date: format(parsed, "yyyy-MM-dd"),
    time: format(parsed, "HH:mm"),
  };
}

function combineDateTime(date: string, time: string): string | undefined {
  if (!date) return undefined;
  const combined = new Date(`${date}T${time || "12:00"}`);
  if (Number.isNaN(combined.getTime())) return undefined;
  return combined.toISOString();
}

function ServiceTabsRow() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
      <div className="flex flex-wrap gap-2">
        {SERVICE_TABS.map(({ id, label, icon: Icon, active }) => (
          <button
            key={id}
            type="button"
            disabled={!active}
            className={cn(
              "inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-foreground text-background"
                : "cursor-not-allowed bg-muted text-muted-foreground opacity-70",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="cursor-pointer text-sm font-medium text-foreground underline-offset-4 hover:underline"
      >
        View / edit my booking
      </button>
    </div>
  );
}

function DateTimeField({
  id,
  label,
  parts,
  onChange,
}: {
  id: string;
  label: string;
  parts: DateTimeParts;
  onChange: (next: DateTimeParts) => void;
}) {
  return (
    <div className="min-w-[200px]">
      <Label
        htmlFor={`${id}-date`}
        className="mb-1.5 block text-xs font-semibold text-foreground"
      >
        {label}
      </Label>
      <div className="flex h-12 overflow-hidden rounded-xl border border-input bg-background">
        <div className="flex min-w-0 flex-1 items-center gap-2 border-r border-input px-3">
          <Calendar
            className="h-4 w-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id={`${id}-date`}
            type="date"
            value={parts.date}
            onChange={(event) =>
              onChange({ ...parts, date: event.target.value })
            }
            className="min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
        </div>
        <input
          id={`${id}-time`}
          type="time"
          value={parts.time}
          onChange={(event) =>
            onChange({ ...parts, time: event.target.value })
          }
          className="w-[7.5rem] shrink-0 bg-transparent px-3 text-sm outline-none"
        />
      </div>
    </div>
  );
}

function AdvancedFilters({
  draft,
  onChange,
}: {
  draft: SearchFilters;
  onChange: (next: SearchFilters) => void;
}) {
  return (
    <div className="grid gap-4 border-t border-border pt-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="space-y-1.5">
        <Label htmlFor="make" className="text-xs font-semibold text-muted-foreground">
          Make
        </Label>
        <Input
          id="make"
          placeholder="e.g. Toyota"
          value={draft.make}
          onChange={(event) => onChange({ ...draft, make: event.target.value })}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-muted-foreground">
          Min passengers
        </Label>
        <div className="flex h-10 items-center justify-between rounded-xl border border-input bg-background px-3">
          <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 cursor-pointer"
              aria-label="Decrease passengers"
              onClick={() =>
                onChange({
                  ...draft,
                  minPassengers: Math.max(1, draft.minPassengers - 1),
                })
              }
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>
            <span className="w-6 text-center text-sm font-medium tabular-nums">
              {draft.minPassengers}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 cursor-pointer"
              aria-label="Increase passengers"
              onClick={() =>
                onChange({
                  ...draft,
                  minPassengers: Math.min(8, draft.minPassengers + 1),
                })
              }
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-2 sm:col-span-2 lg:col-span-4">
        <Label className="text-xs font-semibold text-muted-foreground">
          Vehicle class
        </Label>
        <ToggleGroup
          type="multiple"
          value={draft.classifications}
          onValueChange={(values) =>
            onChange({
              ...draft,
              classifications: values as Classification[],
            })
          }
          className="flex flex-wrap justify-start gap-2"
        >
          {CLASSIFICATIONS.map((classification) => (
            <ToggleGroupItem
              key={classification}
              value={classification}
              className="cursor-pointer rounded-full border border-border px-3 text-xs data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              {classification}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="space-y-2 sm:col-span-2 lg:col-span-4">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold text-muted-foreground">
            Daily rate
          </Label>
          <span className="text-xs tabular-nums text-muted-foreground">
            {formatCents(draft.minDailyRateCents)} –{" "}
            {formatCents(draft.maxDailyRateCents)}
          </span>
        </div>
        <RangeSlider
          min={DEFAULT_MIN_RATE_CENTS}
          max={DEFAULT_MAX_RATE_CENTS}
          step={100}
          value={[draft.minDailyRateCents, draft.maxDailyRateCents]}
          onValueChange={([min, max]) =>
            onChange({
              ...draft,
              minDailyRateCents: min,
              maxDailyRateCents: max,
            })
          }
        />
      </div>
    </div>
  );
}

function BookingWidget({
  draft,
  onChange,
  onSubmit,
  location,
  onLocationChange,
  showAdvancedToggle = true,
}: {
  draft: SearchFilters;
  onChange: (next: SearchFilters) => void;
  onSubmit: () => void;
  location: string;
  onLocationChange: (value: string) => void;
  showAdvancedToggle?: boolean;
}) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [differentReturn, setDifferentReturn] = useState(false);
  const pickup = splitDateTime(draft.startTime);
  const dropoff = splitDateTime(draft.endTime);

  const updatePickup = (parts: DateTimeParts) => {
    onChange({
      ...draft,
      startTime: combineDateTime(parts.date, parts.time),
    });
  };

  const updateDropoff = (parts: DateTimeParts) => {
    onChange({
      ...draft,
      endTime: combineDateTime(parts.date, parts.time),
    });
  };

  return (
    <div className="space-y-3">
      <ServiceTabsRow />

      {/* Primary search row */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <Label
              htmlFor="location"
              className="text-xs font-semibold text-foreground"
            >
              Pickup & return
            </Label>
            <button
              type="button"
              onClick={() => setDifferentReturn((value) => !value)}
              className="shrink-0 cursor-pointer text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              {differentReturn
                ? "Same return location"
                : "+ Different return location"}
            </button>
          </div>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="location"
              placeholder="Airport, city or address"
              value={location}
              onChange={(event) => onLocationChange(event.target.value)}
              className="h-12 rounded-xl pl-9"
            />
          </div>
        </div>

        <DateTimeField
          id="pickup"
          label="Pickup date"
          parts={pickup}
          onChange={updatePickup}
        />

        <DateTimeField
          id="return"
          label="Return date"
          parts={dropoff}
          onChange={updateDropoff}
        />

        <Button
          type="button"
          onClick={onSubmit}
          className="kaizen-cta h-12 w-full shrink-0 cursor-pointer px-10 xl:w-auto xl:min-w-[140px]"
        >
          Show cars
        </Button>
      </div>

      {/* Secondary filters row */}
      <div className="flex flex-wrap items-center gap-4 border-t border-border pt-4">
        <div className="flex min-w-[180px] items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Select defaultValue="30+">
            <SelectTrigger className="h-10 w-full cursor-pointer rounded-xl border-input">
              <SelectValue placeholder="Driver's age" />
            </SelectTrigger>
            <SelectContent>
              {DRIVER_AGE_OPTIONS.map((age) => (
                <SelectItem key={age} value={age} className="cursor-pointer">
                  Driver&apos;s age {age}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="hidden h-8 w-px bg-border sm:block" />

        <button
          type="button"
          className="cursor-pointer text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          Apply corporate rate
        </button>

        {showAdvancedToggle && (
          <button
            type="button"
            onClick={() => setAdvancedOpen((open) => !open)}
            className="ml-auto flex cursor-pointer items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {advancedOpen ? (
              <>
                Hide filters <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                More filters <ChevronDown className="h-4 w-4" />
              </>
            )}
          </button>
        )}
      </div>

      {advancedOpen && (
        <AdvancedFilters draft={draft} onChange={onChange} />
      )}
    </div>
  );
}

export function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applied = useMemo(
    () => parseSearchFilters(searchParams),
    [searchParams],
  );
  const [draft, setDraft] = useState<SearchFilters>(applied);
  const [location, setLocation] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setDraft(applied);
  }, [applied]);

  const applyFilters = useCallback(() => {
    const params = buildSearchParams(draft);
    router.push(`/?${params.toString()}`);
    setMobileOpen(false);
  }, [draft, router]);

  const widgetProps = {
    draft,
    onChange: setDraft,
    onSubmit: applyFilters,
    location,
    onLocationChange: setLocation,
  };

  return (
    <>
      <div className="hidden lg:block">
        <BookingWidget {...widgetProps} />
      </div>

      <div className="flex items-center justify-between gap-3 lg:hidden">
        <p className="text-sm text-muted-foreground">
          {applied.startTime && applied.endTime
            ? "Dates selected — tap to edit"
            : "Set pickup & return to search"}
        </p>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="kaizen-cta cursor-pointer gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              Book
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[92vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Book a car</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <BookingWidget {...widgetProps} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

export function FilterBarFallback() {
  return <div className="h-36 w-full animate-pulse rounded-xl bg-muted/60" />;
}
