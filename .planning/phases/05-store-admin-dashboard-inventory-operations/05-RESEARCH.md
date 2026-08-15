# Phase 05: Store Admin Dashboard & Inventory Operations - Research

**Gathered:** 2026-08-15
**Phase Goal:** Provide Store Owner X with an admin dashboard (`/admin`) to manage product catalog, update prices, adjust inventory stock, process incoming orders (accept/reject, update status), and assign delivery partners.

---

## 1. API Architecture & Data Flow

### 1. Admin Product Catalog & Stock API (`/api/admin/products`)
- **GET:** Returns all products for Store X with category details and current stock.
- **POST:** Creates a new `Product` in Store X catalog (`name`, `slug`, `price`, `stock`, `unit`, `categoryId`, `imageUrl`).
- **PATCH /api/admin/products/[id]:**
  - Updates product details (price, active status, unit, description).
  - Handles stock adjustments: computes `changeQuantity = newStock - previousStock`, updates `Product.stock`, and inserts `InventoryLog` record (`reason: "MANUAL_OVERRIDE"`).

### 2. Admin Incoming Orders API (`/api/admin/orders`)
- **GET:** Returns orders for Store X sorted by status (`PENDING` top priority, then `ACCEPTED`, `PREPARING`, `ASSIGNED`, `OUT_FOR_DELIVERY`).
- **PATCH /api/admin/orders/[id]:**
  - Payload: `{ status, deliveryPartnerId, rejectionReason }`
  - Rejection: Sets `status = REJECTED`, `notes = rejectionReason`.
  - Acceptance/Fulfillment: Sets `status = ACCEPTED` (or updated state), assigns `deliveryPartnerId`.
  - Automated Stock Decrement: If transition is to `ACCEPTED`, executes Prisma transaction decrementing `Product.stock` for each ordered item and inserting `InventoryLog` (`reason: "ORDER_FULFILLED"`).

### 3. Delivery Staff Roster API (`/api/admin/delivery-staff`)
- **GET:** Fetches all users with `role: "DELIVERY_PARTNER"`.
- **POST:** Onboards a new delivery partner account (`name`, `email`, `phone`, `role: "DELIVERY_PARTNER"`).

---

## 2. Component Blueprint

### 1. Store Owner X Dashboard Hub (`src/app/admin/page.tsx`)
- Summary Metrics Widgets:
  - 💰 Today's Total Revenue
  - ⏳ Pending Orders (Alert badge count)
  - 🛵 Active Deliveries Out
  - ⚠️ Low Stock Products (< 10 units)
- Quick Access Cards linking to `/admin/products`, `/admin/orders`, and `/admin/delivery-staff`.

### 2. Admin Product Catalog & Stock Manager (`src/app/admin/products/page.tsx`)
- Category filter tabs & search input.
- Table/Grid view with:
  - Product Image thumbnail, Name, Category.
  - Price (₹) with inline edit trigger.
  - Stock count with `+` / `-` quick stepper buttons.
  - Active toggle switch (In-Stock / Out-of-Stock).
- `CreateProductModal` for adding new grocery items.

### 3. Admin Incoming Orders Board (`src/app/admin/orders/page.tsx`)
- Status tabs: `Pending Approval`, `In-Preparation & Delivery`, `Completed`.
- Order Cards with:
  - Order #, Customer Delivery Address, Items List, Total Amount.
  - 1-Tap Action Buttons:
    - If `PENDING`: Green `'Accept Order'` & Red `'Reject Order'` (triggers rejection modal).
    - If `ACCEPTED`: Blue `'Start Packing'`.
    - If `PREPARING`: Purple `'Assign Rider'` (triggers rider dropdown selector).
    - If `ASSIGNED`: Teal `'Mark Out for Delivery'`.
    - If `OUT_FOR_DELIVERY`: Emerald `'Mark Delivered'`.

### 4. Delivery Staff Roster (`src/app/admin/delivery-staff/page.tsx`)
- List of Store X's registered riders (Ramesh Kumar, Suresh Singh).
- Onboard new delivery staff modal.

---

## 3. Pitfalls & Anti-Patterns to Avoid

- **Un-logged Manual Stock Edits:** Ensure all manual stock adjustments write to `InventoryLog` to maintain an audit trail.
- **Double Inventory Decrement:** Guard stock decrement logic so stock is decremented exactly once upon order acceptance.

---

## 4. Validation Architecture

- **Static Type & Lint Validation:** `npx tsc --noEmit` and `npm run lint`.
- **Admin Workflow Verification:** Test product creation, stock override, order approval, rider assignment, and delivery staff onboarding.
