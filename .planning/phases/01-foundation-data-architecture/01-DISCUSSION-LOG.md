# Phase 1: Foundation & Data Architecture - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-15
**Phase:** 01-foundation-data-architecture
**Areas discussed:** Authentication & Access Control, Database Schema & Multi-Store Design, App Shell & Seed Data

---

## Authentication & Access Control

### Credentials Strategy
| Option | Description | Selected |
|--------|-------------|----------|
| Supabase Email/Password + Role Metadata | Fast, cost-free setup for Phase 1 testing across Customer, Admin, and Delivery roles | ✓ |
| Supabase Phone Auth (SMS OTP) | Phone number login for all users (requires active SMS provider setup) | |
| Hybrid | Email/Password for Admin & Delivery, Phone OTP for Customers | |

**User's choice:** Supabase Email/Password + Role Metadata

### Route Protection Strategy
| Option | Description | Selected |
|--------|-------------|----------|
| Next.js Server Middleware + JWT Role Claims | Intercept requests server-side in middleware.ts, protecting /admin and /delivery routes before page render | ✓ |
| Client-side Layout Protection | Protect routes within React layout components | |

**User's choice:** Next.js Server Middleware + JWT Role Claims

### Delivery Staff Onboarding
| Option | Description | Selected |
|--------|-------------|----------|
| Admin Provisioning | Store Admin X creates delivery staff accounts from /admin dashboard | ✓ |
| Public Signup + Admin Approval | Delivery partners register on sign-up page and await X's approval | |

**User's choice:** Admin Provisioning

### Customer Address Schema
| Option | Description | Selected |
|--------|-------------|----------|
| Structured Address Schema | Separate fields for Colony/Building Name, Flat/Room Number, Nearby Landmark, and Contact Phone number | ✓ |
| Free-text Address Field | Single multi-line text input | |

**User's choice:** Skipped (Defaulted to Recommended Structured Address Schema)

---

## Database Schema & Multi-Store Design

### Multi-Store Schema Readiness
| Option | Description | Selected |
|--------|-------------|----------|
| Explicit store_id Foreign Keys | Add store_id to Category, Product, Order, and InventoryLog models, defaulting all Phase 1 queries to Store X | ✓ |
| Single-store Schema | Omit store_id foreign keys for Phase 1 | |

**User's choice:** Explicit store_id Foreign Keys

### Product Weight/Size Unit Model
| Option | Description | Selected |
|--------|-------------|----------|
| Structured Unit Model | Unit enum (KG, GRAM, PIECE, PACK, LITER, ML) + Unit Quantity value + formatted display text | ✓ |
| Simple Unit Text String | Free-text string field for item size | |

**User's choice:** Structured Unit Model

### Inventory Audit Log Strategy
| Option | Description | Selected |
|--------|-------------|----------|
| Stock Counter + Inventory Audit Log | Store stock integer on Product and record audit log entries for all manual edits & order decrements | ✓ |
| Basic Stock Field | Store stock integer directly on Product without audit history | |

**User's choice:** Stock Counter + Inventory Audit Log

### Order Status Enum Design
| Option | Description | Selected |
|--------|-------------|----------|
| Complete Lifecycle Enum | PENDING, ACCEPTED, PREPARING, ASSIGNED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED, REJECTED | ✓ |
| Simplified 4-State Enum | PENDING, ACCEPTED, OUT_FOR_DELIVERY, DELIVERED | |

**User's choice:** Complete Lifecycle Enum

---

## App Shell & Seed Data

### Customer Mobile Layout Structure
| Option | Description | Selected |
|--------|-------------|----------|
| Mobile App Shell | Sticky top brand header + bottom tab bar (Home, Categories, Cart, Orders, Profile) optimized for smartphone screens | ✓ |
| Top Navigation Bar | Single top header bar with menu dropdown | |

**User's choice:** Mobile App Shell

### Seed Categories Selection
| Option | Description | Selected |
|--------|-------------|----------|
| Student-focused Categories | Fresh Produce, Dairy & Eggs, Snacks & Munchies, Instant Noodles & Ready Meals, Beverages & Drinks, Hostel Essentials | ✓ |
| Generic Categories | Fruits, Vegetables, Pantry, Beverages, Household | |

**User's choice:** Student-focused Categories

### Test Seed Script Scope
| Option | Description | Selected |
|--------|-------------|----------|
| Automated Prisma Seed Script | Executable prisma/seed.ts populating Store X, categories, 15+ realistic student groceries with stock, Admin X, and 2 Delivery Partners | ✓ |
| Minimal Seed Script | Seed only Store X and empty categories | |

**User's choice:** Automated Prisma Seed Script

### App Brand Configuration
| Option | Description | Selected |
|--------|-------------|----------|
| Centralized Branding Constant | Configurable app title, taglines, and logo references in src/config/app.config.ts without hardcoding in components | ✓ |
| Environment Variable | Read NEXT_PUBLIC_APP_NAME for UI titles | |

**User's choice:** Centralized Branding Constant

---

## Agent's Discretion

- Database indexing choices on relational keys (`store_id`, `category_id`, `order_status`).
- CSS theme tokens and layout styling details adhering to standard mobile-first practices.

## Deferred Ideas

- Phone SMS OTP authentication — deferred to future phase to avoid SMS gateway setup during initial testing.
