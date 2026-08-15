# Phase 06: Mobile Delivery Partner Portal (/delivery) - Research

**Gathered:** 2026-08-15
**Phase Goal:** Build a mobile-first portal for Store X delivery staff riders (Ramesh Kumar, Suresh Singh) to view assigned active deliveries, inspect customer off-campus address details, call the student customer, scan/confirm doorstep payment (COD / UPI), and update order delivery status (`OUT_FOR_DELIVERY` → `DELIVERED`).

---

## 1. API Architecture & Data Flow

### 1. Rider Assigned Orders API (`GET /api/delivery/orders`)
- **Query Params:** `riderId` (optional rider user ID or returns active delivery partner tasks).
- Queries `prisma.order.findMany()` where `deliveryPartnerId = riderId` or `status` is `ASSIGNED` / `OUT_FOR_DELIVERY`.
- Includes `items`, `customer`, and `store`.
- Sorts by `createdAt DESC`.

### 2. Delivery Status Update & Payment API (`PATCH /api/delivery/orders/[id]`)
- **Payload:** `{ status: "OUT_FOR_DELIVERY" | "DELIVERED", paymentStatus?: "COMPLETED" }`
- **Logic:**
  - Transition to `OUT_FOR_DELIVERY`: Updates order status.
  - Transition to `DELIVERED`: Updates `status = DELIVERED` and `paymentStatus = COMPLETED`.

---

## 2. Component Blueprint

### 1. Mobile Delivery Portal (`src/app/delivery/page.tsx`)
- Header with Store X Rider Portal branding and `RiderProfileSelector`.
- Status Tabs: `Active Deliveries` vs `Completed Today`.
- Auto-refresh polling every 5 seconds to sync newly assigned orders.

### 2. Rider Profile Selector (`RiderProfileSelector.tsx`)
- Allows quick switching between registered Store X delivery staff riders (Ramesh Kumar, Suresh Singh).
- Persists selected rider ID in `localStorage` or component state.

### 3. Delivery Task Card (`DeliveryTaskCard.tsx`)
- Header: Order #, Status Badge (`ASSIGNED` vs `OUT_FOR_DELIVERY`).
- Customer Info: Name & Phone with direct `'Call Student 📞'` button (`tel:${phone}`).
- Address: Off-campus residential location (Flat/Room/Building & Landmark).
- Item Checklist preview with quantities.
- Payment Badge:
  - `COD`: *"Collect Cash: ₹199"*
  - `UPI_ON_DELIVERY`: *"Scan Store X UPI QR: ₹199"*
- Action Buttons:
  - If `ASSIGNED`: `'Start Delivery 🛵'` (sets `OUT_FOR_DELIVERY`).
  - If `OUT_FOR_DELIVERY`: `'Mark Order Delivered 🎉'` (triggers payment modal).

### 4. Doorstep Payment Verification Modal (`DoorstepPaymentModal.tsx`)
- Displays prominent payment collection mode (`Cash to Collect` vs `UPI QR Code Scan`).
- Mandatory *"Payment received from student"* confirmation checkbox.
- Confirm button advancing order to `DELIVERED` & `paymentStatus: COMPLETED`.

---

## 3. Pitfalls & Anti-Patterns to Avoid

- **Unconfirmed Deliveries:** Require checking the payment received checkbox before marking an order as delivered to prevent accidental status changes.
- **Unreachable Customer Numbers:** Ensure `tel:` links are formatted cleanly with space stripping.

---

## 4. Validation Architecture

- **Static Type & Lint Validation:** `npx tsc --noEmit` and `npm run lint`.
- **Rider Workflow Verification:** Test order task retrieval, start delivery, doorstep call button trigger, payment verification modal, and delivery completion.
