---
phase: 03-shopping-cart-off-campus-checkout
plan: 02
subsystem: address-and-checkout
tags: [nextjs, addresses, checkout, cod, upi, vitbhopal]

requires:
  - phase: 03-shopping-cart-off-campus-checkout
    provides: CartProvider & /cart page
provides:
  - POST /api/addresses route handler creating/fetching customer delivery addresses
  - OffCampusAddressForm component with housing hub presets (Royal City, Kotri Kalan, Main Gate) and off-campus service warning banner
  - PaymentMethodSelector interactive radio cards (COD & UPI on Delivery)
  - 1-page Checkout view (/cart/checkout)
affects: [04-order-lifecycle-live-customer-tracking]

tech-stack:
  added: []
  patterns: [Off-campus housing hub presets, Doorstep UPI payment selection, Service boundary alert banner]

key-files:
  created:
    - src/app/api/addresses/route.ts
    - src/components/checkout/OffCampusAddressForm.tsx
    - src/components/checkout/PaymentMethodSelector.tsx
    - src/app/cart/checkout/page.tsx
  modified: []

key-decisions:
  - "Off-campus housing hub selector dropdown (Royal City, Kotri Kalan, Main Gate Road, Ashta Road) for rapid student address entry"
  - "Prominent warning banner on address selector explicitly clarifying off-campus delivery scope and excluding inside-campus hostels in Phase 1"
  - "Doorstep UPI payment selection (scan QR code on delivery) alongside Cash on Delivery (COD)"

requirements-completed: [CART-02, CART-03]

duration: 15min
completed: 2026-08-15
---

# Plan 03-02 Summary

**Address API (`POST /api/addresses`), `OffCampusAddressForm` with hub presets & service banner, `PaymentMethodSelector` (COD & UPI), and 1-page Checkout (`/cart/checkout`)**

## Performance
- **Duration:** 15 min
- **Started:** 2026-08-15T20:58:00Z
- **Completed:** 2026-08-15T21:13:00Z
- **Tasks:** 4
- **Files modified:** 4

## Accomplishments
- Created `/api/addresses` route handler saving and fetching customer delivery addresses in PostgreSQL.
- Created `OffCampusAddressForm` with housing hub presets (`Royal City`, `Kotri Kalan`, `Main Gate`), structured fields, and off-campus service scope alert banner.
- Created `PaymentMethodSelector` interactive radio cards for `Cash on Delivery (COD)` and `Pay via UPI on Delivery (Scan QR Code at Doorstep)`.
- Assembled 1-page checkout view (`/cart/checkout`) combining address selection, payment choice, bill summary, and order submission.

---
*Phase: 03-shopping-cart-off-campus-checkout*
*Completed: 2026-08-15*
