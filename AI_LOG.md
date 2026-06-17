# Product requirement document for Kaizen Wheels
_Exported on 6/17/2026 at 02:28:18 EDT from Cursor (3.4.20)_

---

**User**

You are a Staff Product Engineer acting as my co-pilot for a Next.js / TypeScript car rental take-home assessment called "Kaizen Wheels." 

Before we write any application code, your task is to generate a comprehensive Product Requirement Document (`PRD.md`) that maps out our entire implementation strategy. The interviewers are looking for senior-level engineering judgment, strict handling of edge cases, clear architecture, and conscious trade-offs.

Our frontend implementation strategy has two core pillars:
1. **Design Inspiration:** We will explicitly mimic the clean, data-dense marketplace patterns of Turo.com (e.g., sticky top navigation filters, interactive grid cards, and an Apple/Airbnb style clear line-item summary layout for checkout).
2. **UI Execution Tool:** We will leverage our active `@21st-dev/magic` MCP server to pull and install production-ready, highly crafted UI components using the `/ui` tool protocol. This will prevent generic AI boilerplate layouts and replace them with high-caliber, animated frontend primitives.

Please read the codebase context, analyze the requirements below, and generate a markdown file named `PRD.md` in the project root.

---

### Core Requirements to Blueprint:

1. **Part 1: Styling, UX & MCP Strategy**
   - Plan a modern, cohesive UI using Tailwind CSS and shadcn/ui primitives.
   - Outline a professional theme (Zinc base with an Emerald/Indigo accent color) reflecting a modern mobility startup.
   - Outline our roadmap for leveraging the `@21st-dev/magic` MCP toolchain to fetch polished, conversion-optimized search bars and booking cards.

2. **Part 2: Persistence & Schema Design**
   - We will migrate from in-memory (`app/server/data.ts`) to a real PostgreSQL database. 
   - Propose an entity-relationship diagram (ERD) mapping in markdown text. 
   - Define schemas for `vehicles`, `reservations`, and `addons`. Ensure robust data types (e.g., storing monetary amounts in cents/integers to avoid floating-point errors).

3. **Part 3: Availability-Aware Search & Filters (Turo-Style)**
   - Formulate the exact SQL/ORM query logic required to filter out vehicles that have overlapping reservation date/time ranges.
   - Propose 3-4 additional highly practical filters (e.g., Vehicle Class, Price Range, Passenger Count) and explicitly write out a 1-sentence product justification for each based on user booking psychology.

4. **Part 4: Non-Stackable Discount Engine**
   - Specify the programmatic business logic to calculate and compare the two discount models:
     - *Holiday Discount:* 17% off total price if the booking spans a fictional holiday (Jan 21, Feb 12, Mar 04, May 02, Jun 16, Jul 26, Aug 03, Sep 01, Nov 05, Dec 18) but *does not* start or end on it.
     - *Duration Discount:* $10/hr off the hourly rate for reservations > 3 days (72 hours).
   - Detail the algorithm that calculates both and safely applies the one yielding the better price for the user, surfacing this live during search and checkout.

5. **Part 5: Extensible Add-ons Architecture**
   - Design a highly extensible data shape for optional add-ons that handles mixed pricing models seamlessly:
     - Per rental fixed fee (GPS: $5, Pre-paid fuel: $40)
     - Per day recurring fee (Child seat: $8/day, Additional driver: $12/day, Roadside assistance: $4/day)
   - Outline how the checkout state will recalculate live line-items (Base, Add-ons Breakdown, Best Discount applied to Base only, and Total).

---

### Structure of the Output `PRD.md`:

Ensure the generated `PRD.md` includes the following distinct sections:
- **1. Executive Summary & Product Goals**
- **2. Technical Stack & Data Architecture** (Include proposed DB schema and choice of ORM/client)
- **3. Functional & UI Specifications** (Break down Parts 1 through 5 with concrete technical implementation steps and explicit 21st-dev component directives)
- **4. Edge Cases & Guardrails** (Explicitly identify complex scenarios, such as timezone handling for rental dates, checking out across multiple holidays, or handling fractional rental days)
- **5. Planned Trade-offs** (A preview section to feed into our final `DECISIONS.md` file)

