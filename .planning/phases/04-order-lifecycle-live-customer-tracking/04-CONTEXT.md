# Phase 4: Order Lifecycle & Live Customer Tracking - Context

**Gathered:** 2026-08-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Implement order creation and retrieval backend APIs (`POST /api/orders`, `GET /api/orders`, `GET /api/orders/[id]`), item price snapshot preservation in `OrderItem`, tabbed Order History page (`/orders`), and live 6-step status tracking timeline (`/orders/[id]`) with 3-5s auto-polling, estimated delivery countdown, and rider contact card.

</domain>

<decisions>
## Implementation Decisions

### Order Persistence API
- **D-01:** Unique Prefix Order Code format (e.g. `XG-849201`) generated with `XG-` prefix + 6-digit random code, created initially in `PENDING` status.
- **D-02:** Item Snapshot Preservation: Store exact unit price, quantity, and product name snapshot in `OrderItem` model at purchase time to protect order records against future catalog price edits.

### Order History Page (`/orders`)
- **D-03:** Dual Tabbed View on `/orders`:
  - `Active Orders` tab displaying current orders in progress with live status pills and `'Track Live →'` buttons.
  - `Past Orders` tab showing completed or cancelled historical order receipts.
- **D-04:** Detailed Order Cards: Display Order #, Date/Time, Item List preview, Total Amount in ₹, Payment Method Badge (`COD` / `UPI`), Status Pill, and action button.

### Live Tracking Timeline UI (`/orders/[id]`)
- **D-05:** 6-Step Vertical Progress Timeline:
  1. `Order Placed` (Sent to Store X)
  2. `Order Accepted` (Store X approved)
  3. `Preparing Items` (Store X packing groceries)
  4. `Rider Assigned` (Assigned to Store X rider)
  5. `Out for Delivery` (Heading to off-campus flat/room)
  6. `Delivered` (Reached doorstep)
- **D-06:** Realtime Sync via 3-5 second auto-polling interval + manual `'Refresh Status'` button to keep tracking updated in real-time.
- **D-07:** Rider Contact Card: Displays assigned Rider Name (e.g. Ramesh Kumar), Store X Delivery Staff badge, and direct `'Call Delivery Rider'` button when order is `ASSIGNED` or `OUT_FOR_DELIVERY`.

### Agent's Discretion
- Timeline step icons and progress bar line styling.
- Estimated arrival time calculation text (e.g. *"Estimated arrival in 10-15 Mins"*).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project & Scope
- `.planning/PROJECT.md` — Core product vision, target audience, operator model, and constraints
- `.planning/REQUIREMENTS.md` §ORD — ORD-01, ORD-02, ORD-03 requirement specifications
- `.planning/ROADMAP.md` §Phase 4 — Phase 4 goals, dependencies, and success criteria

### Prior Phase Foundation
- `.planning/phases/01-foundation-data-architecture/01-CONTEXT.md` — `Order` and `OrderItem` models, `OrderStatus` and `PaymentMethod` enums
- `.planning/phases/03-shopping-cart-off-campus-checkout/03-CONTEXT.md` — Checkout submission flow and address format

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/providers/CartProvider.tsx` — Clearing cart upon order placement.
- `src/lib/prisma.ts` — Server Prisma client for order database transactions.

### Established Patterns
- Auto-polling inside `useEffect` with cleanup on unmount for realtime status updates.
- Tailwind CSS status badges (`PENDING` amber, `ACCEPTED` blue, `OUT_FOR_DELIVERY` purple, `DELIVERED` emerald).

### Integration Points
- `src/app/api/orders/route.ts` — Order creation and list API endpoint.
- `src/app/api/orders/[id]/route.ts` — Individual order detail and status API endpoint.
- `src/app/orders/page.tsx` — Order History view.
- `src/app/orders/[id]/page.tsx` — Live Order Tracking view.

</code_context>

<specifics>
## Specific Ideas

- Visual 6-step vertical timeline with pulsing green ring for current active stage.
- Direct phone call link (`tel:${riderPhone}`) for quick rider contact when out for delivery.

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed strictly within Phase 4 scope.

</deferred>

---

*Phase: 04-Order Lifecycle & Live Customer Tracking*
*Context gathered: 2026-08-15*
