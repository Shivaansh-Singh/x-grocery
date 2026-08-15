---
phase: 06
slug: mobile-delivery-partner-portal-delivery
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-08-15
---

# Phase 06 — Validation Strategy

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
| 06-01-01 | 01 | 1 | DEL-01 | T-06-01 | Delivery API filters orders by assigned rider ID | automated | `npx tsc --noEmit` | ❌ W0 | ⬜ pending |
| 06-01-02 | 01 | 1 | DEL-01 | N/A | Rider profile selector & delivery card render student address | automated | `npm run lint` | ❌ W0 | ⬜ pending |
| 06-02-01 | 02 | 2 | DEL-02 | T-06-02 | Delivery status API updates status & paymentStatus | automated | `npx tsc --noEmit` | ❌ W0 | ⬜ pending |
| 06-02-02 | 02 | 2 | DEL-02 | N/A | Doorstep payment verification modal enforces payment checkbox | automated | `npm run lint` | ❌ W0 | ⬜ pending |
| 06-02-03 | 02 | 2 | DEL-01, DEL-02 | N/A | Mobile delivery portal `/delivery` assembles 2-step workflow | automated | `npm run lint` | ❌ W0 | ⬜ pending |

---

## Wave 0 Requirements

- [ ] `src/app/api/delivery/orders/route.ts` — Rider assigned orders API
- [ ] `src/app/api/delivery/orders/[id]/route.ts` — Rider delivery status update API
- [ ] `src/components/delivery/RiderProfileSelector.tsx` — Active rider profile selector
- [ ] `src/components/delivery/DeliveryTaskCard.tsx` — Delivery task card
- [ ] `src/components/delivery/DoorstepPaymentModal.tsx` — Doorstep payment modal
- [ ] `src/app/delivery/page.tsx` — Mobile delivery partner portal page

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Direct customer phone dialer | DEL-01 | Telephony link trigger | Tap `'Call Student 📞'` button on mobile device; verify dialer opens with phone number |
| 2-Step delivery completion flow | DEL-02 | Touch interaction | Tap `'Start Delivery'`, verify status becomes `OUT_FOR_DELIVERY`; tap `'Mark Delivered'`, check payment checkbox, confirm delivery |

---

## Validation Sign-Off

- [x] All tasks have automated verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-08-15
