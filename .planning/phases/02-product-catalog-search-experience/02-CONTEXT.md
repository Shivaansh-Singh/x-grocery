# Phase 2: Product Catalog & Search Experience - Context

**Gathered:** 2026-08-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the customer-facing grocery discovery experience for Store X, including category navigation, instant debounced search, responsive 2-column product grid, stock availability badges, inline quantity steppers, and a mobile slide-up product detail modal.

</domain>

<decisions>
## Implementation Decisions

### Category Navigation & Browsing
- **D-01:** Dual Category Browsing — Sticky horizontal category pills row on the customer Homepage + a dedicated `/categories` grid page for complete category exploration.
- **D-02:** First pill in the horizontal category filter row is `'All'` (selected by default); tapping any category filters products instantly, and tapping `'All'` resets to full catalog.

### Instant Search & Stock Availability Badges
- **D-03:** Instant Live Search bar with 300ms debounce and a clear `'X'` button for real-time text query filtering.
- **D-04:** Out-of-Stock Display: Products with `stock = 0` remain visible in the catalog with a prominent `'Out of Stock'` badge and disabled `ADD` button to maintain catalog transparency.
- **D-05:** Low Stock Warning: Show an orange `'Only N Left!'` warning badge on product cards when item `stock <= 5`.

### Product Card & Detail View
- **D-06:** Compact 2-column grid card displaying high-res product image, title, unit display string (e.g. `500g`, `4 Pack`), price in ₹, stock badge, and interactive `ADD` button.
- **D-07:** Product Detail View opens as an instant mobile slide-up bottom drawer / modal when a customer taps a product card (preserves current scroll position).
- **D-08:** Inline Quantity Stepper: Tapping `ADD` converts the button into a `- N +` stepper control directly on the product card for instant cart quantity adjustments.

### Agent's Discretion
- Exact animation timing for the mobile slide-up bottom drawer (e.g. Tailwind `transition-transform duration-300`).
- Skeleton loading state component design while fetching categories/products.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project & Scope
- `.planning/PROJECT.md` — Core product vision, target audience, operator model, and constraints
- `.planning/REQUIREMENTS.md` §CAT — CAT-01, CAT-02, CAT-03 requirement specifications
- `.planning/ROADMAP.md` §Phase 2 — Phase 2 goals, dependencies, and success criteria

### Prior Phase Foundation
- `.planning/phases/01-foundation-data-architecture/01-CONTEXT.md` — Prisma `Category` and `Product` models, `UnitType` enum, mobile app shell

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/layout/AppShell.tsx` — Mobile layout frame with top header & bottom navigation bar.
- `src/config/app.config.ts` — Centralized branding constants (`appName: 'x-grocery'`).
- `src/lib/prisma.ts` — Server-side Prisma client singleton for querying categories and products.

### Established Patterns
- Path aliasing: `@/*` pointing to `./src/*`.
- Server Components for page rendering with Client Components for interactive filters.

### Integration Points
- `src/app/page.tsx` — Customer homepage incorporating search, category pills, and product grid.
- `src/app/categories/page.tsx` — Dedicated categories grid page.
- `src/app/api/products/route.ts` — API route handler for product filtering by category and search query.

</code_context>

<specifics>
## Specific Ideas

- Mobile-first responsive 2-column product grid optimized for phone screens.
- Smooth slide-up bottom drawer for product details with full description and stock status.

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within Phase 2 scope.

</deferred>

---

*Phase: 02-Product Catalog & Search Experience*
*Context gathered: 2026-08-15*
