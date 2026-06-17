# DECISIONS.md

Engineering decisions and tradeoffs for the Kaizen Wheels take-home.

---

## Persistence: Drizzle ORM + PostgreSQL

**Choice:** PostgreSQL 16 (Docker) with **Drizzle ORM** and the **`postgres`** (postgres.js) driver.

**I chose Drizzle over Prisma** because this is a small, well-bounded domain (vehicles, reservations, add-on catalog). Drizzle keeps the schema as TypeScript code that stays close to SQL — I needed a `NOT EXISTS` overlap query for availability filtering, and Drizzle lets me drop to raw SQL or `sql` fragments without fighting an abstraction. Prisma would have been faster to scaffold, but heavier for a repo this size and less ergonomic when the interesting query is inherently relational.

**I chose Drizzle over hand-written SQL** because migrations, type inference (`$inferSelect`), and enum definitions still matter. I get compile-time safety on repositories without giving up control over the hard queries.

**I chose `postgres.js` over `node-pg`** for a lighter connection pool and good Drizzle integration in a Next.js server context. The singleton pattern in `app/server/db/index.ts` avoids exhausting connections during dev hot reload.

**Schema highlights:**

- **UUID primary keys** — I chose UUIDs over serial integers because they're safe to seed with stable IDs, merge across environments, and expose in URLs without leaking fleet size. The cost is slightly larger indexes; irrelevant at this scale.
- **Integer cents everywhere** — avoids floating-point rounding bugs in discounts and add-on math.
- **`timestamptz` for reservations** — stored UTC, interpreted in a fixed rental timezone (`America/Los_Angeles`) for holiday logic.
- **Half-open intervals `[start, end)`** for availability — I chose this over closed intervals because back-to-back rentals (one ends at 10:00, the next starts at 10:00) should not conflict. This matches how real booking systems work.

---

## Add-ons data model

### Catalog table, not a junction table

**Choice:** A standalone `addons` catalog table. Selections live in **client state only** (`useState<Set<string>>`); there is no `reservation_addons` junction table.

**I chose a catalog-only model over persisting selections** because the brief explicitly says add-on choices do not need to survive beyond the review-page session. A junction table would imply we'd store line items on confirm, handle partial refunds, and reconcile catalog price changes — scope I deliberately avoided. When we do implement confirm, I'd add a `reservation_addons` table with snapshotted `unit_cents` and `quantity` at booking time so historical receipts stay accurate even if catalog prices change.

### Pricing model enum + pure calculator

**Choice:** Each add-on row has a `pricing_model` enum (`per_rental` | `per_day`) and a single `price_cents`. Pricing logic lives in `app/lib/addons.ts` as pure functions, not in the database or UI.

```typescript
type AddOnCatalogItem = {
  id: string;
  slug: string;           // stable identifier for selection state
  name: string;
  description: string;
  pricingModel: "per_rental" | "per_day";
  priceCents: number;
};
```

**I chose enum + calculator over a JSON pricing rules column** because the five required add-ons map cleanly to two models. A JSON blob (`{ "type": "per_day", "unit": "day" }`) would be more flexible on day one but harder to validate, index, and reason about. New add-ons today are a seed row + enum value that's already handled.

**I chose `slug` over `id` for client selection state** because slugs are human-debuggable in URLs and logs (`child_seat` vs a UUID). IDs remain in the catalog for future FK relationships.

**I chose catalog in Postgres over a static `ADDON_CATALOG` array** because ops/product should be able to add, reorder, or soft-disable extras (`is_active`, `sort_order`) without a deploy. The calculator stays in code; only metadata moves to the DB.

### Per-day billing: ceiling of 24-hour blocks

**Choice:** `rentalDayCount = max(1, ceil(durationHours / 24))`.

**I chose ceiling-of-hours over counting calendar midnights crossed** because "per day" in rental contexts usually means billable 24-hour blocks, not "how many dates appear on a calendar." A 25-hour rental bills 2 days for per-day add-ons, which matches user expectation better than a midnight-crossing rule that punishes odd pickup times.

**Tradeoff:** A same-calendar-day rental under 24 hours still bills 1 day (the `max(1, …)` floor). That's intentional — you always pay at least one unit.

### Discounts apply to base only

Add-ons are summed **after** the discounted base rental (`grandTotal = discountedBaseCents + addOnsSubtotal`). I kept discount logic in `calculateQuote` and add-on logic in `computeFullPriceBreakdown` so the separation is explicit and testable. An alternative — applying discounts to the full cart — would violate the spec and inflate discount leakage on high-margin extras.

