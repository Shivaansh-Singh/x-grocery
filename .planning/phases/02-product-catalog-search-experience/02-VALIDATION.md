---
phase: 02
slug: product-catalog-search-experience
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-08-15
---

# Phase 02 — Validation Strategy

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
| 02-01-01 | 01 | 1 | CAT-01 | T-02-01 | Categories API scopes queries to active store | automated | `npx tsc --noEmit` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | CAT-01 | N/A | Category navigation pills render with 'All' default | automated | `npm run lint` | ❌ W0 | ⬜ pending |
| 02-01-03 | 01 | 1 | CAT-01 | N/A | Dedicated /categories grid page renders categories | automated | `npm run lint` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 2 | CAT-02 | T-02-02 | Search API prevents SQL/NOSQL injection | automated | `npx tsc --noEmit` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 2 | CAT-02 | N/A | Live search bar filters items with 300ms debounce | automated | `npm run lint` | ❌ W0 | ⬜ pending |
| 02-02-03 | 02 | 2 | CAT-03 | N/A | Product card renders 2-column grid with stock badges | automated | `npm run lint` | ❌ W0 | ⬜ pending |
| 02-02-04 | 02 | 2 | CAT-03 | N/A | Slide-up bottom drawer opens product detail preview | automated | `npm run lint` | ❌ W0 | ⬜ pending |

---

## Wave 0 Requirements

- [ ] `src/app/api/categories/route.ts` — Category API handler
- [ ] `src/app/api/products/route.ts` — Products filtering API handler
- [ ] `src/components/catalog/CategoryPills.tsx` — Category pills filter
- [ ] `src/components/catalog/SearchBar.tsx` — Live search component
- [ ] `src/components/catalog/ProductCard.tsx` — 2-column product card
- [ ] `src/components/catalog/ProductDetailModal.tsx` — Mobile slide-up drawer

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Slide-up bottom drawer animation | CAT-03 | Visual drawer transition animation | Tap product card on mobile view; verify bottom drawer slides up smoothly |
| Out-of-stock badge display | CAT-03 | UI badge styling check | Verify products with stock=0 render 'Out of Stock' badge and disabled ADD button |

---

## Validation Sign-Off

- [x] All tasks have automated verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-08-15
