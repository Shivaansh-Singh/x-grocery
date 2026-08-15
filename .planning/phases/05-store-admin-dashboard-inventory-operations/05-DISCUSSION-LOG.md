# Phase 5: Store Admin Dashboard & Inventory Operations - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-15
**Phase:** 05-store-admin-dashboard-inventory-operations
**Areas discussed:** Admin Catalog & Stock Operations, Admin Incoming Orders Board, Rider Assignment & Stock Reconciliation

---

## Admin Catalog & Stock Operations (/admin/products)

### Stock & Price Edit UX
| Option | Description | Selected |
|--------|-------------|----------|
| Quick Inline Stepper & Modal | 1-tap stock adjust buttons (+ / -) directly on product list + modal for price & details edit | ✓ |
| Full Page Edit Route | Navigate to /admin/products/[id]/edit for all changes | |

**User's choice:** Quick Inline Stepper & Modal

### Inventory Audit Logging
| Option | Description | Selected |
|--------|-------------|----------|
| Automatic Inventory Audit Log | Create InventoryLog entry on every stock adjustment with reason (MANUAL_OVERRIDE, RESTOCK, etc.) | ✓ |
| Direct Stock Overwrite Only | Update stock integer on Product model without log entry | |

**User's choice:** Automatic Inventory Audit Log

---

## Admin Incoming Orders Board (/admin/orders)

### Order Approval UX
| Option | Description | Selected |
|--------|-------------|----------|
| 1-Tap Accept / Reject Buttons on Order Card | Accept immediately or Reject with reason modal (e.g. Item Out of Stock) | ✓ |
| Detail View Acceptance | Require opening full order detail modal to accept/reject | |

**User's choice:** 1-Tap Accept / Reject Buttons on Order Card

### Admin Status Update UI
| Option | Description | Selected |
|--------|-------------|----------|
| Status Action Buttons on Card | 'Start Packing', 'Assign Rider', 'Mark Out for Delivery', 'Mark Delivered' buttons | ✓ |
| Status Dropdown Menu | Single status selector dropdown menu | |

**User's choice:** Status Action Buttons on Card

---

## Rider Assignment & Stock Reconciliation (/admin/delivery-staff)

### Rider Assignment UX
| Option | Description | Selected |
|--------|-------------|----------|
| Rider Selector Dropdown on Card + Delivery Staff Roster | Quick rider dropdown on order card + roster page (/admin/delivery-staff) for onboarding riders | ✓ |
| Auto-assign rider algorithm | Automatically assign next rider in queue | |

**User's choice:** Rider Selector Dropdown on Card + Delivery Staff Roster

### Stock Reconciliation Timing
| Option | Description | Selected |
|--------|-------------|----------|
| Automated Decrement on Order Acceptance / Fulfillment | Decrement Product.stock and log InventoryLog on order accept/fulfillment | ✓ |
| Immediate Checkout Decrement | Decrement Product.stock at checkout placement time | |

**User's choice:** Automated Decrement on Order Acceptance / Fulfillment

---

## Agent's Discretion

- Admin summary card layouts (total revenue, active orders count, low stock warnings count).
- Product deletion / deactivation confirmation dialog text.

## Deferred Ideas

- None — discussion stayed strictly within Phase 5 scope.
