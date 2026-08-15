# Requirements — x-grocery Phase 1

**Milestone:** Phase 1 — Single-Store Hyperlocal Instant Grocery Platform
**Target Audience:** Off-campus VIT Bhopal students (flats, rooms, PGs)
**Operator:** Local Grocery Store Owner ("X")

## User Stories

### Customer (VIT Bhopal Off-Campus Student)
- **As a** student living outside campus, **I want to** browse and search Store X's grocery catalog on my phone, **so that** I can quickly find products I need.
- **As a** customer, **I want to** see live stock availability and clear pricing, **so that** I don't order items that are out of stock.
- **As a** customer, **I want to** add items to a cart, enter my off-campus delivery address, and place an order using Cash on Delivery or UPI on Delivery, **so that** checkout is fast and easy.
- **As a** customer, **I want to** track my order status live in real-time, **so that** I know exactly when my groceries will arrive (10–15 minute local delivery target).

### Store Admin (Store Owner X)
- **As a** store owner, **I want to** manage my product catalog, categories, prices, and inventory levels, **so that** my online store reflects my real store state.
- **As an** admin, **I want to** receive incoming orders in real-time on a store dashboard, accept/reject them, and assign accepted orders to my delivery staff, **so that** fulfillment is efficient.
- **As an** admin, **I want** inventory to automatically decrement upon order fulfillment and be able to manually adjust stock, **so that** stock counts remain accurate.

### Delivery Partner (X's Delivery Staff)
- **As a** delivery partner, **I want to** log into `/delivery` on my phone to view assigned orders with customer addresses and item lists, **so that** I can deliver orders promptly.
- **As a** delivery partner, **I want to** update delivery status to "Out for Delivery" and "Delivered", **so that** both Store X and the customer are kept updated.

---

## v1 Requirements

### Authentication & Authorization (AUTH)
- [x] **AUTH-01**: User authentication (Supabase Auth — Customer, Store Admin, Delivery Partner)
- [x] **AUTH-02**: Role-based access control (RBAC) with protected routes (`/admin`, `/delivery`, customer routes)

### Product Catalog & Search (CAT)
- [x] **CAT-01**: Customer category browsing and product listing
- [x] **CAT-02**: Search and category filtering for grocery items
- [x] **CAT-03**: Product detail modal/page with images, description, price, unit size, and stock availability

### Cart & Checkout (CART)
- [x] **CART-01**: Shopping cart management (add, edit quantities, remove, persistent state)
- [x] **CART-02**: Delivery address selection/input tailored for off-campus VIT Bhopal residential areas (flats, rooms, PGs)
- [x] **CART-03**: Order checkout supporting Cash on Delivery (COD) and UPI on Delivery (QR Code)

### Order Lifecycle & Live Tracking (ORD)
- [x] **ORD-01**: Order creation with initial `pending` state and immediate notification to Store X
- [x] **ORD-02**: Customer order history view
- [x] **ORD-03**: Realtime order status tracking UI (Pending → Accepted → Preparing → Assigned → Out for Delivery → Delivered / Cancelled / Rejected)

### Store Admin Dashboard (ADMIN)
- [x] **ADMIN-01**: Catalog CRUD — add, edit, remove products, manage categories, update prices
- [x] **ADMIN-02**: Inventory management — manual stock overrides and automated stock decrement upon fulfillment
- [x] **ADMIN-03**: Realtime order management dashboard — view incoming orders, accept/reject, update statuses
- [x] **ADMIN-04**: Delivery assignment — assign accepted orders to X's registered delivery partners

### Delivery Partner Interface (DEL)
- [x] **DEL-01**: Mobile-optimized `/delivery` view for staff — list assigned active deliveries, customer address, contact, and item list
- [x] **DEL-02**: Delivery status updates — mark orders as "Out for Delivery" and "Delivered"

### Architecture & Database (DB)
- [x] **DB-01**: Relational PostgreSQL database schema using Prisma ORM with `store_id` multi-store structural abstraction
- [x] **DB-02**: Inventory transaction consistency to prevent overselling beyond current stock

---

## Out of Scope (Phase 1)

- **Delivery Inside VIT Bhopal Campus:** Phase 1 exclusively serves off-campus residential areas. Campus delivery requires separate campus permissions/access logic.
- **Multi-Store Customer UI:** Single store X UI in Phase 1; data models support `store_id` for future expansion without app rebuild.
- **Food / Restaurant Delivery:** Scope limited strictly to groceries in Phase 1.
- **Online Payment Gateways (Razorpay/Cashfree):** Deferred to avoid merchant onboarding delays; COD and UPI on Delivery used for Phase 1.
- **Native iOS/Android Apps:** Phase 1 is a progressive, mobile-first responsive web application.
- **Third-Party Delivery Fleets:** Delivery staff are directly hired and managed by Store X.

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01, AUTH-02 | Phase 1 | Completed |
| DB-01, DB-02 | Phase 1 | Completed |
| CAT-01, CAT-02, CAT-03 | Phase 2 | Completed |
| CART-01, CART-02, CART-03 | Phase 3 | Completed |
| ORD-01, ORD-02, ORD-03 | Phase 4 | Completed |
| ADMIN-01, ADMIN-02, ADMIN-03, ADMIN-04 | Phase 5 | Completed |
| DEL-01, DEL-02 | Phase 6 | Completed |

---
*Last updated: 2026-08-15*
