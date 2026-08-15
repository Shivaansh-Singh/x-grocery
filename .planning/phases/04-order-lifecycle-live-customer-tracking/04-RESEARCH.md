# Phase 04: Order Lifecycle & Live Customer Tracking - Research

**Gathered:** 2026-08-15
**Phase Goal:** Enable order placement, order history viewing, and live realtime tracking of order progress.

---

## 1. API Architecture & Schema Mapping

### 1. Order Creation Endpoint (`POST /api/orders`)
- **Payload:** `{ storeId, customerId, deliveryAddress, paymentMethod, items: [{ productId, productName, unitPrice, quantity, subtotal }] }`
- **Logic:**
  - Generate unique order code: `orderNumber = "XG-" + Math.floor(100000 + Math.random() * 900000)`.
  - Calculate `totalAmount` = sum of `item.subtotal` + delivery fee.
  - Execute Prisma transaction inserting `Order` record and nested `OrderItem` array storing frozen price & name snapshots.
  - Set `status: "PENDING"`, `paymentStatus: "PENDING"`.

### 2. Order History Endpoint (`GET /api/orders`)
- **Query Params:** `customerId`, `status` (`active` vs `past`).
- Queries `prisma.order.findMany()` including nested `items` and `deliveryPartner`.
- Sorts by `createdAt DESC`.

### 3. Live Order Details Endpoint (`GET /api/orders/[id]`)
- Fetches single order record by ID or `orderNumber`.
- Returns full order details with status, rider details, and items.

---

## 2. Component Blueprint & Realtime Sync

### 1. Order History Page (`src/app/orders/page.tsx`)
- Tabbed interface (`Active Orders` vs `Past Orders`).
- Renders list of `OrderCard` components.

### 2. Order Card (`OrderCard.tsx`)
- Header: `Order #XG-849201` + Date/Time formatted.
- Status Pill:
  - `PENDING`: Amber (`Order Placed`)
  - `ACCEPTED`: Blue (`Accepted by Store X`)
  - `PREPARING`: Purple (`Packing Items`)
  - `ASSIGNED` / `OUT_FOR_DELIVERY`: Emerald (`Rider Out for Delivery`)
  - `DELIVERED`: Gray / Emerald (`Delivered`)
- Item preview list with quantity badges.
- Total Amount in ₹ & Payment Badge (`COD` or `UPI on Delivery`).
- Action Button: `'Track Live →'` linking to `/orders/[id]`.

### 3. Live Order Tracking Timeline (`OrderTrackingTimeline.tsx`)
- 6-Step Vertical Progress Timeline:
  1. `Order Placed` — Order received at Store X
  2. `Order Accepted` — Store Owner X approved order
  3. `Preparing Items` — Items being packed
  4. `Rider Assigned` — Dedicated rider assigned
  5. `Out for Delivery` — Rider heading to off-campus flat/room
  6. `Delivered` — Reached doorstep
- Active step highlighted with green pulsing icon and connector line.
- Estimated arrival banner: *"Estimated delivery in 10-15 Mins"*.

### 4. Rider Contact Card (`RiderContactCard.tsx`)
- Rendered when `order.status` is `ASSIGNED` or `OUT_FOR_DELIVERY`.
- Displays rider name (e.g. Ramesh Kumar), rider avatar, Store X Staff badge, and clickable phone call button (`tel:+919812345678`).

### 5. Realtime Polling Sync Hook (`useOrderSync`)
- 3-5 second `setInterval` polling `GET /api/orders/[id]` when order status is active (`!= DELIVERED` and `!= CANCELLED`).
- Auto-clears interval when order reaches `DELIVERED`.

---

## 3. Pitfalls & Anti-Patterns to Avoid

- **Un-cleared Polling Intervals:** Ensure `clearInterval` is called in `useEffect` cleanup to prevent memory leaks.
- **Un-snapshotted Prices:** Always write frozen `unitPrice` and `productName` to `OrderItem` table so catalog price updates do not retroactively alter past receipts.

---

## 4. Validation Architecture

- **Static Type & Lint Validation:** `npx tsc --noEmit` and `npm run lint`.
- **API Order Flow Verification:** Test order placement API payload insertion and order status endpoint response.
