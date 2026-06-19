<img src="public/logo.svg" alt="Kaizen Logo" width="64" style="background: #666; padding: 0.25rem; border-radius: 100%; margin-bottom: 1rem;" />

# Kaizen Wheels

Premium car rental take-home — Next.js 16, PostgreSQL 16, Drizzle ORM.

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| **Node.js** | 20+ | LTS recommended |
| **npm** | 10+ | Ships with Node |
| **Docker Desktop** | Latest | Runs local Postgres via Compose |

You need Docker running before starting the database. The app will not work without Postgres — vehicle search, quotes, and add-ons all read from the database.

## Local setup

### 1. Clone and install

```bash
git clone <repo-url>
cd kaizen-wheels-takehome-ad
npm install
```

### 2. Configure environment

Copy the example env file and adjust if needed:

```bash
cp .env.example .env
```

| Variable | Default | Purpose |
|----------|---------|---------|
| `DATABASE_URL` | `postgresql://kaizen:kaizen@localhost:5432/kaizen_wheels` | Postgres connection string |
| `TZ` | `America/Los_Angeles` | Canonical rental timezone (holiday + pricing logic) |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | App base URL |

Defaults match `docker-compose.yml` — you usually do not need to change anything for local dev.

### 3. Start Postgres

```bash
docker compose up -d
```

Wait until the container is healthy:

```bash
docker compose ps
```

You should see `postgres` with status **healthy**. The database listens on `localhost:5432`.

### 4. Migrate and seed

Apply schema migrations and load sample data in one step:

```bash
npm run db:setup
```

Or run each step separately:

```bash
npm run db:migrate   # create tables from drizzle/ migrations
npm run db:seed      # truncate + load vehicles, reservations, add-ons
```

**What gets seeded:**

- **12 vehicles** — stable UUIDs, daily rates, classifications
- **9 reservations** — relative to today in `America/Los_Angeles` (for availability demos)
- **5 add-ons** — GPS, child seat, extra driver, pre-paid fuel, roadside assistance

Re-running `npm run db:seed` is safe — it truncates and reloads all three tables.

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Quick smoke test:**

1. Pick pickup/return dates in the booking bar → **Show cars**
2. Select a vehicle → review page with quote and optional extras
3. Toggle add-ons — totals update live in the sidebar

### 6. Verify (optional)

```bash
npm run ts      # TypeScript check
npm run test    # unit tests (domain logic)
npm run build   # production build
```

## npm scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server (port 3000) |
| `npm run build` | Production build |
| `npm run start` | Run production server (after `build`) |
| `npm run ts` | TypeScript check (`tsc --noEmit`) |
| `npm run test` | Run unit tests (Vitest) |
| `npm run test:coverage` | Unit tests with 100% coverage on `app/lib/` |
| `npm run db:generate` | Generate SQL migrations from `app/server/db/schema.ts` |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:seed` | Truncate and re-seed vehicles, reservations, add-ons |
| `npm run db:setup` | `db:migrate` + `db:seed` |

## Database commands

Schema lives in `app/server/db/schema.ts`. Migrations are generated into `drizzle/`.

To reset everything from scratch:

```bash
docker compose down -v   # remove Postgres volume (optional — wipes all data)
docker compose up -d
npm run db:setup
```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `ECONNREFUSED` on port 5432 | Start Docker and run `docker compose up -d` |
| Port 5432 already in use | Stop the other Postgres instance, or change the host port in `docker-compose.yml` and update `DATABASE_URL` |
| `relation "vehicles" does not exist` | Run `npm run db:migrate` |
| Empty vehicle list / API errors | Run `npm run db:seed` (or `npm run db:setup`) |
| Seed fails mid-run | Ensure Postgres is healthy (`docker compose ps`), then retry `npm run db:setup` |

## Project structure

```
app/
  components/           UI (search, review, shared shell)
  lib/                  Domain helpers (pricing, discounts, add-ons, search params)
  server/
    db/                 Drizzle schema + client
    repositories/       Postgres query layer
    seed/               Seed fixtures (stable UUIDs)
scripts/seed.ts         Seed runner
drizzle/                Generated SQL migrations
docker-compose.yml      Local Postgres 16
```

See [DECISIONS.md](./DECISIONS.md) for architecture trade-offs and [PROGRESS.txt](./PROGRESS.txt) for implementation status.


## Project requirements

This is Kaizen Wheels: a car rental app hardened across five areas.

### **Part 1: Styling** — complete

Kaizen Labs brand (forest green + lime accent), SIXT-style sticky booking bar, fleet grid, checkout UI.

### **Part 2: Persistence** — complete

Vehicles, reservations, and add-on catalog live in **PostgreSQL 16** via **Drizzle ORM**. See setup above.

### **Part 3: Filters** — complete

Date/time availability filtering plus class, daily price, passengers, and make.

### **Part 4: Discounts** — complete

Holiday (17%) vs duration ($10/day off the daily-rate base after 3+ days) — non-stackable, best price wins. All vehicle rates are **per day**.

### **Part 5: Optional add-ons** — complete

Review-page add-on selection from the Postgres catalog with live line-item breakdown.

See the original take-home brief below for full requirements on Parts 3–5.

### **Part 3: Filters** (requirements)

There are no filters in the app today. Add filtering so a user can find a vehicle for their trip. At minimum, support:

- A date/time range for pickup and drop-off, with vehicles filtered by availability.
- Whatever additional filters you think are useful (e.g. price, vehicle class, passenger count, make).

Briefly justify which filters you chose and why.

### **Part 4: Discounts** (requirements)

We'd like to add discounts that satisfy these requirements:

- A reservation that includes a holiday but does not start or end on that holiday should receive a 17% discount off the total price. (A list of fictitious holidays is included below.)
- A reservation for more than 3 days should receive a $10/day discount off the base rental (implemented using the same billable day count as vehicle pricing).
- These discounts cannot both apply at the same time. If they conflict, the discount with the best price applies to the reservation.
- Visitors should see the discount reflected during search and checkout, including on the review page.

List of fictitious holidays (10 randomly sampled dates in the year):

- Jan 21
- Feb 12
- Mar 04
- May 02
- Jun 16
- Jul 26
- Aug 03
- Sep 01
- Nov 05
- Dec 18

### **Part 5: Optional add-ons** (requirements)

Real rental flows let customers add extras at checkout (GPS, child seats, insurance, etc.). Add support for selecting optional add-ons on the review page and reflecting them in the price.

Requirements:

- The review page should let the user pick from a list of add-ons.
- Each add-on has its own price model — some are charged per rental, some per day (see the list below).
- The total cost should update live as the user toggles add-ons, and the page should show a line-item breakdown (base rental, each selected add-on, discount if applicable, total).
- Discounts from Part 4 apply to the base rental rate only, not to add-ons.
- Selections do not need to persist beyond the review page session.

Available add-ons:

| Name | Description | Price |
| --- | --- | --- |
| GPS Navigation | Suction-mount GPS unit | $5 per rental |
| Child seat | Forward-facing booster | $8 per day |
| Additional driver | Allow a second registered driver | $12 per day |
| Pre-paid fuel | Return the car empty | $40 per rental |
| Roadside assistance | 24/7 emergency support | $4 per day |
