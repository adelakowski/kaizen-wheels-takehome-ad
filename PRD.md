# Kaizen Wheels — Product Requirements Document

> **Status:** Pre-implementation blueprint  
> **Audience:** Engineering (take-home assessment)  
> **Last updated:** 2026-06-17

---

## 1. Executive Summary & Product Goals

Kaizen Wheels is a premium car rental take-home inspired by enterprise rental leaders. The starter codebase ships a functional skeleton—search listing, review/quote page, in-memory data, and shadcn/ui primitives—but no visual design, persistence, filtering, discounts, or add-ons.

This PRD defines the implementation strategy to transform the skeleton into a **production-credible rental flow** that demonstrates senior engineering judgment: strict edge-case handling, clear architecture, and conscious trade-offs.

### Product Goals

| Goal | Success Criteria |
|------|------------------|
| **Discoverability** | Users filter by date/time and practical attributes; unavailable vehicles never appear in results. |
| **Price transparency** | Discounts and add-ons are computed server-side, shown live on search cards and checkout, with a clear line-item breakdown. |
| **Trust & polish** | UI follows [Kaizen Labs](https://www.kaizenlabs.co/) brand language — forest green, lime accent, Inter typography; rental UX inspired by premium booking flows. |
| **Correctness** | Monetary math uses integer cents; availability uses interval-overlap logic; discounts are non-stackable and deterministic. |
| **Extensibility** | Add-on catalog and pricing models extend without schema migrations for new fee types (within defined enums). |
| **Reviewer experience** | README documents local setup (Postgres, env vars, migrate/seed commands) so evaluators can run without guessing. |

### User Journey (Target State)

```
Search (/) ──► Apply filters (dates, class, price, passengers, make)
     │              │
     │              ▼
     │         Grid of available vehicles w/ discounted price preview
     │
     └──► Book now ──► Review (/review?id=&start=&end=)
                              │
                              ├── Toggle add-ons (client state)
                              ├── Live line-item summary (sticky sidebar)
                              └── Confirm reservation (creates DB row)
```

### Non-Goals (Explicit Scope Boundaries)

- User authentication, payments, or email confirmations
- Admin CRUD for vehicles/add-ons
- Persisting add-on selections beyond the review-page session
- Multi-location pickup/drop-off
- Insurance tiers or damage waivers beyond the five specified add-ons

---

## 2. Technical Stack & Data Architecture

### 2.1 Stack Decisions

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | **Next.js 16 App Router** (existing) | Already scaffolded; App Router supports Server Components for initial data fetch. |
| Language | **TypeScript** (existing) | Type safety across domain models and API boundaries. |
| Styling | **Tailwind CSS + shadcn/ui** (existing) | Design tokens via CSS variables; Radix primitives already installed. |
| Date/time | **Luxon** (server/domain) + **date-fns** (display) | Luxon already powers `data.ts` validation; keep Luxon for business logic, date-fns for formatting in UI. |
| Database | **PostgreSQL 16** | Relational fit for vehicles, reservations, overlap queries; industry standard. |
| ORM | **Drizzle ORM** + `drizzle-kit` migrations | Type-safe schema-as-code, excellent Postgres support, and escape hatch to raw SQL for availability queries. |
| DB driver | **`postgres` (postgres.js)** | Lightweight, works well with Drizzle on serverless/Node. |
| Validation | **Zod** (existing) | Shared schemas for API inputs and filter params. |
| Local dev DB | **Docker Compose** (`docker-compose.yml`) | One-command Postgres for reviewers. |

### 2.2 Environment Variables

```env
DATABASE_URL=postgresql://kaizen:kaizen@localhost:5432/kaizen_wheels
TZ=America/Los_Angeles          # Canonical rental timezone (see §4)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2.3 Entity-Relationship Diagram

```
┌─────────────────────┐         ┌──────────────────────────┐
│      vehicles       │         │       reservations       │
├─────────────────────┤         ├──────────────────────────┤
│ id          PK UUID │◄───┐    │ id              PK UUID  │
│ make        TEXT    │    │    │ vehicle_id      FK UUID  │──┐
│ model       TEXT    │    └────│ start_time      TIMESTAMPTZ│  │
│ year        INT     │         │ end_time        TIMESTAMPTZ│  │
│ doors       INT     │         │ base_price_cents INT      │  │
│ max_passengers INT  │         │ discount_type   ENUM|null │  │
│ classification ENUM │         │ discount_cents  INT       │  │
│ thumbnail_url TEXT  │         │ total_price_cents INT     │  │
│ hourly_rate_cents INT│        │ created_at      TIMESTAMPTZ│  │
│ created_at  TIMESTAMPTZ│       └──────────────────────────┘  │
└─────────────────────┘                                         │
                                                                │
┌─────────────────────┐                                         │
│       addons        │  (catalog — no FK to reservations)      │
├─────────────────────┤                                         │
│ id          PK UUID │                                         │
│ slug        TEXT UNIQUE                                       │
│ name        TEXT    │                                         │
│ description TEXT    │                                         │
│ pricing_model ENUM  │  'per_rental' | 'per_day'               │
│ price_cents INT     │                                         │
│ is_active   BOOLEAN │                                         │
│ sort_order  INT     │                                         │
└─────────────────────┘                                         │
         ▲                                                      │
         │ seeded catalog; selections live in client state only  │
         └──────────────────────────────────────────────────────┘
```

**Relationship summary**

- `vehicles` 1 ── * `reservations` — a vehicle may have many reservations; availability excludes overlapping ones.
- `addons` — standalone catalog table; no `reservation_addons` junction because add-on selections are session-only per requirements.

### 2.4 Drizzle Schema (Proposed)

```typescript
// Enums
export const classificationEnum = pgEnum('classification', [
  'Compact', 'SUV', 'Sports', 'Subcompact', 'Minivan', 'Luxury',
]);

export const discountTypeEnum = pgEnum('discount_type', [
  'holiday', 'duration', 'none',
]);

export const pricingModelEnum = pgEnum('pricing_model', [
  'per_rental', 'per_day',
]);

// vehicles
export const vehicles = pgTable('vehicles', {
  id: uuid('id').primaryKey().defaultRandom(),
  make: text('make').notNull(),
  model: text('model').notNull(),
  year: integer('year').notNull(),
  doors: integer('doors').notNull(),
  maxPassengers: integer('max_passengers').notNull(),
  classification: classificationEnum('classification').notNull(),
  thumbnailUrl: text('thumbnail_url').notNull(),
  hourlyRateCents: integer('hourly_rate_cents').notNull(), // e.g. 4500 = $45/hr
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// reservations
export const reservations = pgTable('reservations', {
  id: uuid('id').primaryKey().defaultRandom(),
  vehicleId: uuid('vehicle_id').references(() => vehicles.id).notNull(),
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }).notNull(),
  basePriceCents: integer('base_price_cents').notNull(),      // pre-discount base rental
  discountType: discountTypeEnum('discount_type').default('none'),
  discountCents: integer('discount_cents').notNull().default(0),
  totalPriceCents: integer('total_price_cents').notNull(),    // base - discount (no add-ons persisted)
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// addons (catalog)
export const addons = pgTable('addons', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  pricingModel: pricingModelEnum('pricing_model').notNull(),
  priceCents: integer('price_cents').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
});
```

### 2.5 Indexing Strategy

```sql
CREATE INDEX idx_reservations_vehicle_id ON reservations (vehicle_id);
CREATE INDEX idx_reservations_time_range ON reservations (vehicle_id, start_time, end_time);
CREATE INDEX idx_vehicles_classification ON vehicles (classification);
CREATE INDEX idx_vehicles_hourly_rate ON vehicles (hourly_rate_cents);
CREATE INDEX idx_vehicles_max_passengers ON vehicles (max_passengers);
```

The composite index on `(vehicle_id, start_time, end_time)` supports the `NOT EXISTS` availability subquery efficiently.

### 2.6 Migration & Seed Plan

1. **`drizzle-kit generate`** → SQL migrations in `drizzle/`
2. **`drizzle-kit migrate`** (or `db:migrate` npm script) on startup/dev
3. **`scripts/seed.ts`** — port existing `VEHICLES` and `RESERVATIONS` from `app/server/data.ts`; insert five add-on catalog rows
4. Deprecate in-memory arrays; `data_helpers.ts` becomes thin wrappers over Drizzle queries

### 2.7 Module Layout (Target)

```
app/
├── server/
│   ├── db/              # Drizzle client, schema, migrations
│   ├── repositories/    # vehicles, reservations, addons queries
│   ├── domain/          # pricing, discounts, availability (pure functions)
│   └── api.ts           # Public server API surface (unchanged contract shape)
├── components/
│   ├── search/          # FilterBar, VehicleGrid, VehicleCard
│   ├── review/          # AddOnSelector, PriceSummary, ReviewPage
│   └── shared/          # AppShell, ui/* (shadcn primitives)
└── lib/
    ├── formatters.tsx
    ├── holidays.ts      # Canonical holiday date list
    └── search-params.ts # URL ↔ filter state helpers
```

---

## 3. Functional & UI Specifications

### Part 1: Styling, UX & Design System Strategy

#### 1.1 Design Direction — Kaizen Labs Brand + Premium Rental UX

Brand reference: [Kaizen Labs](https://www.kaizenlabs.co/). Rental flow patterns (hero booking widget, fleet grid, checkout summary) follow premium car-rental conventions.

| Pattern | Kaizen Wheels Implementation |
|---------|------------------------------|
| White header chrome | Fixed `AppShell` with Kaizen mountain-peak logo, black nav links, pill **Get started** CTA |
| Dark green hero | Forest-green hero section with white headline + white booking widget card |
| Trust value props | Three-column row: best price, distinctive fleet, no hidden costs (lime icon badges) |
| Fleet grid | Responsive 1→3 column grid; rounded cards; green pill **Select** CTAs |
| Checkout clarity | Two-column review layout; green-header `PriceSummary` sidebar |

#### 1.2 Theme — Kaizen Labs Forest Green + Lime Accent

Extracted from [kaizenlabs.co](https://www.kaizenlabs.co/) brand system:

| Token | Value | Purpose |
|-------|-------|---------|
| `--primary` | `#00231C` (168 100% 7%) | CTAs, badges, footer, hero background |
| `--primary-foreground` | white | Text on green buttons |
| `--brand-lime` | `#C3F731` (72 92% 58%) | Logo highlight, hero eyebrow, trust icon badges |
| `--header` | white | Top navigation background |
| `--header-foreground` | black | Nav text and logo (light variant) |
| `--hero` | `#00231C` | Hero + summary header + footer |
| `--background` | white | Page canvas |
| `--foreground` | black | Body text |
| `--accent` | light lime tint | Discount/hover backgrounds |
| `--accent-foreground` | dark lime-green | Discount price callouts |
| `--radius` | `0.5rem` | Cards; CTAs use `rounded-full` (pill) |

**Typography:** Inter (Google Fonts) — geometric sans-serif matching Kaizen Labs. Headlines `font-semibold`; body `font-normal`; prices `tabular-nums`. CTAs use `.kaizen-cta` (`rounded-full font-semibold`).

**Logo:** `KaizenLogo` — rounded-square mark with mountain-peak **K** + lime accent stroke; light variant (dark mark on white header), dark variant (white mark on green footer).

**Discount badge:** Green or lime pill on fleet cards — e.g. `"17% off"` or `"Long-trip deal"`.

#### 1.3 Layout Components

| Component | Responsibility |
|-----------|---------------|
| `KaizenLogo` | Rounded-square K mark + wordmark; light/dark variants |
| `AppShell` | White sticky header, hero slot, dark green footer |
| `SearchHero` | Dark hero headline + white booking widget + trust badges |
| `FilterBar` | Pick-up/return dates, **Show cars** green pill CTA, collapsible advanced filters |
| `TrustBadges` | Best price / fleet / service value props with lime icon badges |
| `VehicleGrid` | Responsive 1→3 column fleet grid with empty state |
| `VehicleCard` | Premium fleet card with green pill Select CTA and discount badge |
| `PriceSummary` | Green-header sticky sidebar: line items, total, **Confirm booking** pill |
| `AddOnSelector` | Grouped add-on checkboxes with live subtotals |

#### 1.4 UI-UX-Pro-Max Skill Workflow

Design intelligence is provided by [UI-UX-Pro-Max-Skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill), installed locally at `.cursor/skills/ui-ux-pro-max/`. This replaces external MCP component fetchers with a reasoning-driven design system generator.

| Phase | Action | Command / Artifact |
|-------|--------|-------------------|
| **A — Design System** | Generate premium rental recommendations | `python .cursor/skills/ui-ux-pro-max/scripts/search.py "premium car rental corporate" --design-system --persist -p "Kaizen Wheels"` |
| **B — Persist** | Save master tokens for session continuity | `design-system/kaizen-wheels/MASTER.md` |
| **C — Stack Guidelines** | shadcn compound-component patterns | `python .../search.py "marketplace card grid" --stack shadcn` |
| **D — Implement** | Hand-craft components using MASTER + PRD theme tokens | See component map below |

**Design system output (Kaizen Wheels):**

- **Pattern:** Hero-centric booking (SIXT-style) — search widget as primary CTA, trust row, fleet grid
- **Style:** Corporate premium — bold uppercase typography, sharp corners, restrained motion
- **Typography:** Inter (via `next/font/google`)
- **Color authority:** Kaizen Labs `#00231C` primary, `#C3F731` lime accent, white header chrome

**Component implementation map:**

| Component | File | Kaizen Brand Patterns |
|-----------|------|----------------------|
| Logo + shell | `KaizenLogo.tsx`, `AppShell.tsx` | White header, green footer, pill Get started |
| Hero + booking widget | `SearchHero.tsx`, `FilterBar.tsx` | Green hero, white widget, Show cars pill CTA |
| Trust row | `TrustBadges.tsx` | Lime icon badges on green hero |
| Fleet grid + card | `VehicleGrid.tsx`, `VehicleCard.tsx` | Rounded cards, green Select pill |
| Checkout summary | `PriceSummary.tsx` | Green header sidebar, line-item clarity |
| Add-on selector | `app/components/review/AddOnSelector.tsx` | Grouped extras list, live subtotals |

**Pre-delivery checklist (from skill — enforced in Part 1):**

- Lucide SVG icons only (no emoji icons)
- `cursor-pointer` on all clickable elements
- Hover transitions 150–300ms; disabled under `prefers-reduced-motion`
- Light-mode contrast ≥ 4.5:1
- Visible focus rings via shadcn `ring` tokens
- Responsive breakpoints: 375 / 768 / 1024 / 1440px

**Integration rules:**

- Place feature components under `app/components/` (not `shared/ui/` — reserved for shadcn primitives)
- Normalize imports to `@/components/shared/ui/*` and `@/lib/classnames`
- Use CSS variable tokens (`bg-primary`, `text-accent-foreground`) — no hard-coded hex in components
- Wire props to domain types (`Vehicle`, `QuoteBreakdown`, `AddOnCatalogItem`)

---

### Part 2: Persistence & Schema Design

(Covered in §2.3–§2.6 above.)

#### Implementation Steps

1. Add `docker-compose.yml` with Postgres service
2. Install `drizzle-orm`, `postgres`, `drizzle-kit`; configure `drizzle.config.ts`
3. Define schema in `app/server/db/schema.ts`
4. Write `scripts/seed.ts` mapping existing seed data; convert Luxon datetimes → UTC `timestamptz`
5. Refactor `data_helpers.ts` → `repositories/vehicles.ts`, `repositories/reservations.ts`
6. Update `API.searchVehicles` to accept filter params and query Postgres
7. Update README with prerequisites, `docker compose up`, `npm run db:migrate`, `npm run db:seed`, `npm run dev`

#### Data Type Guardrails

| Field | Type | Notes |
|-------|------|-------|
| All prices | `INTEGER` (cents) | Never `NUMERIC`/`FLOAT` in application logic |
| Timestamps | `TIMESTAMPTZ` | Stored UTC; interpreted in rental TZ for holiday checks |
| IDs | `UUID` | Avoid sequential ID enumeration |
| Classification | Postgres `ENUM` | Matches existing TS union in `data.ts` |

---

### Part 3: Availability-Aware Search & Filters

#### 3.1 Core Availability Query

**Interval overlap rule:** Two reservations conflict when:

```
existing.start_time < requested.end_time
AND existing.end_time > requested.start_time
```

Half-open intervals `[start, end)` are recommended to prevent double-booking at exact handoff times (see §4).

**Drizzle / SQL implementation:**

```sql
SELECT v.*
FROM vehicles v
WHERE NOT EXISTS (
  SELECT 1
  FROM reservations r
  WHERE r.vehicle_id = v.id
    AND r.start_time < $requested_end::timestamptz
    AND r.end_time   > $requested_start::timestamptz
)
-- additional filter predicates appended below
;
```

**Drizzle sketch:**

```typescript
const available = await db
  .select()
  .from(vehicles)
  .where(
    and(
      notExists(
        db.select().from(reservations).where(
          and(
            eq(reservations.vehicleId, vehicles.id),
            lt(reservations.startTime, requestedEnd),
            gt(reservations.endTime, requestedStart),
          )
        )
      ),
      /* dynamic filters */
    )
  );
```

When no date range is provided, show all vehicles with a prominent prompt to select dates (soft gate — do not hide inventory, but disable "Book now" until dates set).

#### 3.2 Additional Filters (3–4)

| Filter | UI Control | Query Predicate | Product Justification |
|--------|-----------|-----------------|----------------------|
| **Vehicle Class** | Multi-select chips (`Compact`, `SUV`, …) | `classification = ANY($classes)` | Renters decide on body type early based on trip purpose (city commute vs. family road trip), so class is the highest-signal narrowing filter after dates. |
| **Price Range** | Dual-handle slider (min/max hourly rate) | `hourly_rate_cents BETWEEN $min AND $max` | Price anchoring drives conversion — users mentally budget per day/hour and eliminate outliers before emotionally investing in a specific car. |
| **Passenger Count** | Stepper (minimum seats) | `max_passengers >= $min_passengers` | Group-size fit is a hard constraint (especially for families); surfacing it prevents frustration from discovering a car can't fit everyone after picking dates. |
| **Make** | Combobox with autocomplete | `make ILIKE $make` or `make = $make` | Brand loyalty is strong in car rental — many users start search with "I want a Toyota" because of trust, familiarity, or prior ownership. |

**Optional fifth filter (time permitting):** Door count (`doors >= N`) for accessibility/luggage — lower priority.

#### 3.3 Search API Contract

```typescript
type SearchFilters = {
  startTime?: string;   // ISO 8601
  endTime?: string;
  classifications?: Classification[];
  minHourlyRateCents?: number;
  maxHourlyRateCents?: number;
  minPassengers?: number;
  make?: string;
};

type SearchResultVehicle = Vehicle & {
  quote: QuoteBreakdown; // includes discount preview when dates provided
};
```

Filters serialize to URL search params for shareable/bookmarkable state:

```
/?start=2026-06-20T10:00:00.000Z&end=2026-06-23T10:00:00.000Z&class=SUV,Compact&minPrice=4000&maxPrice=12000&passengers=5&make=Toyota
```

#### 3.4 Search Page UX Flow

1. User lands on `/` — all vehicles shown; filter bar defaults to empty dates
2. User selects pickup/drop-off → grid re-fetches (or client calls server action) → unavailable vehicles removed
3. Each card shows **total preview** for the selected window, with discount badge if applicable
4. "Book now" links to `/review?id={id}&start={iso}&end={iso}` preserving params

---

### Part 4: Non-Stackable Discount Engine

#### 4.1 Domain Constants

```typescript
// app/lib/holidays.ts
export const FICTITIOUS_HOLIDAYS = [
  { month: 1, day: 21 },  // Jan 21
  { month: 2, day: 12 },
  { month: 3, day: 4 },
  { month: 5, day: 2 },
  { month: 6, day: 16 },
  { month: 7, day: 26 },
  { month: 8, day: 3 },
  { month: 9, day: 1 },
  { month: 11, day: 5 },
  { month: 12, day: 18 },
] as const;

export const HOLIDAY_DISCOUNT_RATE = 0.17;          // 17% off base
export const DURATION_DISCOUNT_CENTS_PER_HOUR = 1000; // $10/hr
export const DURATION_THRESHOLD_HOURS = 72;           // > 3 days (strict)
export const RENTAL_TIMEZONE = 'America/Los_Angeles';
```

#### 4.2 Duration & Base Price Calculation

```typescript
function computeDurationHours(start: DateTime, end: DateTime): number {
  // Fractional hours preserved — matches existing api.ts behavior
  return end.diff(start, 'hours').hours;
}

function computeBasePriceCents(
  hourlyRateCents: number,
  durationHours: number,
): number {
  // Round to nearest cent after multiplication
  return Math.round(hourlyRateCents * durationHours);
}
```

#### 4.3 Holiday Discount Eligibility

A booking qualifies for the **Holiday Discount** when **all** of the following are true:

1. **Spans a holiday:** At least one calendar date in `[pickup_date, dropoff_date)` (in `RENTAL_TIMEZONE`) matches a fictitious holiday (month/day comparison, year-agnostic).
2. **Does not start on a holiday:** The pickup **calendar date** (in rental TZ) is NOT a holiday.
3. **Does not end on a holiday:** The dropoff **calendar date** (in rental TZ) is NOT a holiday.

```typescript
function isHolidayDate(dt: DateTime): boolean {
  return FICTITIOUS_HOLIDAYS.some(
    (h) => dt.month === h.month && dt.day === h.day
  );
}

function spansHoliday(start: DateTime, end: DateTime): boolean {
  let cursor = start.setZone(RENTAL_TIMEZONE).startOf('day');
  const lastDay = end.setZone(RENTAL_TIMEZONE).startOf('day');
  while (cursor <= lastDay) {
    if (isHolidayDate(cursor)) return true;
    cursor = cursor.plus({ days: 1 });
  }
  return false;
}

function qualifiesForHolidayDiscount(start: DateTime, end: DateTime): boolean {
  const pickupDay = start.setZone(RENTAL_TIMEZONE).startOf('day');
  const dropoffDay = end.setZone(RENTAL_TIMEZONE).startOf('day');
  return (
    spansHoliday(start, end) &&
    !isHolidayDate(pickupDay) &&
    !isHolidayDate(dropoffDay)
  );
}
```

**Holiday discount amount:**

```typescript
function holidayDiscountCents(basePriceCents: number): number {
  return Math.round(basePriceCents * HOLIDAY_DISCOUNT_RATE);
}
```

#### 4.4 Duration Discount Eligibility

Qualifies when `durationHours > 72` (strictly greater than 3 days).

**Duration discount amount** — $10/hr off the hourly rate, applied across all hours:

```typescript
function durationDiscountCents(durationHours: number): number {
  return Math.round(DURATION_DISCOUNT_CENTS_PER_HOUR * durationHours);
}

function durationDiscountedBaseCents(
  hourlyRateCents: number,
  durationHours: number,
): number {
  const effectiveRate = hourlyRateCents - DURATION_DISCOUNT_CENTS_PER_HOUR;
  return Math.round(Math.max(0, effectiveRate) * durationHours);
}
```

Equivalently: `discountCents = 1000 * durationHours` subtracted from base.

#### 4.5 Best-Discount Selection Algorithm

```typescript
type DiscountType = 'holiday' | 'duration' | 'none';

type QuoteBreakdown = {
  durationHours: number;
  hourlyRateCents: number;
  basePriceCents: number;
  discountType: DiscountType;
  discountCents: number;       // positive number representing savings
  discountedBaseCents: number; // basePriceCents - discountCents
};

function calculateQuote(
  hourlyRateCents: number,
  start: DateTime,
  end: DateTime,
): QuoteBreakdown {
  const durationHours = computeDurationHours(start, end);
  const basePriceCents = computeBasePriceCents(hourlyRateCents, durationHours);

  const candidates: Array<{ type: DiscountType; discountedBase: number }> = [
    { type: 'none', discountedBase: basePriceCents },
  ];

  if (qualifiesForHolidayDiscount(start, end)) {
    candidates.push({
      type: 'holiday',
      discountedBase: basePriceCents - holidayDiscountCents(basePriceCents),
    });
  }

  if (durationHours > DURATION_THRESHOLD_HOURS) {
    candidates.push({
      type: 'duration',
      discountedBase: durationDiscountedBaseCents(hourlyRateCents, durationHours),
    });
  }

  // Pick lowest final base price (best for user); tie-breaker: holiday > duration > none
  const best = candidates.reduce((a, b) =>
    a.discountedBase < b.discountedBase ? a :
    a.discountedBase > b.discountedBase ? b :
    priority(a.type) >= priority(b.type) ? a : b
  );

  return {
    durationHours,
    hourlyRateCents,
    basePriceCents,
    discountType: best.type,
    discountCents: basePriceCents - best.discountedBase,
    discountedBaseCents: best.discountedBase,
  };
}
```

#### 4.6 Surfacing Discounts in UI

| Surface | Display |
|---------|---------|
| **Search card** | Struck-through base total + discounted total; badge with discount type |
| **Review page** | Line item: `"Base rental"` → `"Holiday discount (−17%)"` or `"Long-trip discount (−$10/hr × N hrs)"` |
| **API** | `getQuote()` returns full `QuoteBreakdown`; search embeds same in each result |

**Critical rule:** Discounts apply to **base rental only**, never to add-ons (Part 5).

---

### Part 5: Extensible Add-ons Architecture

#### 5.1 Catalog Data Shape

```typescript
type PricingModel = 'per_rental' | 'per_day';

type AddOnCatalogItem = {
  id: string;
  slug: string;               // 'gps', 'child_seat', etc.
  name: string;
  description: string;
  pricingModel: PricingModel;
  priceCents: number;
};

// Seed data
const ADDON_CATALOG: AddOnCatalogItem[] = [
  { slug: 'gps',           name: 'GPS Navigation',      pricingModel: 'per_rental', priceCents: 500 },
  { slug: 'child_seat',    name: 'Child seat',          pricingModel: 'per_day',    priceCents: 800 },
  { slug: 'extra_driver',  name: 'Additional driver',   pricingModel: 'per_day',    priceCents: 1200 },
  { slug: 'prepaid_fuel',  name: 'Pre-paid fuel',       pricingModel: 'per_rental', priceCents: 4000 },
  { slug: 'roadside',      name: 'Roadside assistance', pricingModel: 'per_day',    priceCents: 400 },
];
```

**Extensibility:** New add-ons require only a catalog row. Future pricing models (e.g. `per_hour`, `percentage_of_base`) extend the `pricingModel` enum and add a case to the calculator — no reservation schema change.

#### 5.2 Add-on Price Calculator

```typescript
function rentalDayCount(durationHours: number): number {
  // Billable days: ceiling of duration in 24-hour blocks
  return Math.max(1, Math.ceil(durationHours / 24));
}

function computeAddOnLineItem(
  addon: AddOnCatalogItem,
  durationHours: number,
): { label: string; quantity: number; unitCents: number; totalCents: number } {
  switch (addon.pricingModel) {
    case 'per_rental':
      return {
        label: addon.name,
        quantity: 1,
        unitCents: addon.priceCents,
        totalCents: addon.priceCents,
      };
    case 'per_day': {
      const days = rentalDayCount(durationHours);
      return {
        label: `${addon.name} (×${days} days)`,
        quantity: days,
        unitCents: addon.priceCents,
        totalCents: addon.priceCents * days,
      };
    }
  }
}
```

#### 5.3 Checkout State & Live Recalculation

```typescript
type CheckoutState = {
  vehicleId: string;
  startTime: string;
  endTime: string;
  selectedAddOnSlugs: Set<string>; // client-only; not persisted
};

type FullPriceBreakdown = QuoteBreakdown & {
  addOnLines: Array<{
    slug: string;
    label: string;
    totalCents: number;
  }>;
  addOnsSubtotalCents: number;
  grandTotalCents: number; // discountedBase + addOnsSubtotal
};
```

**Recalculation pipeline (runs on every add-on toggle):**

```
1. quote = calculateQuote(hourlyRate, start, end)     // server or shared pure fn
2. addOnLines = selected addons.map(computeAddOnLineItem)
3. addOnsSubtotal = sum(addOnLines.totalCents)
4. grandTotal = quote.discountedBaseCents + addOnsSubtotal
```

**PriceSummary line-item layout (top → bottom):**

| Line | Value |
|------|-------|
| Base rental ({N} hrs × ${rate}/hr) | `basePriceCents` |
| Discount (if any) | `−discountCents` (indigo text) |
| **Subtotal after discount** | `discountedBaseCents` |
| *Each selected add-on* | `+line.totalCents` |
| **Total** | `grandTotalCents` |

#### 5.4 Review Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│  AppShell                                                    │
├──────────────────────────────┬──────────────────────────────┤
│  VehicleDetails (image, spec) │  PriceSummary (sticky)       │
│  Timeline (pickup → dropoff)  │  ─────────────────────       │
│  AddOnSelector (checkboxes)   │  Base rental        $XXX     │
│                               │  Holiday discount   −$XX      │
│                               │  GPS                +$5       │
│                               │  Child seat (×3)    +$24      │
│                               │  ─────────────────────       │
│                               │  Total              $XXX     │
│                               │  [ Confirm reservation ]     │
└──────────────────────────────┴──────────────────────────────┘
```

State management: `useState<Set<string>>` for selected slugs; derive breakdown with `useMemo` calling shared `computeFullPriceBreakdown()`.

---

## 4. Edge Cases & Guardrails

### 4.1 Timezone Handling

| Scenario | Guardrail |
|----------|-----------|
| User in different TZ than rental | All holiday checks use `America/Los_Angeles`. UI displays localized times via `Intl.DateTimeFormat`, but domain logic converts ISO inputs → Luxon with explicit zone before comparison. |
| DST transitions | Luxon handles DST; store UTC in DB; never use bare `Date` arithmetic for pricing. |
| Date-only vs datetime inputs | Require full datetime for pickup/drop-off; default times to 10:00 AM local if user picks date-only in UI. |

### 4.2 Availability & Overlap

| Scenario | Guardrail |
|----------|-----------|
| Exact handoff (A ends 10:00, B starts 10:00) | Use half-open intervals `[start, end)` — end equal to another's start is **not** a conflict. Document in code comments. |
| Back-to-back bookings | Allowed under half-open model. |
| Past reservations in seed data | Seed includes historical reservations (`TODAY.minus({ days: 3 })`); availability query naturally excludes only overlapping windows. |
| Search without dates | Show all vehicles; disable booking CTA until dates valid. |
| Race condition on confirm | On confirm, re-run availability check in a transaction; reject with 409 if conflict. |

### 4.3 Holiday Discount Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Pickup on holiday (e.g. Jun 16) | **No** holiday discount, even if trip spans another holiday |
| Dropoff on holiday | **No** holiday discount |
| Multiple holidays in range (e.g. Jul 26 + Aug 3) | Single 17% discount (not stacked) |
| Holiday is pickup day but trip spans Feb 12 | **No** — fails rule #2 |
| Same-day rental spanning midnight over a holiday | Evaluate calendar dates in rental TZ; if holiday falls on an interior day, qualifies (if pickup/dropoff days aren't holidays) |
| Trip includes Dec 18 but pickup Nov 20, dropoff Dec 18 | **No** — dropoff on holiday |

### 4.4 Duration Discount Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Exactly 72 hours | **No** duration discount (`> 72` required) |
| 72.5 hours | Qualifies |
| Very long rental (30 days) | Duration discount applies; verify no integer overflow (72h × $10 = $720 discount — fine in cents) |
| Duration vs holiday — which wins? | Compute both; apply whichever yields lower `discountedBaseCents` |
| Tie between discounts | Prefer holiday (arbitrary tie-break; document in DECISIONS.md) |

### 4.5 Fractional Hours & Day Counting

| Scenario | Guardrail |
|----------|-----------|
| 25-hour rental | `durationHours = 25`; `rentalDayCount = ceil(25/24) = 2` for per-day add-ons |
| 1-hour rental | `rentalDayCount = max(1, ceil(1/24)) = 1` — minimum 1 billable day for per-day add-ons |
| Sub-hour rentals | Existing code allows; minimum booking duration validation (e.g. 1 hour) optional — document if added |

### 4.6 Monetary Precision

| Scenario | Guardrail |
|----------|-----------|
| 17% of $999.99 base | `Math.round(basePriceCents * 0.17)` — always integer cents |
| Display | `formatCents()` existing helper; show cents only when non-zero (`$45.50` not `$46`) |
| Negative effective rate | Clamp: `Math.max(0, effectiveRate)` if hourly − $10 < 0 (extreme edge) |

### 4.7 Input Validation

| Input | Validation |
|-------|-----------|
| `end <= start` | 400 error (existing in `api.ts`) |
| Invalid ISO | 400 error |
| Unknown vehicle ID | 404 |
| `minPrice > maxPrice` | Swap or return empty results with UI warning |
| SQL injection | Parameterized queries only (Drizzle handles this) |

### 4.8 Confirm Reservation (Future Hook)

`handleConfirm` currently logs `"Not implemented"`. Target behavior:

1. Re-validate availability + quote server-side
2. Insert `reservations` row with computed prices
3. Redirect to confirmation page (or toast) — optional stretch goal

---

## 5. Planned Trade-offs

These decisions will be expanded in `DECISIONS.md` during implementation.

| Decision | Choice | Alternatives Considered | Why |
|----------|--------|------------------------|-----|
| **ORM** | Drizzle | Prisma, raw SQL | Type-safe schema + raw SQL escape hatch for overlap query; lighter than Prisma for a small domain |
| **Rental timezone** | Fixed `America/Los_Angeles` | User-local TZ | Single canonical zone avoids ambiguity in holiday date checks; document clearly |
| **Interval semantics** | Half-open `[start, end)` | Closed intervals | Industry standard for booking systems; allows back-to-back rentals |
| **Duration threshold** | Strict `> 72` hours | `>= 72` | Matches README literal "more than 3 days" |
| **Per-day add-on billing** | `ceil(hours / 24)` | Calendar midnights crossed | Simpler, predictable; aligns with "per day" language |
| **Add-on persistence** | Client session only | Junction table | Matches requirements; reduces scope |
| **Search without dates** | Show all, gate booking | Hide all until dates set | Hero booking widget prompts for dates before fleet selection |
| **Discount tie-break** | Prefer holiday | Prefer duration, prefer none | Holiday is rarer/more "special"; immaterial if amounts differ |
| **Server vs client pricing** | Shared pure functions in `domain/`; callable from API and client | Server-only | Enables live checkout recalc without round-trips; server re-validates on confirm |
| **UI tooling** | UI-UX-Pro-Max skill + hand-crafted shadcn | External component MCP fetchers | Design system reasoning without integration friction; PRD theme tokens preserved |
| **UUID vs serial IDs** | UUID | Serial integers | Safer for distributed systems; slightly larger index |
| **Filter state** | URL search params | React context / cookies | Shareable searches; back button works |
| **Confirm reservation** | Implement DB insert | Leave stub | Demonstrates end-to-end; low effort once DB exists |

### Known Intentional Omissions

- Payment processing and cancellation/refund flows
- Email/SMS notifications
- Admin dashboard for fleet management
- Rate limiting and auth
- Optimistic UI for filter changes (acceptable loading skeleton is sufficient)
- Comprehensive E2E test suite (unit tests for discount/availability pure functions recommended)

---

## Appendix A: File Change Checklist

| Area | Files to Create/Modify |
|------|----------------------|
| Infrastructure | `docker-compose.yml`, `drizzle.config.ts`, `.env.example` |
| Database | `app/server/db/schema.ts`, `app/server/db/index.ts`, `drizzle/*.sql`, `scripts/seed.ts` |
| Domain | `app/server/domain/pricing.ts`, `app/server/domain/discounts.ts`, `app/server/domain/addons.ts`, `app/lib/holidays.ts` |
| Repositories | `app/server/repositories/vehicles.ts`, `app/server/repositories/reservations.ts` |
| API | Refactor `app/server/api.ts`, deprecate `app/server/data.ts` |
| UI | `AppShell`, `FilterBar`, `VehicleCard`, `VehicleGrid`, `PriceSummary`, `AddOnSelector`; update `SearchPage`, `ReviewPage` |
| Theme | `app/index.css` (Kaizen Labs green / lime tokens) |
| Docs | `README.md` (setup), `DECISIONS.md` (trade-offs log) |

## Appendix B: npm Scripts (Proposed)

```json
{
  "db:generate": "drizzle-kit generate",
  "db:migrate": "drizzle-kit migrate",
  "db:seed": "tsx scripts/seed.ts",
  "db:studio": "drizzle-kit studio"
}
```

## Appendix C: Acceptance Criteria Summary

- [ ] Postgres running via Docker; migrations and seed succeed on fresh clone
- [ ] Search filters by date range exclude overlapping reservations
- [ ] Four additional filters functional with URL persistence
- [ ] Holiday and duration discounts computed correctly; best price applied; never stacked
- [ ] Discount visible on search cards and review page
- [ ] Add-ons toggle with live line-item breakdown; discount applies to base only
- [x] UI reflects Kaizen Labs brand + premium rental patterns; KaizenLogo, SearchHero, FilterBar, VehicleCard, PriceSummary implemented
- [ ] README enables evaluator setup without guessing
