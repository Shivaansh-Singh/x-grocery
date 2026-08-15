# Walking Skeleton — x-grocery

**Phase:** 1
**Generated:** 2026-08-15

## Capability Proven End-to-End

A user can authenticate via email/password, have their assigned role (`CUSTOMER`, `STORE_ADMIN`, `DELIVERY_PARTNER`) enforced server-side by Next.js middleware, browse Store X's seeded categories in a mobile app shell, and query Store X's database models via Prisma ORM.

## Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Next.js 16 App Router (React 19, TypeScript) | High-performance Server Components with SSR cookie management |
| Data Layer | Supabase PostgreSQL + Prisma ORM | Relational schema with `store_id` multi-store abstraction and audit logging |
| Auth & RBAC | Supabase Auth + Next.js Server Middleware (`middleware.ts`) | Server-side route protection for `/admin` and `/delivery` before rendering |
| Branding & Shell | Centralized Config (`src/config/app.config.ts`) + Mobile App Shell | Configurable brand name (`x-grocery`) with mobile tab navigation frame |
| Seed Pipeline | Executable `prisma/seed.ts` via `tsx` | Automated initial population of Store X, categories, student groceries, and role accounts |

## Stack Touched in Phase 1

- [x] Project scaffold (Next.js 16, TypeScript, Tailwind CSS v4, ESLint)
- [x] Routing — `/`, `/admin`, `/delivery`, `/login` with middleware protection
- [x] Database — Prisma schema models for User, Store, Category, Product, Order, InventoryLog
- [x] Seed Execution — `prisma/seed.ts` populating Store X, student categories, 15+ products, Admin X, and delivery staff
- [x] UI — Mobile app shell layout with top header bar and bottom navigation tabs

## Out of Scope (Deferred to Later Slices)

- Customer product search & filtering UI components (Phase 2)
- Cart state & off-campus address checkout form (Phase 3)
- Realtime order placement & status tracking UI (Phase 4)
- Admin order dashboard & stock editor UI (Phase 5)
- Mobile delivery staff action portal (`/delivery`) (Phase 6)

## Subsequent Slice Plan

- Phase 2: Product Catalog & Search Experience (Category browsing, search bar, stock badges)
- Phase 3: Shopping Cart & Off-Campus Checkout (Cart drawer, VIT Bhopal off-campus address input, COD & UPI checkout)
- Phase 4: Order Lifecycle & Live Customer Tracking (Order creation, history, live status timeline)
- Phase 5: Store Admin Dashboard & Inventory Operations (Catalog CRUD, stock management, order accept/reject, staff assignment)
- Phase 6: Mobile Delivery Partner Portal (`/delivery`) (Assigned delivery view & status updates)
