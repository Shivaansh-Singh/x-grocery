# Phase 4: Order Lifecycle & Live Customer Tracking - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-15
**Phase:** 04-order-lifecycle-live-customer-tracking
**Areas discussed:** Order Persistence API, Order History Page, Live Tracking Timeline UI

---

## Order Persistence API

### Order Code Format
| Option | Description | Selected |
|--------|-------------|----------|
| Unique Prefix Order Code (e.g. XG-849201) | Format with XG prefix + 6-digit random code created in PENDING status | ✓ |
| Sequential Order ID (#1001, #1002) | Sequential integer numbering | |

**User's choice:** Unique Prefix Order Code (e.g. XG-849201)

### Order Price Snapshot
| Option | Description | Selected |
|--------|-------------|----------|
| Snapshot Item Prices & Names in OrderItem | Store exact unit price, quantity, and product name snapshot at time of purchase | ✓ |
| Relational Product Foreign Key Only | Reference live product table without price snapshot | |

**User's choice:** Snapshot Item Prices & Names in OrderItem

---

## Order History Page (/orders)

### Order History Organization
| Option | Description | Selected |
|--------|-------------|----------|
| Dual Tabbed View | 'Active Orders' (with live tracking status cards) and 'Past Orders' (historical receipts) | ✓ |
| Single Unified List | Single chronological list of all orders | |

**User's choice:** Dual Tabbed View

### Order Card Details
| Option | Description | Selected |
|--------|-------------|----------|
| Detailed Order Card | Order #, Date/Time, Item List Preview, Total Amount in ₹, Payment Badge (COD/UPI), Status Pill, and Action Button | ✓ |
| Minimal Order Card | Basic Order #, Date, Total, and Status Pill | |

**User's choice:** Detailed Order Card

---

## Live Tracking Timeline UI (/orders/[id])

### Timeline Structure
| Option | Description | Selected |
|--------|-------------|----------|
| 6-Step Vertical Progress Timeline | Placed → Accepted → Preparing → Assigned → Out for Delivery → Delivered with icons & active indicators | ✓ |
| Horizontal Progress Bar | Simple 4-step progress bar | |

**User's choice:** 6-Step Vertical Progress Timeline

### Realtime Sync Strategy
| Option | Description | Selected |
|--------|-------------|----------|
| Auto-Polling Interval (3-5s) + Refresh Button | Automatic real-time status updates as order moves through stages | ✓ |
| Manual Refresh Button Only | Require tapping 'Refresh Status' button | |

**User's choice:** Auto-Polling Interval (3-5s) + Refresh Button

### Rider Contact Presentation
| Option | Description | Selected |
|--------|-------------|----------|
| Rider Contact Card | Rider Name, Store X Staff Badge, and Direct 'Call Delivery Rider' button | ✓ |
| Rider Name Only | Show rider name without call button | |

**User's choice:** Rider Contact Card

---

## Agent's Discretion

- Step icon graphics and active line connector styling.
- Estimated delivery arrival text countdown.

## Deferred Ideas

- None — discussion stayed strictly within Phase 4 scope.
