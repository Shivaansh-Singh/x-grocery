# Roadmap: x-grocery (Phase 1 Milestone)

## Overview

`x-grocery` Phase 1 delivers a complete, production-quality hyperlocal instant grocery delivery platform for VIT Bhopal students living outside campus. The roadmap spans 6 vertical phases: establishing the core database & RBAC architecture, building customer product discovery and cart/checkout, implementing live order tracking, creating Store X's admin dashboard with stock management, and building the mobile delivery partner portal (`/delivery`).

## Phases

- [x] **Phase 1: Foundation & Data Architecture** — Supabase PostgreSQL schema, Prisma ORM, role-based auth & protected routes
- [x] **Phase 2: Product Catalog & Search Experience** — Customer category browsing, search, item details, and stock badges
- [x] **Phase 3: Shopping Cart & Off-Campus Checkout** — Persistent cart, off-campus delivery address validation, COD & UPI checkout
- [x] **Phase 4: Order Lifecycle & Live Customer Tracking** — Order creation flow, order history, and realtime tracking timeline
- [x] **Phase 5: Store Admin Dashboard & Inventory Operations** — Catalog CRUD, stock management, order processing, delivery assignment
- [ ] **Phase 6: Mobile Delivery Partner Portal (`/delivery`)** — Staff mobile order view, customer delivery details, and delivery status updates

---

## Phase Details

### Phase 1: Foundation & Data Architecture
**Goal**: Establish production database models with multi-store schema abstraction (`store_id`), Supabase Auth integration, role-based access control (Customer, Store Admin, Delivery Partner), and core layout.
**Mode**: mvp
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, DB-01, DB-02
**Success Criteria**:
  1. Database migrations run cleanly with `store_id` relational abstraction and complete product/inventory/order schema.
  2. Authentication system supports registration, login, session management, and role assignment.
  3. Middleware protects `/admin` routes for Store Admins and `/delivery` routes for Delivery Partners.
**Plans**: 2 plans

Plans:
- [x] 01-01: Prisma ORM database schema definition, Supabase client configuration, and seed script for Store X
- [x] 01-02: Authentication flow, session state, RBAC middleware, and base application shell layout

---

### Phase 2: Product Catalog & Search Experience
**Goal**: Provide customers with a fast, mobile-first product discovery UI including category navigation, instant search, and live stock indicators.
**Mode**: mvp
**Depends on**: Phase 1
**Requirements**: CAT-01, CAT-02, CAT-03
**Success Criteria**:
  1. Customer can filter products by category and search groceries with instant results.
  2. Customer can open item details to view image, price, unit description, and stock availability badge.
**Plans**: 2 plans

Plans:
- [x] 02-01: Category navigation and responsive product grid UI components
- [x] 02-02: Instant search filtering and product detail modal with real-time stock indicators

---

### Phase 3: Shopping Cart & Off-Campus Checkout
**Goal**: Implement shopping cart state management, off-campus VIT Bhopal delivery address selection (flats/rooms/PGs), and order checkout with Cash on Delivery & UPI on Delivery.
**Mode**: mvp
**Depends on**: Phase 2
**Requirements**: CART-01, CART-02, CART-03
**Success Criteria**:
  1. Customer can add/edit/remove items in cart with quantity controls enforced against stock limits.
  2. Customer can enter and save their off-campus delivery address in supported residential areas.
  3. Customer can complete checkout choosing COD or UPI on Delivery.
**Plans**: 2 plans

Plans:
- [x] 03-01: Persistent shopping cart state & drawer UI with stock limit checks
- [x] 03-02: Off-campus delivery address selector and checkout flow (COD & UPI options)

---

### Phase 4: Order Lifecycle & Live Customer Tracking
**Goal**: Enable order placement, order history viewing, and live realtime tracking of order progress.
**Mode**: mvp
**Depends on**: Phase 3
**Requirements**: ORD-01, ORD-02, ORD-03
**Success Criteria**:
  1. Placing an order creates a persistent order record with initial `pending` status.
  2. Customer can view past orders in Order History.
  3. Customer can view active order status updating in real-time (Pending → Accepted → Preparing → Assigned → Out for Delivery → Delivered).
**Plans**: 2 plans

Plans:
- [x] 04-01: Order creation API endpoints, inventory reservation lock, and Order History view
- [x] 04-02: Live realtime order status tracking page with progress timeline UI

---

### Phase 5: Store Admin Dashboard & Inventory Operations
**Goal**: Provide Store Owner X with an admin dashboard (`/admin`) to manage product catalog, update prices, adjust inventory stock, process incoming orders (accept/reject, update status), and assign delivery partners.
**Mode**: mvp
**Depends on**: Phase 4
**Requirements**: ADMIN-01, ADMIN-02, ADMIN-03, ADMIN-04
**Success Criteria**:
  1. Store Owner X can add, edit, and update prices for catalog products.
  2. Store Owner X can manually adjust stock levels and automated stock decrements occur upon order fulfillment.
  3. Store Owner X can view incoming orders and advance order statuses.
  4. Store Owner X can assign registered delivery partners to accepted orders.
**Plans**: 3 plans

Plans:
- [x] 05-01: Admin product catalog management, price editing, and stock overrides
- [x] 05-02: Realtime store order management dashboard with accept/reject & status advancement
- [x] 05-03: Inventory audit logging and delivery staff assignment workflow

---

### Phase 6: Mobile Delivery Partner Portal (`/delivery`)
**Goal**: Build a mobile-optimized portal for X's delivery staff to receive assigned orders, access customer address details, and update delivery progress.
**Mode**: mvp
**Depends on**: Phase 5
**Requirements**: DEL-01, DEL-02
**Success Criteria**:
  1. Delivery partner can view assigned active orders with customer contact and address details.
  2. Delivery partner can update order status to "Out for Delivery" and "Delivered", reflecting immediately on customer tracking UI.
**Plans**: 2 plans

Plans:
- [ ] 06-01: Mobile delivery dashboard (`/delivery`) with assigned order queue and customer contact view
- [ ] 06-02: Delivery status action buttons ("Out for Delivery", "Delivered") with instant realtime sync

---

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Data Architecture | 2/2 | Complete | 2026-08-15 |
| 2. Product Catalog & Search Experience | 2/2 | Complete | 2026-08-15 |
| 3. Shopping Cart & Off-Campus Checkout | 2/2 | Complete | 2026-08-15 |
| 4. Order Lifecycle & Live Customer Tracking | 2/2 | Complete | 2026-08-15 |
| 5. Store Admin Dashboard & Inventory Operations | 3/3 | Complete | 2026-08-15 |
| 6. Mobile Delivery Partner Portal (`/delivery`) | 0/2 | Not started | - |

---
*Last updated: 2026-08-15*
