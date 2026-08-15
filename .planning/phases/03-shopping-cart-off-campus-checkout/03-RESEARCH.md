# Phase 03: Shopping Cart & Off-Campus Checkout - Research

**Gathered:** 2026-08-15
**Phase Goal:** Implement persistent shopping cart state management, off-campus VIT Bhopal delivery address selection (flats/rooms/PGs), and order checkout with Cash on Delivery & UPI on Delivery.

---

## 1. Cart Context & State Persistence (`CartProvider.tsx`)

### State Contract
```typescript
export interface CartItem {
  id: string;
  product: ProductItem;
  quantity: number;
}

export interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  addItem: (product: ProductItem, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}
```

### Persistence & Synchronization
- Cart state initialized from `localStorage` (`"x_grocery_cart"`) inside a `useEffect` on mount to prevent SSR hydration mismatches.
- Subtotal calculated dynamically: `items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)`.
- Delivery Fee calculation:
  - If `subtotal >= 199` or `items.length === 0`: `deliveryFee = 0` (FREE Delivery).
  - Else: `deliveryFee = 15` (₹15 flat delivery fee).

### Strict Stock Limit Enforcement
- When `updateQuantity` or `addItem` is called, quantity is capped at `product.stock`.
- If requested quantity > `product.stock`, a toast alert is emitted (`"Maximum available stock reached (N items in stock)"`) and quantity is set to `product.stock`.

---

## 2. Component Blueprint

### 1. Sticky Floating Cart Bar (`FloatingCartBar.tsx`)
- Rendered in `AppShell.tsx` above `BottomNav.tsx` when `itemCount > 0`.
- Hidden on `/cart` and `/cart/checkout` pages.
- Displays: `X Items • ₹Total` and a `'View Cart →'` button leading to `/cart`.

### 2. Toast Notification System (`ToastProvider.tsx`)
- Global alert toast container for feedback (stock caps, item additions, address validation).

### 3. Shopping Cart View (`src/app/cart/page.tsx`)
- Empty Cart state with browse button when `items.length === 0`.
- Itemized list with thumbnail, title, unit display, price, inline stepper, and remove button.
- Bill details breakdown:
  - Items Subtotal
  - Delivery Fee (₹15 or `FREE` badge)
  - Total Savings / Free delivery progress bar (`Add ₹X more for FREE delivery`)
  - Grand Total
- Action: `'Proceed to Checkout →'` button linking to `/cart/checkout`.

### 4. Off-Campus Delivery Address Form (`OffCampusAddressForm.tsx`)
- Quick Hub Selector Buttons (`Royal City`, `Kotri Kalan`, `Main Gate Road`, `Ashta Road`).
- Form Fields: `Building / Colony Name`, `Flat / Room No`, `Landmark (Optional)`, `Student Phone Number`.
- Prominent Alert Banner:
  - *"Store X delivers strictly to off-campus flats, rooms & PGs in Kotri Kalan / Royal City area. Inside-campus hostel delivery is NOT supported in Phase 1."*

### 5. Checkout View (`src/app/cart/checkout/page.tsx`)
- Step 1: Delivery Address Selection / Confirmation.
- Step 2: Payment Method Radio Cards:
  - `Cash on Delivery (COD)` — Pay cash to rider upon delivery.
  - `Pay via UPI on Delivery` — Scan QR code at doorstep.
- Step 3: Order Summary & Bill Breakdown.
- Action: `'Place Order (COD / UPI)'` button.

---

## 3. Pitfalls & Anti-Patterns to Avoid

- **Hydration Mismatch on SSR:** Do not read `localStorage` during initial component render; initialize in `useEffect` or state hook after mounting.
- **Vague Address Inputs:** Enforce structured address fields so riders can locate student flats easily.
- **Silent Stock Failures:** Always provide clear toast feedback when a stock cap is reached.

---

## 4. Validation Architecture

- **Static Type & Lint Validation:** `npx tsc --noEmit` and `npm run lint`.
- **Cart Calculation Verification:** Test subtotal, delivery fee calculation (free over ₹199), and stock capping logic.
