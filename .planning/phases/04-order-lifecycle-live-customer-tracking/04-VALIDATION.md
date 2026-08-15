---
phase: 04
slug: order-lifecycle-live-customer-tracking
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-08-15
---

# Phase 04 — Validation Strategy

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
| 04-01-01 | 01 | 1 | ORD-01 | T-04-01 | Order API validates price snapshot & store ID | automated | `npx tsc --noEmit` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 1 | ORD-02 | N/A | Order History page renders active and past tabs | automated | `npm run lint` | ❌ W0 | ⬜ pending |
| 04-02-01 | 02 | 2 | ORD-03 | T-04-02 | Tracking API scopes order query by ID | automated | `npx tsc --noEmit` | ❌ W0 | ⬜ pending |
| 04-02-02 | 02 | 2 | ORD-03 | N/A | 6-Step vertical timeline updates with status change | automated | `npm run lint` | ❌ W0 | ⬜ pending |
| 04-02-03 | 02 | 2 | ORD-03 | N/A | Rider card renders rider contact button | automated | `npm run lint` | ❌ W0 | ⬜ pending |

---

## Wave 0 Requirements

- [ ] `src/app/api/orders/route.ts` — Order creation & listing API
- [ ] `src/app/api/orders/[id]/route.ts` — Order tracking detail API
- [ ] `src/app/orders/page.tsx` — Order History view
- [ ] `src/components/orders/OrderTrackingTimeline.tsx` — 6-step progress timeline
- [ ] `src/app/orders/[id]/page.tsx` — Live tracking page

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Realtime status timeline updates | ORD-03 | Live polling visual update | Update order status in db; verify live tracking timeline updates within 3-5 seconds |
| Rider call link action | ORD-03 | Telephony link trigger | Tap 'Call Rider' button on mobile; verify browser opens tel dialer |

---

## Validation Sign-Off

- [x] All tasks have automated verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-08-15
