---
phase: 03
slug: shopping-cart-off-campus-checkout
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-08-15
---

# Phase 03 — Validation Strategy

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
| 03-01-01 | 01 | 1 | CART-01 | T-03-01 | Cart Context caps quantities at available stock | automated | `npx tsc --noEmit` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | CART-01 | N/A | Floating cart bar renders above bottom nav when active | automated | `npm run lint` | ❌ W0 | ⬜ pending |
| 03-01-03 | 01 | 1 | CART-01 | N/A | Dedicated /cart page calculates subtotal & delivery fee | automated | `npm run lint` | ❌ W0 | ⬜ pending |
| 03-02-01 | 02 | 2 | CART-02 | T-03-02 | Address API validates off-campus fields & phone format | automated | `npx tsc --noEmit` | ❌ W0 | ⬜ pending |
| 03-02-02 | 02 | 2 | CART-02 | N/A | Address form renders hub selector & service area notice | automated | `npm run lint` | ❌ W0 | ⬜ pending |
| 03-02-03 | 02 | 2 | CART-03 | N/A | 1-page checkout renders COD & UPI payment radio cards | automated | `npm run lint` | ❌ W0 | ⬜ pending |

---

## Wave 0 Requirements

- [ ] `src/components/providers/CartProvider.tsx` — Cart state provider
- [ ] `src/components/cart/FloatingCartBar.tsx` — Floating cart bar
- [ ] `src/app/cart/page.tsx` — Shopping cart page
- [ ] `src/components/checkout/OffCampusAddressForm.tsx` — Address selection & form
- [ ] `src/app/cart/checkout/page.tsx` — Checkout page

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Floating cart bar animation | CART-01 | Visual transition animation | Add product to cart; verify floating bar slides up smoothly above bottom nav |
| Off-campus service alert banner | CART-02 | Visual banner display | Open address form; verify off-campus delivery scope notice is prominently visible |

---

## Validation Sign-Off

- [x] All tasks have automated verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-08-15
