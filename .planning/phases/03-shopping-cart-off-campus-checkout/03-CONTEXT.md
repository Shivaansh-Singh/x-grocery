# Phase 3: Shopping Cart & Off-Campus Checkout - Context

**Gathered:** 2026-08-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Implement persistent client-side shopping cart state (`localStorage` + React Context), a sticky bottom floating cart notification bar, off-campus VIT Bhopal delivery address selection with housing hub presets, off-campus boundary notice, and 1-page order checkout supporting Cash on Delivery (COD) & UPI on Delivery (QR Code).

</domain>

<decisions>
## Implementation Decisions

### Cart State & Drawer Experience
- **D-01:** Persistent Cart Context (`src/components/providers/CartProvider.tsx`) saving cart state to `localStorage` so items remain intact across sessions and page refreshes.
- **D-02:** Sticky Bottom Floating Cart Bar above the main navigation bar displaying `X Items • ₹Total` and a `'View Cart →'` button whenever cart has 1+ items.
- **D-03:** Strict Stock Cap: Disable the `+` stepper button when quantity reaches `product.stock` and display a toast alert (`"Maximum available stock reached"`).

### Off-Campus Address Selection & Boundary Verification
- **D-04:** Structured Off-Campus Delivery Address Form: Quick Hub Selector dropdown (`Royal City`, `Kotri Kalan`, `Main Gate Road`, `Ashta Road`) + structured fields (`Building / Colony Name`, `Flat / Room No`, `Landmark`, `Student Phone Number`).
- **D-05:** Prominent Off-Campus Service Banner on the address selector explicitly clarifying: *"Store X delivers strictly to off-campus flats, rooms & PGs in Kotri Kalan / Royal City area. Inside-campus hostel delivery is NOT supported in Phase 1."*

### Checkout Flow & Payment Method Selection
- **D-06:** Interactive Payment Method Radio Cards:
  1. `Cash on Delivery (COD)` — Pay cash to rider upon arrival
  2. `Pay via UPI on Delivery` — Scan QR Code at doorstep via GPay, PhonePe, Paytm, etc.
- **D-07:** Transparent Bill Breakdown: Item Subtotal + Delivery Fee (₹15 flat, FREE for order total ≥ ₹199) = Final Amount.

### Agent's Discretion
- Toast notification component style for stock limit warnings.
- Cart item removal animation or confirmation logic.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project & Scope
- `.planning/PROJECT.md` — Core product vision, target audience, operator model, and constraints
- `.planning/REQUIREMENTS.md` §CART — CART-01, CART-02, CART-03 requirement specifications
- `.planning/ROADMAP.md` §Phase 3 — Phase 3 goals, dependencies, and success criteria

### Prior Phase Foundation
- `.planning/phases/01-foundation-data-architecture/01-CONTEXT.md` — `CustomerAddress` and `Order` models, payment enums (`COD`, `UPI_ON_DELIVERY`)
- `.planning/phases/02-product-catalog-search-experience/02-CONTEXT.md` — Product card inline stepper integration

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/providers/AuthProvider.tsx` — Client auth context for logged-in student user.
- `src/components/layout/AppShell.tsx` — Mobile shell container.
- `src/lib/prisma.ts` — Server Prisma client singleton.

### Established Patterns
- Client Context Providers wrapped in `src/app/layout.tsx`.
- Toast / alert banners styled with Tailwind CSS badges and alert boxes.

### Integration Points
- `src/components/providers/CartProvider.tsx` — Cart state provider.
- `src/components/layout/BottomNav.tsx` — Adjusting padding for floating cart bar when active.
- `src/app/cart/page.tsx` — Dedicated shopping cart page.
- `src/app/checkout/page.tsx` — 1-page checkout flow.

</code_context>

<specifics>
## Specific Ideas

- Floating cart bar with animated slide-up entry when first item is added.
- Quick off-campus housing hub presets to speed up address entry for VIT Bhopal day scholars.

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed strictly within Phase 3 scope.

</deferred>

---

*Phase: 03-Shopping Cart & Off-Campus Checkout*
*Context gathered: 2026-08-15*
