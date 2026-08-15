# x-grocery

## What This Is

`x-grocery` is a hyperlocal instant grocery delivery platform built for VIT Bhopal students living outside campus in nearby flats, rooms, and PGs. In Phase 1, the platform powers a single-store operation for local store owner "X", enabling students to order groceries for 10–15 minute local delivery handled by X's dedicated delivery team.

## Core Value

Frictionless 10–15 minute hyperlocal grocery ordering and realtime order tracking for off-campus VIT Bhopal students with reliable inventory consistency.

## Requirements

### Validated

- ✓ Next.js 16 App Router setup with Tailwind CSS v4, React 19, and TypeScript — existing foundation

### Active

- [ ] Customer: Browse grocery product catalog, search, and filter by categories
- [ ] Customer: View product details, prices, images, and live stock availability
- [ ] Customer: Cart management (add, update quantities, remove items)
- [ ] Customer: Delivery address input and selection (restricted to supported off-campus residential zones)
- [ ] Customer: Order checkout with Cash on Delivery (COD) and UPI on Delivery QR options
- [ ] Customer: Order history and live realtime order status tracking (Pending → Accepted → Preparing → Assigned → Out for Delivery → Delivered / Cancelled / Rejected)
- [ ] Store Admin (Store X): Product catalog management (add, edit, remove products, categories, pricing)
- [ ] Store Admin (Store X): Inventory management with manual stock adjustments and automatic stock reduction on order fulfillment
- [ ] Store Admin (Store X): Order dashboard to view incoming orders, accept/reject, update status, and assign to delivery partners
- [ ] Delivery Partner (`/delivery` web view): View assigned orders, customer delivery details, and update delivery status
- [ ] Architecture: Role-based authorization (Customer, Store Admin, Delivery Partner)
- [ ] Database & Backend: Supabase PostgreSQL with Prisma ORM, designed with `store_id` multi-store schema abstraction for future scalability

### Out of Scope

- Delivery inside VIT Bhopal campus — Phase 1 strictly serves off-campus residential locations
- Multi-store marketplace UI — Phase 1 operates exclusively with single store X
- Food / Restaurant delivery — deferred to future phase expansion
- Native iOS/Android apps — Phase 1 is a mobile-first responsive web app
- Online Payment Gateway integration (Razorpay/Cashfree) — Phase 1 uses COD & UPI on Delivery
- Independent gig worker fleet management — Delivery partners are managed directly by Store X

## Context

- **Target Audience:** VIT Bhopal students living outside campus as day scholars/boarders in nearby areas.
- **Operator:** Local grocery store owner ("X") providing products, inventory, order processing, and delivery staff.
- **Development Context:** Built entirely using AI agents (Antigravity/GSD) for a non-technical creator requiring clean, production-grade architecture.

## Constraints

- **Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Supabase PostgreSQL, Prisma ORM
- **UI/UX:** Mobile-first responsive web design optimized for smartphone usage
- **Branding:** Configurable branding (internal project name `x-grocery`; brand names must remain configurable)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Database Stack | Supabase PostgreSQL + Prisma for Realtime order tracking, built-in Auth, and clean relational schema | — Pending |
| Payment Method | Cash on Delivery + UPI on Delivery QR code for fast Phase 1 rollout without gateway delays | — Pending |
| Delivery Partner UI | Integrated mobile-optimized web route (`/delivery`) with role-based route protection | — Pending |
| Single Store Schema | Single store UI in Phase 1 with `store_id` database abstraction for multi-store future readiness | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-08-15 after initialization*
