# Phase 1: Foundation & Data Architecture - Context

**Gathered:** 2026-08-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish the core database schema (Prisma ORM + Supabase PostgreSQL) with multi-store structural abstraction (`store_id`), Supabase Auth with Role-Based Access Control (`CUSTOMER`, `STORE_ADMIN`, `DELIVERY_PARTNER`), server middleware route protection (`/admin`, `/delivery`), mobile app layout shell, and an automated Store X seed script.

</domain>

<decisions>
## Implementation Decisions

### Authentication & Access Control
- **D-01:** Supabase Email/Password authentication for all 3 roles (`CUSTOMER`, `STORE_ADMIN`, `DELIVERY_PARTNER`) for frictionless, zero-cost Phase 1 testing.
- **D-02:** Next.js Server Middleware (`middleware.ts`) inspecting JWT role claims to protect `/admin` and `/delivery` routes before rendering.
- **D-03:** Store Admin X creates delivery partner accounts directly from the `/admin/delivery-staff` dashboard.
- **D-04:** Structured customer address schema containing Building/Colony Name, Flat/Room Number, Nearby Landmark, and Contact Phone tailored for VIT Bhopal off-campus residential areas.

### Database Schema & Multi-Store Design
- **D-05:** Explicit `store_id` foreign keys on `Category`, `Product`, `Order`, and `InventoryLog` Prisma models to support multi-store expansion in future phases while defaulting Phase 1 queries to Store X.
- **D-06:** Structured Unit Model: `UnitType` enum (`KG`, `GRAM`, `PIECE`, `PACK`, `LITER`, `ML`), `unitQuantity` numeric value, and formatted `unitDisplay` string.
- **D-07:** Inventory Audit Logging: Stock counter integer on `Product` model paired with a dedicated `InventoryLog` audit table recording all manual stock edits and order fulfillment decrements.
- **D-08:** `OrderStatus` enum containing full lifecycle states: `PENDING`, `ACCEPTED`, `PREPARING`, `ASSIGNED`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`, `REJECTED`.

### App Shell & Seed Data
- **D-09:** Mobile-first app shell layout featuring a sticky top brand header and a bottom tab navigation bar (`Home`, `Categories`, `Cart`, `Orders`, `Profile`).
- **D-10:** Student-focused seed categories: `Fresh Produce`, `Dairy & Eggs`, `Snacks & Munchies`, `Instant Noodles & Ready Meals`, `Beverages & Drinks`, `Hostel Essentials`.
- **D-11:** Automated `prisma/seed.ts` script populating Store X, 6 default categories, 15+ student grocery items with realistic prices/stock/images, 1 Store Admin user, and 2 Delivery Partner users.
- **D-12:** Centralized branding configuration file (`src/config/app.config.ts`) exporting `appConfig.appName = 'x-grocery'` to prevent hardcoding brand text in components.

### Agent's Discretion
- Database index optimization choices on `store_id`, `category_id`, and `order_status`.
- Exact color scheme tokens in `globals.css` adhering to modern dark/light mode responsive standards.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project & Scope
- `.planning/PROJECT.md` — Core product vision, target audience, operator model, and key constraints
- `.planning/REQUIREMENTS.md` §AUTH & §DB — AUTH-01, AUTH-02, DB-01, DB-02 requirements
- `.planning/ROADMAP.md` §Phase 1 — Phase 1 goals, dependencies, and success criteria

### Codebase & Technical Environment
- `.planning/codebase/STACK.md` — Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4
- `.planning/codebase/ARCHITECTURE.md` — System design and component abstractions
- `.planning/codebase/CONVENTIONS.md` — Coding standards and strict TypeScript rules

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/app/layout.tsx` — Root layout component configuring Google Geist fonts and HTML shell.
- `src/app/globals.css` — Global CSS file configured with Tailwind CSS v4 (`@import "tailwindcss";`).

### Established Patterns
- Path aliasing: `@/*` pointing to `./src/*` (`tsconfig.json`).
- Strict TypeScript configuration (`"strict": true` in `tsconfig.json`).

### Integration Points
- `src/middleware.ts` — Server middleware for Supabase Auth session & role validation.
- `src/lib/prisma.ts` — Prisma client singleton setup.
- `src/lib/supabase/` — Supabase client configuration for server and browser contexts.

</code_context>

<specifics>
## Specific Ideas

- Mobile-first responsive app shell with smooth tab navigation bar at the bottom.
- Role-based route protection ensuring non-admin users attempting to open `/admin` are redirected to `/login` or `/`.

</specifics>

<deferred>
## Deferred Ideas

- Phone SMS OTP authentication — deferred to future phase to avoid SMS gateway setup friction during Phase 1 testing.

</deferred>

---

*Phase: 01-Foundation & Data Architecture*
*Context gathered: 2026-08-15*
