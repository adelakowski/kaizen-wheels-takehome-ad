<img src="public/logo.svg" alt="Kaizen Logo" width="64" style="background: #666; padding: 0.25rem; border-radius: 100%; margin-bottom: 1rem;" />

# Kaizen Wheels

Premium car rental take-home — Next.js 16, Postgres, Drizzle ORM.

## Prerequisites

- **Node.js** 20+ and npm
- **Docker** (for local Postgres)

## Local setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment variables**

   ```bash
   cp .env.example .env
   ```

   | Variable | Default | Purpose |
   |----------|---------|---------|
   | `DATABASE_URL` | `postgresql://kaizen:kaizen@localhost:5432/kaizen_wheels` | Postgres connection |
   | `TZ` | `America/Los_Angeles` | Canonical rental timezone |
   | `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | App base URL |

3. **Start Postgres**

   ```bash
   docker compose up -d
   ```

4. **Run migrations and seed**

   ```bash
   npm run db:setup
   ```

   Or step by step:

   ```bash
   npm run db:migrate   # apply drizzle migrations
   npm run db:seed      # load vehicles, reservations, add-on catalog
   ```

5. **Start the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Database commands

| Command | Description |
|---------|-------------|
| `npm run db:generate` | Generate SQL migrations from `app/server/db/schema.ts` |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:seed` | Truncate and re-seed vehicles, reservations, add-ons |
| `npm run db:setup` | `db:migrate` + `db:seed` |

## Project structure

```
app/server/db/          Drizzle schema + client
app/server/repositories/  Postgres query layer
app/server/seed/        Seed fixtures (stable UUIDs)
scripts/seed.ts         Migration seed runner
drizzle/                Generated SQL migrations
```

## Type checking

```bash
npm run ts
```

---

## Project requirements

This is Kaizen Wheels: a car rental app hardened across five areas.

### **Part 1: Styling** — complete

Kaizen Labs brand (forest green + lime accent), SIXT-style sticky booking bar, fleet grid, checkout UI.

### **Part 2: Persistence** — complete

Vehicles, reservations, and add-on catalog live in **PostgreSQL 16** via **Drizzle ORM**. See setup above.

### **Part 3: Filters**

Date/time availability filtering plus class, price, passengers, and make.

### **Part 4: Discounts**

Holiday (17%) vs duration ($10/hr after 3 days) — non-stackable, best price wins.

### **Part 5: Optional add-ons**

Review-page add-on selection with live line-item breakdown.

See the original take-home brief below for full requirements on Parts 3–5.

### **Part 3: Filters** (requirements)

There are no filters in the app today. Add filtering so a user can find a vehicle for their trip. At minimum, support:

- A date/time range for pickup and drop-off, with vehicles filtered by availability.
- Whatever additional filters you think are useful (e.g. price, vehicle class, passenger count, make).

Briefly justify which filters you chose and why.

### **Part 4: Discounts** (requirements)

We'd like to add discounts that satisfy these requirements:

- A reservation that includes a holiday but does not start or end on that holiday should receive a 17% discount off the total price. (A list of fictitious holidays is included below.)
- A reservation for more than 3 days should receive a $10/hr discount on the hourly rate.
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
