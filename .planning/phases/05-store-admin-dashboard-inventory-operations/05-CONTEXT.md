# Phase 5: Store Admin Dashboard & Inventory Operations - Context

**Gathered:** 2026-08-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Build Store Owner X's administrative dashboard (`/admin`), product catalog CRUD & price/stock manager (`/admin/products`), stock override modal, `InventoryLog` audit trail, incoming order processing board (`/admin/orders`), 1-tap Accept/Reject workflow, order status controls (`PENDING` → `ACCEPTED` → `PREPARING` → `ASSIGNED` → `OUT_FOR_DELIVERY` → `DELIVERED`), rider assignment, delivery staff onboarding roster (`/admin/delivery-staff`), and automated stock reconciliation.

</domain>

<decisions>
## Implementation Decisions

### Admin Catalog & Stock Operations (`/admin/products`)
- **D-01:** Quick inline stock stepper buttons (`+` / `-`) directly on product list rows + product edit modal for price, unit display, description, image URL, and active status toggle.
- **D-02:** Product creation modal for adding new grocery items to Store X catalog.
- **D-03:** Automatic Inventory Audit Log: Create `InventoryLog` entries on every stock adjustment (recording `productId`, `previousStock`, `newStock`, `changeQuantity`, `reason`, `updatedById`).

### Admin Incoming Orders Board (`/admin/orders`)
- **D-04:** 1-Tap `Accept` (green) and `Reject` (red) buttons on incoming order cards with a rejection reason modal (e.g. *"Item out of stock"*).
- **D-05:** Status Action Buttons on order cards: `Start Packing`, `Assign Rider`, `Mark Out for Delivery`, `Mark Delivered` to advance order delivery status in 1 tap.
- **D-[06]:** Live incoming order alerts with auto-refreshing order list.

### Rider Assignment & Stock Reconciliation (`/admin/delivery-staff`)
- **D-07:** Quick rider dropdown selector on order cards listing Store X's registered riders (Ramesh Kumar, Suresh Singh).
- **D-08:** Delivery Staff Roster page (`/admin/delivery-staff`) allowing Store Owner X to onboard new rider staff accounts with `Role.DELIVERY_PARTNER`.
- **D-09:** Automated Stock Reconciliation: Automatically decrement `Product.stock` (`Product.stock -= quantity`) and create `InventoryLog` entry (`reason: "ORDER_FULFILLED"`) upon order acceptance/fulfillment.

### Agent's Discretion
- Admin dashboard summary widget styling (total revenue, active orders count, low stock warnings count).
- Confirmation modal text for product deletion or deactivation.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project & Scope
- `.planning/PROJECT.md` — Core product vision, Store Owner X operator model, and constraints
- `.planning/REQUIREMENTS.md` §ADMIN — ADMIN-01, ADMIN-02, ADMIN-03, ADMIN-04 requirement specifications
- `.planning/ROADMAP.md` §Phase 5 — Phase 5 goals, dependencies, and success criteria

### Prior Phase Foundation
- `.planning/phases/01-foundation-data-architecture/01-CONTEXT.md` — Protected `/admin` middleware & schema models (`Product`, `InventoryLog`, `Order`, `Role.DELIVERY_PARTNER`)
- `.planning/phases/04-order-lifecycle-live-customer-tracking/04-CONTEXT.md` — Order status lifecycle & tracking APIs

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/middleware.ts` — Server middleware protecting `/admin` routes for `STORE_ADMIN` role.
- `src/lib/prisma.ts` — Server Prisma client singleton for database queries.

### Established Patterns
- Server Actions / Route Handlers with Prisma transactions for data mutations.
- Tailwind CSS admin theme (purple accent branding for Store Admin X).

### Integration Points
- `src/app/admin/page.tsx` — Store Owner X dashboard hub.
- `src/app/admin/products/page.tsx` — Product catalog & stock manager.
- `src/app/admin/orders/page.tsx` — Incoming order processing board.
- `src/app/admin/delivery-staff/page.tsx` — Rider staff onboarding roster.
- `src/app/api/admin/products/route.ts` — Admin product CRUD API.
- `src/app/api/admin/orders/[id]/route.ts` — Admin order status & rider assignment API.

</code_context>

<specifics>
## Specific Ideas

- Floating notification badge on Admin navbar showing count of un-accepted pending orders.
- Quick stock adjustment buttons (+5, -1, +10) in stock edit modal.

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed strictly within Phase 5 scope.

</deferred>

---

*Phase: 05-Store Admin Dashboard & Inventory Operations*
*Context gathered: 2026-08-15*
