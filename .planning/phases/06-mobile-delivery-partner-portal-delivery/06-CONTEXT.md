# Phase 6: Mobile Delivery Partner Portal (/delivery) - Context

**Gathered:** 2026-08-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Build mobile-first portal (`/delivery`) for Store X delivery staff riders (Ramesh Kumar, Suresh Singh) to view assigned active deliveries, inspect customer off-campus flat/room addresses, call student customers (`tel:${phone}`), verify doorstep payment collection (COD / UPI QR scan), and advance order status (`OUT_FOR_DELIVERY` → `DELIVERED`).

</domain>

<decisions>
## Implementation Decisions

### Mobile Rider Dashboard Layout (`/delivery`)
- **D-01:** Dual Tabbed View on `/delivery`:
  - `Active Deliveries` tab showing assigned & in-transit orders requiring delivery action.
  - `Completed Today` tab showing delivered order receipts for the shift.
- **D-02:** Quick Rider Profile Selector Bar allowing seamless switching between registered riders (Ramesh Kumar / Suresh Singh).

### Delivery Task Card Density
- **D-03:** Complete Delivery Task Card displaying:
  - Order # & formatted time
  - Student Customer Name & Phone number with 1-tap `'Call Student 📞'` button (`tel:${phone}`)
  - Off-Campus Delivery Address (Flat/Room/Colony & landmark)
  - Item Checklist preview with quantities
  - Payment Collection Badge (`COD` Cash amount vs `UPI` QR code scan)

### Doorstep Delivery Execution & Status Workflow
- **D-04:** 2-Step Action Workflow:
  1. `'Start Delivery 🛵'` button: Advances order status from `ASSIGNED` → `OUT_FOR_DELIVERY`.
  2. `'Mark Delivered 🎉'` button: Triggers Doorstep Payment Verification Modal.
- **D-05:** Doorstep Payment Verification Modal: Displays prominent payment mode (`Cash to Collect: ₹199` vs `Scan Store X UPI QR: ₹199`) with a mandatory *"Payment received from student"* confirmation checkbox before updating status to `DELIVERED` and `paymentStatus` to `COMPLETED`.

### Agent's Discretion
- Mobile card padding and touch-friendly button sizing.
- Quick navigation link back to customer app.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project & Scope
- `.planning/PROJECT.md` — Core product vision, Store X delivery operator model, and constraints
- `.planning/REQUIREMENTS.md` §DEL — DEL-01, DEL-02 requirement specifications
- `.planning/ROADMAP.md` §Phase 6 — Phase 6 goals, dependencies, and success criteria

### Prior Phase Foundation
- `.planning/phases/01-foundation-data-architecture/01-CONTEXT.md` — Protected `/delivery` middleware & `Role.DELIVERY_PARTNER`
- `.planning/phases/05-store-admin-dashboard-inventory-operations/05-CONTEXT.md` — Order status transitions & rider assignment

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/middleware.ts` — Server middleware protecting `/delivery` routes for `DELIVERY_PARTNER` role.
- `src/lib/prisma.ts` — Server Prisma client singleton for database queries.

### Established Patterns
- Mobile-first responsive touch layout optimized for single-handed smartphone use.
- Tailwind CSS status badges (`OUT_FOR_DELIVERY` purple/teal, `DELIVERED` emerald).

### Integration Points
- `src/app/delivery/page.tsx` — Mobile delivery partner portal page.
- `src/app/api/delivery/orders/route.ts` — Assigned orders API for active rider.
- `src/app/api/delivery/orders/[id]/route.ts` — Rider delivery status update & payment completion API.

</code_context>

<specifics>
## Specific Ideas

- Prominent green `'Call Student 📞'` action button for instant dialing on mobile.
- Big 1-tap doorstep completion button designed for quick tap at student's door.

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed strictly within Phase 6 scope.

</deferred>

---

*Phase: 06-Mobile Delivery Partner Portal (/delivery)*
*Context gathered: 2026-08-15*
