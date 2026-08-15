---
phase: 01
slug: foundation-data-architecture
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-08-15
---

# Phase 01 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | TypeScript compiler (`tsc`) & Next.js Linter (`eslint`) + Prisma CLI validation |
| **Config file** | `tsconfig.json`, `eslint.config.mjs`, `prisma/schema.prisma` |
| **Quick run command** | `npm run lint && npx tsc --noEmit` |
| **Full suite command** | `npm run lint && npx tsc --noEmit && npx prisma validate` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run lint && npx tsc --noEmit`
- **After every plan wave:** Run `npm run lint && npx tsc --noEmit && npx prisma validate`
- **Before `/gsd-verify-work`:** Full suite must be green + `npx prisma db seed` executed successfully
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | DB-01 | T-01-01 | Relational `store_id` isolation enforced on models | automated | `npx prisma validate` | ✅ | ⬜ pending |
| 01-01-02 | 01 | 1 | DB-02 | T-01-02 | Stock counter integer & audit log model defined | automated | `npx prisma validate` | ✅ | ⬜ pending |
| 01-01-03 | 01 | 1 | DB-01 | N/A | Seed script populates Store X & mock data cleanly | automated | `npx tsx prisma/seed.ts` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 2 | AUTH-01 | T-01-03 | Supabase auth helper & role types compiled | automated | `npx tsc --noEmit` | ❌ W0 | ⬜ pending |
| 01-02-02 | 02 | 2 | AUTH-02 | T-01-04 | Middleware blocks unauthorized route access | automated | `npx tsc --noEmit` | ❌ W0 | ⬜ pending |
| 01-02-03 | 02 | 2 | AUTH-01 | N/A | Centralized branding constant & app shell frame rendered | automated | `npm run lint` | ❌ W0 | ⬜ pending |

---

## Wave 0 Requirements

- [ ] `prisma/schema.prisma` — Complete Prisma relational schema
- [ ] `prisma/seed.ts` — Executable seed script for Store X
- [ ] `src/lib/prisma.ts` — Prisma client singleton instance
- [ ] `src/lib/supabase/` — Supabase server and browser auth clients
- [ ] `src/middleware.ts` — Server middleware for RBAC route protection
- [ ] `src/config/app.config.ts` — Centralized branding configuration

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Unauthenticated redirect | AUTH-02 | Requires browser request simulation | Navigate to `/admin` without logging in; verify redirect to `/login` |
| Store Admin access | AUTH-02 | Requires authenticated session context | Log in as Store Admin X; verify `/admin` dashboard loads cleanly |

---

## Validation Sign-Off

- [x] All tasks have automated verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-08-15