Do not write application code yet. Focus entirely on drafting a high-caliber, thorough `PRD.md` that we can use as our project source of truth.

---

**Cursor**

Exploring the codebase and MCP tooling to draft a PRD grounded in the project’s actual structure and requirements.


Drafting `PRD.md` from the codebase review and requirements.


I've created `PRD.md` at the project root. It maps the starter codebase (`app/server/data.ts`, `api.ts`, unstyled search/review pages, existing shadcn/ui primitives) to a full implementation plan.

### Highlights

**§1 — Executive Summary**  
Defines product goals, the target user journey, and explicit non-goals (auth, payments, add-on persistence).

**§2 — Technical Stack & Data Architecture**  
- **Postgres + Drizzle ORM** with a full ERD and proposed schema  
- Integer cents for all monetary fields, `TIMESTAMPTZ` for reservations  
- Index strategy for availability queries  
- Migration/seed plan porting existing in-memory data  

**§3 — Functional & UI Specs (Parts 1–5)**  
- **Part 1:** Zinc/Emerald/Indigo theme tokens, Turo-style layout breakdown, and a phased **@21st-dev/magic** roadmap with explicit `/ui` directives for `FilterBar`, `VehicleCard`, `PriceSummary`, and `AddOnSelector`  
- **Part 2:** Schema tables for `vehicles`, `reservations`, and `addons`  
- **Part 3:** Exact overlap SQL (`start < requested_end AND end > requested_start`), plus 4 filters with one-sentence product justifications  
- **Part 4:** Full discount algorithm — holiday eligibility (spans but doesn't start/end on holiday), duration (`> 72` hrs, $10/hr off), best-price selection, UI surfacing  
- **Part 5:** Extensible add-on shape with `per_rental` / `per_day` calculators and live checkout line-item pipeline  

**§4 — Edge Cases & Guardrails**  
Covers timezones, half-open intervals, multi-holiday trips, fractional hours, per-day billing with `ceil(hours/24)`, monetary rounding, and confirm-time race conditions.

**§5 — Planned Trade-offs**  
Preview table for `DECISIONS.md` — Drizzle vs Prisma, fixed rental timezone, half-open intervals, client-only add-ons, URL filter state, etc.

Appendices include a file checklist, proposed npm scripts, and acceptance criteria.

When you're ready to implement, we can start with Part 2 (database scaffolding) or Part 1 (theme + MCP component pulls) — whichever you prefer.

---

**User**

Execute Part 1: Styling, UX & MCP Strategy from the PRD, report progress in PROGRESS.txt @PROGRESS.txt, and ensure the generated code passes unit tests and compilation in npm run dev is error-free@PRD.md 

---

**Cursor**

Executing Part 1 from the PRD: reviewing the spec, current codebase, and MCP tooling, then implementing styling and UI components.


---

**User**

update the PRD to remove the use of @21st-dev/magic MCP server, instead use UI-UX-PRO-MAX-SKILL https://github.com/nextlevelbuilder/ui-ux-pro-max-skill to finish executing Part 1.

ensure the generated code passes unit tests and compilation in npm run dev is error-free
report progress in PROGRESS.txt@PROGRESS.txt @PRD.md 

---

**Cursor**

Updating the PRD to use UI-UX-PRO-MAX-SKILL instead of the MCP server, then finishing Part 1. Reading the skill file and current project state.


---

**User**

continue the to-do's

---

**Cursor**

Continuing Part 1 implementation. Checking project state and proceeding.


The UI-UX-PRO-MAX skill is installed. Generating the design system and implementing Part 1 components.


Implementing Part 1 components and updating the PRD.


Fixing React hooks order in ReviewPage and simplifying VehicleCard date validation.


Part 1 is complete. Summary of what was done:

### PRD updated
- Replaced `@21st-dev/magic` MCP references with **UI-UX-Pro-Max-Skill** workflow (§1.4)
- Updated module layout, trade-offs, and acceptance criteria

### Part 1 implemented (UI-UX-Pro-Max + PRD theme)
| Area | Delivered |
|------|-----------|
| **Design system** | Generated & persisted to `design-system/kaizen-wheels/MASTER.md` |
| **Theme** | Zinc/Emerald/Indigo tokens, Inter font, `prefers-reduced-motion` |
| **Search** | `AppShell`, `FilterBar` (desktop + mobile sheet), `VehicleGrid`, `VehicleCard` |
| **Review** | Two-column layout, `PriceSummary`, `AddOnSelector`, styled `VehicleDetails` |
| **Libs** | `quote.ts`, `addons.ts`, `search-params.ts`, `filters.ts`, `badge.tsx` |

### Verification
- `npm run ts` — passes
- `npm run build` — passes
- `npm run dev` — starts clean; `GET /` returns 200
- No unit test runner in `package.json` yet (noted in `PROGRESS.txt`)

### Progress log
Full details are in `PROGRESS.txt`.

You can browse:
- **Search:** http://localhost:3000 — sticky filters, responsive vehicle grid
- **Review:** pick a vehicle → add dates via filters → Book now — sticky price summary + add-ons

Discount badges and availability filtering are wired for Parts 4 and 3 respectively. Ready to move on to **Part 2 (PostgreSQL persistence)** when you are.

---

**User**

update the PRD and UI/UX to reflect the style of https://www.sixt.com/  instead of TURO

---

**Cursor**

Researching Sixt's design language and reviewing our current UI/PRD to align styling and documentation.


Updating the design system to Sixt's premium corporate rental aesthetic—black header, orange CTAs, hero booking widget—and applying changes across PRD and UI components.


Fixing FilterBar: removing the hacky `require()` and moving the hero into its own component.


Switching to CSS `@import` for Inter to avoid the Turbopack font build issue.


---

**User**

extract the colors, typography and logo of https://www.kaizenlabs.co/ and replace the SIXT colors

---

**Cursor**

Extracting Kaizen Labs brand tokens from their site and the provided assets, then replacing SIXT styling across the app.


Applying Kaizen Labs brand tokens: dark green `#00231C`, lime accent `#C3F731`, white header, Inter typography, and the mountain-peak K logo.


Brand tokens from [Kaizen Labs](https://www.kaizenlabs.co/) are now applied across the app, replacing the SIXT orange/black system.

### Extracted brand tokens

| Element | Value | Applied to |
|--------|-------|------------|
| **Primary green** | `#00231C` | CTAs, hero, footer, badges, focus rings (`--primary`, `--hero`) |
| **Accent lime** | `#C3F731` | Logo K-stroke, hero eyebrow, trust icon badges (`--brand-lime`) |
| **Header** | White + black text | Sticky nav (matches Kaizen Labs site header) |
| **Typography** | Inter (400–700) | Body and headings via Google Fonts |
| **Buttons** | Pill-shaped | `.kaizen-cta` → `rounded-full font-semibold` |

### Logo
New `KaizenLogo` component (`app/components/shared/KaizenLogo.tsx`):
- Rounded-square mark with mountain-peak **K** + lime accent
- **Light** variant — dark mark on white header
- **Dark** variant — white mark on green footer

### UI updates
- **AppShell** — white header with logo + pill “Get started”; green footer
- **SearchHero / TrustBadges** — green hero, lime accents (no orange)
- **FilterBar / VehicleCard / PriceSummary** — green pill CTAs
- **Cards** — softer `rounded-xl` corners (less SIXT-sharp)

### Docs updated
- `PRD.md` — §1.1/1.2 now reference Kaizen Labs brand
- `design-system/kaizen-wheels/MASTER.md` — full token table
- `PROGRESS.txt` — reflects brand pivot

`npm run ts` passes. Refresh the dev server to see the new green/lime theme.

---

**User**

the logo should look like this mountain-peak, not the M being displayed

---

**Cursor**

Reviewing the current logo implementation and reference images to match the mountain-peak K mark.


Searching for the official Kaizen logo asset to trace the correct SVG paths.


Using the reference image as the source of truth and replacing the incorrect SVG paths.


Replacing the incorrect M/chevron SVG with the official mountain-peak mark from your reference image.


Keeping the reference PNG as the source of truth and removing the approximate SVG.


The logo was wrong because the SVG drew a letterform with a lime chevron (which read as an **M**), not the Kaizen mountain-peak **K**.

### Fix
- Added the official mark at `public/kaizen-mark.png` (from your reference)
- Updated `KaizenLogo` to render that asset instead of inline SVG paths
- Removed the incorrect lime chevron / M-style geometry

The mark is now always the **dark green squircle with the white mountain-peak K** (including the green shadow on the main peak’s right face). The `variant` prop only affects wordmark text color on light vs dark backgrounds.

Refresh the app to see the updated header and footer logo. If you want a scalable SVG traced from the PNG later, we can add that as a follow-up.

---

**User**

revise the header to float from the top like sixt.com as you scroll down on the webpage

---

**Cursor**

Reviewing the layout structure to implement a SIXT-style sticky floating header on scroll.


Implementing a SIXT-style sticky header: nav plus booking bar that stays fixed at the top while scrolling.


The header now behaves like SIXT: the nav and booking bar stay pinned at the top while you scroll.

### What changed

**New `StickySiteHeader`** (`app/components/shared/StickySiteHeader.tsx`)
- `position: sticky; top: 0` keeps the full header fixed at the top
- Nav row + white rounded booking card sit in one sticky block
- On scroll (`scrollY > 12px`): stronger shadow and ring so it reads as floating above content
- Backdrop blur on the search strip for a glass effect over the fleet grid

**Layout restructure**
- Booking widget moved **out of the hero** and into the sticky header via `stickySearchSlot`
- Hero now only has headline + trust badges (green section scrolls away)
- Fleet grid scrolls underneath the pinned search bar

**Flow when scrolling**
1. Top: logo nav + booking card (always visible)
2. Hero headline scrolls away
3. Fleet results continue under the floating search bar

Refresh and scroll the home page — the booking controls should stay accessible at the top like SIXT.

---

**User**

<system_notification>
The following task has finished. If you were already aware, ignore this notification and do not restate prior responses.

<task>
kind: shell
status: success
task_id: 440784
title: Extract first SVG from Kaizen homepage
output_path: C:\Users\axeld\.cursor\projects\d-Users-axeld-Kaizen-takehome-kaizen-wheels-takehome-ad\terminals\440784.txt
</task>
</system_notification>
<user_query>Briefly inform the user about the task result and perform any follow-up actions (if needed). If there's no follow-ups needed, don't explicitly say that.</user_query>

---

**Cursor**

That background scrape of [kaizenlabs.co](https://www.kaizenlabs.co/) for an inline SVG **timed out** after ~5 minutes, so it didn’t return usable logo markup.

No follow-up is needed on that path — the logo is already handled via your reference image at `public/kaizen-mark.png`, which `KaizenLogo` uses directly. If you want a scalable SVG later, we can trace it from that asset rather than scraping the site.

---

**User**

the booking menu option should be visible like this menu, with pickup date and return date and show cars button among other options

---

**Cursor**

Redesigning the booking bar to match the SIXT three-row layout while keeping Kaizen branding. Reviewing the current FilterBar implementation.


Rewriting the booking bar into a SIXT-style three-row layout with Kaizen colors: service tabs, location + split date/time fields, and a prominent Show cars button.


The sticky booking bar now follows the SIXT three-row layout, using Kaizen colors (forest green CTAs, not orange).

### Layout (always visible in the sticky header)

**Row 1 — Service tabs**
- Cars (active), Trucks, Subscription, Airport transfer (inactive placeholders)
- “View / edit my booking” link on the right

**Row 2 — Primary search**
- **Pickup & return** — location search with “+ Different return location” toggle
- **Pickup date** — split date + time fields (calendar icon)
- **Return date** — split date + time fields
- **Show cars** — green pill button on the right

**Row 3 — Secondary filters**
- **Driver’s age** dropdown (21+ … 35+)
- **Apply corporate rate** link
- **More filters** expands class, make, passengers, and price range

On mobile, the same form opens in a bottom sheet via the **Book** button. Refresh the page to see the full menu pinned at the top while you scroll.

---

**User**

remove the white background from behind the show car menu, align the pickup and return with pickup date and return date, remove the clear all button to shorten the height of the menu

---

**Cursor**

Updating `DateTimeField` to match the location column's label spacing for consistent alignment, and removing the unused import.


Here’s what changed:

**1. Removed the white card background** (`StickySiteHeader.tsx`)  
The search slot no longer sits inside the bordered `bg-card` wrapper with shadow. It renders directly in the header so it blends with the nav instead of looking like a separate white panel.

**2. Aligned pickup/return with date fields** (`FilterBar.tsx`)  
The “+ Different return location” link moved up into the label row (next to “Pickup & return”) so it no longer pushes the location input down. All three columns use the same label spacing (`mb-1.5`) and `h-12` inputs, with `xl:items-end` keeping the row aligned.

**3. Removed “Clear all”**  
The bottom “Clear all” button and its reset handler are gone, which shortens the menu. Spacing was tightened slightly (`space-y-3` instead of `space-y-4`).

TypeScript check passes. Refresh the page to see the updated booking bar in the sticky header.

---

**User**

update PROGRESS.txt with current state of phase 1

---

**Cursor**

Updated `PROGRESS.txt` to reflect the current Part 1 state. Highlights:

- **Design system** — UI-UX-Pro-Max skill + `MASTER.md` documented
- **Layout evolution** — sticky `StickySiteHeader` with inline booking bar (no white card); `SearchHero` is headline + trust badges only
- **FilterBar** — full SIXT-style widget details, recent alignment/height tweaks, mobile sheet, URL param sync
- **Domain helpers** — `search-params`, `filters`, `quote`, `addons` listed
- **Known limitations** — what’s intentionally deferred to Parts 2–5 (location UI-only, in-memory data, static add-ons, display-only discounts)

Part 1 remains marked **COMPLETE** with `npm run ts` passing. Parts 2–5 unchanged as pending.

---

**User**

review @PROGRESS.txt for what was done with part 1 and execute part 2 from the PRD@PRD.md 

---

**Cursor**

I'll review Part 1 progress and read the PRD's Part 2 requirements before implementing.


Part 1 is complete per PROGRESS.txt. Implementing Part 2: Postgres, Drizzle schema, migrations, seed, and repository layer.


---

**User**

finish the TODO list

---

**Cursor**

Checking what's already in place, then finishing the remaining Part 2 work.


Creating repositories, seed script, and refactoring components for async DB access.


SearchPage can't import a server component while marked `"use client"`. Fixing that and updating config files.


Docker isn't running locally. Generating migrations and running TypeScript checks.


Part 2 is complete. Here's what was implemented:

### Part 2 — Persistence

**Infrastructure**
- `docker-compose.yml` — Postgres 16
- `drizzle.config.ts` + generated migration `drizzle/0000_narrow_silk_fever.sql`
- `.env.example` / `.env` with `DATABASE_URL`
- npm scripts: `db:generate`, `db:migrate`, `db:seed`, `db:setup`

**Schema** (`app/server/db/schema.ts`)
- `vehicles`, `reservations`, `addons` tables with enums, indexes, and integer cents

**Data layer**
- `app/server/repositories/` — vehicles, reservations, addons + mappers
- `app/server/data_helpers.ts` — async wrappers over repos
- `app/server/api.ts` — async Postgres-backed API
- `app/server/data.ts` — types only (in-memory arrays removed)
- `scripts/seed.ts` — 12 vehicles, 9 reservations, 5 add-ons from `app/server/seed/fixtures.ts`

**UI integration**
- `VehicleListLoader` (server) + `VehicleListClient` (client filters/quotes)
- `ReviewPage` — server-fetched vehicle/quote; `ReviewWithDatesClient` for add-on interactivity
- `app/lib/pricing.ts` — shared rental price math

**Docs**
- `README.md` — full local setup guide
- `PROGRESS.txt` — Part 2 marked complete

### Verification
- `npm run ts` — passes
- `npm run build` — passes
- `npm run db:setup` — **not run** (Docker Desktop wasn't running on this machine)

### To run locally

```bash
docker compose up -d
npm run db:setup
npm run dev
```

Vehicle IDs are now stable UUIDs (e.g. `a1000001-0000-4000-8000-000000000001` for the Corolla) instead of `"1"`, `"2"`, etc.

**Still deferred to later parts:** availability filtering (Part 3), discount engine (Part 4), DB-backed add-ons on checkout (Part 5).

---

**User**

<system_notification>
The following task has finished. If you were already aware, ignore this notification and do not restate prior responses.

<task>
kind: shell
status: aborted
task_id: 848159
title: Start dev server to verify no runtime errors
output_path: C:\Users\axeld\.cursor\projects\d-Users-axeld-Kaizen-takehome-kaizen-wheels-takehome-ad\terminals\848159.txt
</task>
</system_notification>
<user_query>Briefly inform the user about the task result and perform any follow-up actions (if needed). If there's no follow-ups needed, don't explicitly say that.</user_query>

---

**Cursor**

The dev server started but failed on vehicle queries because Postgres wasn't reachable. Starting the database and running migrations.


The dev server verification was **aborted** before it finished. While it was running, the app hit **`ECONNREFUSED`** errors because Postgres wasn’t up yet — the fleet query failed when loading vehicles.

I ran the follow-up setup:

1. **`docker compose up -d`** — Postgres is running  
2. **`npm run db:setup`** — migrations applied, seed data loaded (12 vehicles, 9 reservations, 5 add-ons)  
3. **Verified** the existing dev server on `http://localhost:3000` returns **200** and renders fleet data (e.g. Toyota Corolla)

The app should be working now on the dev server you already have open. If you restart it later, use `docker compose up -d` and `npm run db:setup` first.

---

**User**

the rates should be per day not per hours

---

**Cursor**

Finding where hourly rates are stored, calculated, and displayed so we can switch to per-day pricing.


Switching pricing to per-day: updating calculation logic and all rate displays.


Rates are now per day across the app.

**Display**
- Vehicle cards show **$/day** instead of **$/hr** (e.g. Mercedes C-Class → **$220/day**)
- Price filter label updated to **Daily rate**
- Checkout summary shows **Base rental (N days)** instead of hours

**Pricing logic**
- Total rental = **daily rate × number of days** (minimum 1 day, partial days round up — same rule as add-ons)
- A 2-day booking at $220/day = **$440 total**, not hourly math

The database column is still named `hourly_rate_cents` internally, but values are treated as daily rates ($45, $220, etc.). No migration or re-seed needed.

---

**User**

@PROGRESS.txt @PRD.md execute part 3 in the PRD based off what was recorded in progress.txt from part 2

---

**Cursor**

Reviewing Part 3 requirements and the current codebase to implement availability-aware search and server-side filters.


Part 3 is implemented. Here's what changed:

### Server-side search (`repositories/vehicles.ts`)
- **Availability** — when dates are set, uses `NOT EXISTS` overlap SQL (`start < requested_end AND end > requested_start`)
- **Filters in Postgres** — class, daily price range, min passengers, make (`ILIKE`)
- **`isVehicleAvailable()`** — `getQuote` returns `CONFLICT` if the car is already booked

### Data flow
- `API.searchVehicles(filters)` accepts `SearchFilters` from URL params
- `page.tsx` → `SearchPage` → `VehicleListLoader` reads `searchParams` and queries Postgres
- Suspense key on the filter string re-fetches when you click **Show cars**
- Removed client-side `app/lib/filters.ts` — filtering is server-only

### UX
- **No dates** — full fleet shown, lime prompt to pick dates; cards show **Details** (not Select)
- **Dates set** — unavailable cars hidden; count shows **"X vehicles available"**
- **Empty states** — different copy for no availability vs no filter matches

### Filter rationale (per PRD)
| Filter | Why |
|--------|-----|
| Dates + availability | Hard constraint — booked cars never appear |
| Class | Body type is the top narrowing filter after dates |
| Daily price | Budget anchoring before picking a car |
| Passengers | Hard fit constraint for groups/families |
| Make | Brand familiarity entry point |

`PROGRESS.txt` updated — Part 3 marked complete. `npm run ts` and `npm run build` pass.

**Try it:** pick today → +2 days and click **Show cars** — the Corolla and X5 should disappear (seeded reservations block them).

---

**User**

execute part 4 in PRD @PRD.md based off progress.txt @PROGRESS.txt 

---

**Cursor**

Reviewing Part 4 requirements and the current pricing/quote code.