### Extensibility path

To add a new pricing model (e.g. `per_hour`, `percentage_of_base`):

1. Extend the `pricing_model` enum + migration.
2. Add a case to `computeAddOnLineItem`.
3. Optionally add a new UI group in `AddOnSelector`.

No reservation schema change until we persist selections.

---

## Add-ons UI/UX

### Two-column checkout with sticky summary

**Choice:** Left column — vehicle details + add-on selector. Right column — sticky `PriceSummary` sidebar.

**I chose a sticky summary over inline totals only** because rental checkout is a comparison task: users toggle extras and need constant price anchoring without scrolling. The sidebar mirrors SIXT/enterprise rental patterns and matches the search-page visual language (green header card, lime accents).

### Checkboxes grouped by pricing model

**Choice:** `AddOnSelector` splits extras into **"Per rental"** and **"Per day"** sections with checkbox rows.

**I chose grouped checkboxes over a flat list** because mixed pricing models confuse users if presented uniformly — "$8" means something different for a child seat (× days) vs GPS (flat). Grouping sets expectations before selection.

**I chose checkboxes over steppers/quantity pickers** because each add-on is binary (you want one GPS, one fuel package). Quantity is derived from rental duration for per-day items, not user input. Steppers would invite invalid states (e.g. "3 child seats" when the car fits 5 passengers).

### Live price feedback in two places

Each row shows:

- **Unselected:** unit rate + model label (`$8.00 per day`).
- **Selected:** computed line total (`$24.00` for 3 days).

The sidebar shows the authoritative breakdown: base → discount → subtotal after discount → each add-on → total.

**I chose client-side recalculation over refetching `getQuote` on every toggle** because add-on math is deterministic given the server quote and selected slugs. Round-trips would add latency and load without improving correctness. The server quote (base + discount) is fetched once on page load; add-ons layer on top in `useMemo`.

**Tradeoff:** If catalog prices change mid-session, the client won't know until refresh. Acceptable for a demo; production would version the catalog or revalidate on confirm.

### Copy and transparency

- Footer note: *"Discounts apply to base rental only."* — surfaces the non-obvious rule before confirm.
- Per-day line items in the summary include quantity in the label (`Child seat (×3 days)`) so the math is auditable.

### Confirm booking is stubbed

The **Confirm booking** button logs `Not implemented`. I prioritized quote accuracy, add-on UX, and persistence for fleet/reservations over a full write path. The natural next step is a transactional `createReservation` that re-checks availability, inserts the reservation, and optionally snapshots add-on line items.

---

## Broader UI/UX decisions (context)

These aren't add-on-specific but shaped the checkout experience:

| Decision | Choice | Why |
|----------|--------|-----|
| Filter state | URL search params | Shareable searches; browser back works |
| Search without dates | Show full fleet; disable Select until dates set | Reduces friction browsing; gates booking on valid window |
| Discount display | Badges + struck-through base on search cards; full breakdown at checkout | Price transparency at decision points |
| Location input | UI-only (not filtered) | Scope control — dates and fleet attributes drive real availability |
| Design system | Kaizen brand tokens + shadcn primitives | Ships a cohesive look without custom component library work |

---

## Other tradeoffs

| Topic | Choice | Alternative | Rationale |
|-------|--------|-------------|-----------|
| Rental timezone | Fixed `America/Los_Angeles` | User-local TZ | Single canonical zone for fictitious holiday date checks; documented in code |
| Duration discount threshold | Strict `> 72` hours | `>= 72` | Matches "more than 3 days" in the brief |
| Discount tie-break | Prefer holiday when amounts equal | Prefer duration | Holiday is rarer; immaterial when amounts differ |
| Availability filtering | Server-side Postgres | Client-side filter | Correctness and performance as fleet grows |
| Pricing functions | Shared pure functions in `app/lib/` | Server-only | Same math on search cards (client preview) and review page (server quote) |

---

## What I'd do next

1. **Implement confirm** — transaction with availability re-check + optional `reservation_addons` snapshot.
2. **Add `per_hour` pricing model** — if product needs it; enum + calculator extension only.
3. **Catalog admin** — soft-disable and reorder already supported in schema; needs a UI.
4. **Unit tests** — `computeAddOnLineItem`, `calculateQuote`, and overlap availability are high-value pure-function targets.
