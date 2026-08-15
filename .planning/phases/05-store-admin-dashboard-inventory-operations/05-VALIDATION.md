---
phase: 05
slug: store-admin-dashboard-inventory-operations
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-08-15
---

# Phase 05 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | TypeScript compiler (`tsc`) & Next.js Linter (`eslint`) |
| **Config file** | `tsconfig.json`, `eslint.config.mjs` |
| **Quick run command** | `npm run lint && npx tsc --noEmit` |
| **Full suite command** | `npm run lint && npx tsc --noEmit` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run lint && npx tsc --noEmit`
- **After every plan wave:** Run `npm run lint && npx tsc --noEmit`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | ADMIN-01 | T-05-01 | Product CRUD API validates store authorization | automated | `npx tsc --noEmit` | ❌ W0 | ⬜ pending |
| 05-01-02 | 01 | 1 | ADMIN-02 | T-05-02 | Stock adjustments create InventoryLog audit entry | automated | `npx tsc --noEmit` | ❌ W0 | ⬜ pending |
| 05-01-03 | 01 | 1 | ADMIN-01, ADMIN-02 | N/A | Product catalog UI renders stock steppers and edit modal | automated | `npm run lint` | ❌ W0 | ⬜ pending |
| 05-02-01 | 02 | 2 | ADMIN-03 | T-05-03 | Order status update API verifies status progression | automated | `npx tsc --noEmit` | ❌ W0 | ⬜ pending |
| 05-02-02 | 02 | 2 | ADMIN-04 | N/A | Delivery staff API & roster UI list and create riders | automated | `npm run lint` | ❌ W0 | ⬜ pending |
| 05-02-03 | 02 | 2 | ADMIN-03, ADMIN-04 | N/A | Order processing board renders 1-tap accept/reject & status buttons | automated | `npm run lint` | ❌ W0 | ⬜ pending |
| 05-03-01 | 03 | 3 | ADMIN-01, ADMIN-02, ADMIN-03 | N/A | Admin Dashboard hub renders revenue, pending orders & low stock widgets | automated | `npm run lint` | ❌ W0 | ⬜ pending |

---

## Wave 0 Requirements

- [ ] `src/app/api/admin/products/route.ts` — Admin product CRUD & stock API
- [ ] `src/app/api/admin/products/[id]/route.ts` — Product detail & stock override API
- [ ] `src/app/admin/products/page.tsx` — Product catalog & stock manager
- [ ] `src/app/api/admin/orders/[id]/route.ts` — Order approval & rider assignment API
- [ ] `src/app/admin/orders/page.tsx` — Incoming order processing board
- [ ] `src/app/admin/delivery-staff/page.tsx` — Delivery staff roster
- [ ] `src/app/admin/page.tsx` — Store Owner X dashboard hub

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Quick inline stock stepper adjustment | ADMIN-02 | Visual stock update | Tap `+` stepper button on product row; verify stock count updates instantly and `InventoryLog` is recorded |
| 1-Tap order approval & status progression | ADMIN-03 | Visual order board update | Tap `'Accept Order'` button on `/admin/orders`; verify order status changes to `ACCEPTED` and stock decrements |
| Delivery partner assignment | ADMIN-04 | Select dropdown | Select Ramesh Kumar from rider dropdown; verify order status changes to `ASSIGNED` |

---

## Validation Sign-Off

- [x] All tasks have automated verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-08-15
