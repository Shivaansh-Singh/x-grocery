# Phase 3: Shopping Cart & Off-Campus Checkout - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-15
**Phase:** 03-shopping-cart-off-campus-checkout
**Areas discussed:** Cart State & Drawer Experience, Off-Campus Address Selection, Checkout Flow & Payment Method

---

## Cart State & Drawer Experience

### Active Cart UI Notification
| Option | Description | Selected |
|--------|-------------|----------|
| Sticky Bottom Floating Cart Bar | Green floating bar above bottom nav showing X Items • ₹Total and 'View Cart →' button | ✓ |
| Bottom Nav Icon Badge Only | Show cart item badge count on bottom nav without a floating bar | |

**User's choice:** Sticky Bottom Floating Cart Bar

### Stock Limit Enforcement in Cart
| Option | Description | Selected |
|--------|-------------|----------|
| Strict Stock Cap in Cart | Disable '+' button at max stock and show toast alert ('Maximum available stock reached') | ✓ |
| Soft Cap on Checkout | Allow adding in cart but block checkout if stock is exceeded | |

**User's choice:** Strict Stock Cap in Cart

---

## Off-Campus Address Selection

### Address Form Structure
| Option | Description | Selected |
|--------|-------------|----------|
| Quick Hub Selector + Structured Fields | Select off-campus area (Royal City, Kotri Kalan, Main Gate) + Flat/Room No, Building/Colony, Landmark, Phone | ✓ |
| Free-Text Single Input | Single textarea field for address | |

**User's choice:** Quick Hub Selector + Structured Fields

### Service Area Boundary Warning
| Option | Description | Selected |
|--------|-------------|----------|
| Prominent Off-Campus Service Banner | Clear alert banner on address selector explicitly clarifying off-campus delivery scope | ✓ |
| Footer Note Only | Simple small disclaimer text at bottom of checkout | |

**User's choice:** Prominent Off-Campus Service Banner

---

## Checkout Flow & Payment Method

### Payment Method Selection UI
| Option | Description | Selected |
|--------|-------------|----------|
| Interactive Radio Selection Cards | 'Cash on Delivery (COD)' and 'Pay via UPI on Delivery (Scan QR Code at Doorstep)' with clear descriptions | ✓ |
| Simple Payment Dropdown | Dropdown menu with COD & UPI options | |

**User's choice:** Interactive Radio Selection Cards

### Price & Delivery Fee Breakdown
| Option | Description | Selected |
|--------|-------------|----------|
| Subtotal + Flat Delivery Fee | Clear bill breakdown showing subtotal, delivery fee (₹15, FREE over ₹199), and final amount | ✓ |
| Fixed Flat Fee Only | Always charge ₹15 delivery fee regardless of order total | |

**User's choice:** Subtotal + Flat Delivery Fee (₹15, FREE over ₹199)

---

## Agent's Discretion

- Toast notification animation style for stock limit warnings.
- Cart item removal animation or confirmation dialog.

## Deferred Ideas

- None — discussion stayed strictly within Phase 3 scope.
