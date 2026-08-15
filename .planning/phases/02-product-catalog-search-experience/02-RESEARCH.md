# Phase 02: Product Catalog & Search Experience - Research

**Gathered:** 2026-08-15
**Phase Goal:** Provide customers with a fast, mobile-first product discovery UI including category navigation, instant search, item detail modal, and live stock badges.

---

## 1. Component Architecture & API Design

### API Endpoint Blueprint

1. **Category Listing (`GET /api/categories`):**
   - Queries `prisma.category.findMany()` for `storeId = X_STORE_ID` ordered by `sortOrder ASC`.
   - Returns array of category objects `{ id, name, slug, icon, sortOrder }`.

2. **Product Discovery & Search (`GET /api/products`):**
   - Query Parameters: `category` (slug string), `search` (text query string).
   - Queries `prisma.product.findMany()` matching:
     - `storeId = X_STORE_ID`
     - `isActive = true`
     - Category filter (if `category` parameter is present and not `'all'`)
     - Search filter: `contains` (case-insensitive) on `name` or `description`
   - Returns products array including unit details (`unitType`, `unitQuantity`, `unitDisplay`), pricing, image, and live stock count.

---

## 2. Client-Side Interactive Patterns

### 1. Debounced Live Search (`SearchBar.tsx`)
- Custom `useDebounce` hook (300ms delay) to prevent excessive API requests while typing.
- Clear button (`'X'`) resetting search input and query string immediately.

### 2. Sticky Horizontal Category Filter Row (`CategoryPills.tsx`)
- Scrollable horizontal container with CSS scroll snap or overflow-x.
- Default pill `'All'` selected when no category filter is active.
- Tapping a category pill sets the active category filter state and updates URL search parameters seamlessly.

### 3. Product Card & Inline Stepper (`ProductCard.tsx`)
- 2-column mobile grid layout.
- Image with fallback placeholder.
- Badges:
  - `stock == 0`: Red `'Out of Stock'` badge with disabled button.
  - `stock > 0 && stock <= 5`: Orange `'Only N Left!'` warning badge.
- Interactive Button: Initial green `'ADD'` button converts to an inline `- N +` quantity stepper upon first tap.

### 4. Mobile Slide-Up Product Detail Drawer (`ProductDetailModal.tsx`)
- Slide-up bottom drawer using Tailwind CSS backdrop-blur and slide-up transitions (`translate-y-0` vs `translate-y-full`).
- Tapping a product card opens the drawer without triggering navigation or losing scroll position.
- Displays large product image, full description, unit breakdown, price in ₹, stock badge, and quantity stepper.

---

## 3. Pitfalls & Anti-Patterns to Avoid

- **Full Page Reloads on Search/Filter:** Use Client Component state and `useRouter` / `useSearchParams` URL updates without hard page reloads.
- **Client-Side Heavy Filtering:** Ensure filtering happens via Prisma queries or efficient client-side memoization (`useMemo`) to keep mobile rendering fast.
- **Lost Scroll Position:** Use slide-up bottom drawer instead of page routing (`/product/[id]`) for product detail previews to preserve scroll context.

---

## 4. Validation Architecture

- **Static Type & Lint Validation:** `npx tsc --noEmit` and `npm run lint`.
- **API Endpoint Assertions:** Test HTTP queries for `/api/categories` and `/api/products?search=...`.
- **Component Verification:** Verify category filter switching and detail drawer rendering.
