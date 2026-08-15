# Phase 01: Foundation & Data Architecture - Research

**Gathered:** 2026-08-15
**Phase Goal:** Establish database models (Prisma ORM + Supabase PostgreSQL), auth & RBAC middleware (`Customer`, `Store Admin`, `Delivery Partner`), app shell layout, and Store X seed script.

---

## 1. Stack & Integration Analysis

### Prisma ORM + Supabase PostgreSQL Connection Pooling
- **Connection Strings:**
  - `DATABASE_URL`: Transaction pooler connection string (port 6543) for application runtime queries (prevents Serverless connection exhaustion).
  - `DIRECT_URL`: Direct PostgreSQL connection string (port 5432) for running Prisma migrations (`npx prisma migrate dev` / `npx prisma db push`).
- **Prisma Client Singleton Pattern:**
  - Create `src/lib/prisma.ts` to attach the Prisma client instance to `globalThis` during development. This prevents multiple client instances from spawning during Next.js Hot Module Replacement (HMR).

### Supabase Auth & Next.js 16 Server Middleware
- **Cookie & Session Management:** Use `@supabase/ssr` to maintain auth sessions across Server Components, Server Actions, Route Handlers, and Client Components.
- **Middleware Guard (`src/middleware.ts`):**
  - Refreshes auth tokens on incoming HTTP requests.
  - Inspects user session and role (`user_metadata.role` or database `User.role`).
  - Strict route protection rules:
    - Unauthenticated access to `/admin` or `/delivery` → redirect to `/login`.
    - Authenticated users lacking `STORE_ADMIN` role accessing `/admin` → redirect to `/` with unauthorized status.
    - Authenticated users lacking `DELIVERY_PARTNER` role accessing `/delivery` → redirect to `/`.

---

## 2. Schema Architecture & Multi-Store Readiness

### Relational Schema Blueprint (`prisma/schema.prisma`)

```prisma
enum Role {
  CUSTOMER
  STORE_ADMIN
  DELIVERY_PARTNER
}

enum UnitType {
  KG
  GRAM
  PIECE
  PACK
  LITER
  ML
}

enum OrderStatus {
  PENDING
  ACCEPTED
  PREPARING
  ASSIGNED
  OUT_FOR_DELIVERY
  DELIVERED
  CANCELLED
  REJECTED
}

enum PaymentMethod {
  COD
  UPI_ON_DELIVERY
}

enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  phone     String?
  role      Role     @default(CUSTOMER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  addresses       CustomerAddress[]
  customerOrders  Order[]           @relation("CustomerOrders")
  assignedOrders  Order[]           @relation("DeliveryPartnerOrders")
  inventoryLogs   InventoryLog[]
}

model CustomerAddress {
  id             String   @id @default(uuid())
  userId         String
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  buildingColony String
  flatRoomNo     String
  landmark       String?
  phone          String
  isDefault      Boolean  @default(false)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model Store {
  id        String   @id @default(uuid())
  name      String
  slug      String   @unique
  address   String
  phone     String
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  categories Category[]
  products   Product[]
  orders     Order[]
}

model Category {
  id        String   @id @default(uuid())
  storeId   String
  store     Store    @relation(fields: [storeId], references: [id], onDelete: Cascade)
  name      String
  slug      String
  icon      String?
  sortOrder Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  products Product[]

  @@unique([storeId, slug])
}

model Product {
  id           String   @id @default(uuid())
  storeId      String
  store        Store    @relation(fields: [storeId], references: [id], onDelete: Cascade)
  categoryId   String
  category     Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  name         String
  slug         String
  description  String?
  price        Float
  imageUrl     String?
  unitType     UnitType @default(PIECE)
  unitQuantity Float    @default(1)
  unitDisplay  String   // e.g. "500g", "1 kg", "1 pack"
  stock        Int      @default(0)
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  inventoryLogs InventoryLog[]
  orderItems    OrderItem[]

  @@unique([storeId, slug])
}

model InventoryLog {
  id             String   @id @default(uuid())
  productId      String
  product        Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  previousStock  Int
  newStock       Int
  changeQuantity Int
  reason         String   // e.g. "MANUAL_ADJUSTMENT", "ORDER_FULFILLMENT", "INITIAL_SEED"
  updatedById    String?
  updatedBy      User?    @relation(fields: [updatedById], references: [id])
  createdAt      DateTime @default(now())
}

model Order {
  id                String        @id @default(uuid())
  orderNumber       String        @unique
  storeId           String
  store             Store         @relation(fields: [storeId], references: [id])
  customerId        String
  customer          User          @relation("CustomerOrders", fields: [customerId], references: [id])
  deliveryPartnerId String?
  deliveryPartner   User?         @relation("DeliveryPartnerOrders", fields: [deliveryPartnerId], references: [id])
  status            OrderStatus   @default(PENDING)
  paymentMethod     PaymentMethod @default(COD)
  paymentStatus     PaymentStatus @default(PENDING)
  totalAmount       Float
  deliveryAddress   String        // JSON string of address snapshot
  notes             String?
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  items OrderItem[]
}

model OrderItem {
  id          String  @id @default(uuid())
  orderId     String
  order       Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId   String
  product     Product @relation(fields: [productId], references: [id])
  productName String
  unitPrice   Float
  quantity    Int
  subtotal    Float
}
```

---

## 3. App Shell & Centralized Branding

### Brand Configuration (`src/config/app.config.ts`)
- Centralized configuration file exporting app title, taglines, service area notes, and asset paths.
- Allows immediate rebranding without component edits.

### Mobile App Shell
- Sticky top brand header displaying logo & current service location indicator ("Off-Campus VIT Bhopal").
- Bottom tab navigation bar with 5 tabs: `Home` (`/`), `Categories` (`/categories`), `Cart` (`/cart`), `Orders` (`/orders`), `Profile` (`/profile`).

---

## 4. Pitfalls & Anti-Patterns to Avoid

- **Direct Live DB Push in Production without Local Validation:** Use `prisma db push` locally to verify relational integrity before committing migrations.
- **Client-Only Auth Guards:** Never rely solely on React state to hide `/admin` pages. Server middleware must execute on every incoming request.
- **Unseeded Store ID:** Always seed a default Store record ("Store X") with fixed ID or known slug so single-store queries operate cleanly in Phase 1.

---

## 5. Validation Architecture

- **Static Type & Lint Validation:** `npx tsc --noEmit` and `npm run lint`.
- **Database Validation:** Executable seed script (`npx prisma db seed`) populating Store X, categories, products, admin, and delivery staff.
- **Route Access Verification:** Manual and HTTP test assertions ensuring `/admin` rejects non-admin users.
