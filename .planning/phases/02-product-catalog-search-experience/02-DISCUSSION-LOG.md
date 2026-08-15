# Phase 2: Product Catalog & Search Experience - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-15
**Phase:** 02-product-catalog-search-experience
**Areas discussed:** Category Navigation & Browsing, Instant Search & Stock Badge Behavior, Product Card & Detail View

---

## Category Navigation & Browsing

### Category Browsing Layout
| Option | Description | Selected |
|--------|-------------|----------|
| Dual Category Browsing | Sticky horizontal category pills on Homepage + dedicated /categories grid page | ✓ |
| Homepage Filter Pills Only | Category pills on home screen without dedicated page | |
| Dedicated Categories Page Only | Require navigating to /categories to filter by category | |

**User's choice:** Dual Category Browsing

### Category Filter Reset
| Option | Description | Selected |
|--------|-------------|----------|
| 'All Items' Default Pill | First pill 'All' selected by default, tapping any category filters products and tapping 'All' resets | ✓ |
| Toggle Category Pill | Tapping an active category pill deselects it to return to all products | |

**User's choice:** 'All Items' Default Pill

---

## Instant Search & Stock Badge Behavior

### Product Search Behavior
| Option | Description | Selected |
|--------|-------------|----------|
| Instant Live Search | Real-time product filtering as customer types (300ms Debounce + Clear 'X' Button) | ✓ |
| Explicit Search Submit | Require tapping 'Search' or pressing Enter | |

**User's choice:** Instant Live Search

### Out-of-Stock Item Display
| Option | Description | Selected |
|--------|-------------|----------|
| Show Card with 'Out of Stock' Badge + Disabled Add Button | Keeps product visible while clearly indicating 0 stock | ✓ |
| Sort Out-of-Stock to Bottom | Move sold-out products to the bottom of the grid with badge | |
| Hide Sold-Out Items | Hide stock = 0 items from customer view | |

**User's choice:** Show Card with 'Out of Stock' Badge + Disabled Add Button

### Low Stock Indicator
| Option | Description | Selected |
|--------|-------------|----------|
| Low Stock Warning Badge ('Only N Left!') | Show orange indicator on product card when stock is 5 or less | ✓ |
| In Stock vs Out of Stock Only | Show simple green/gray stock status without exact count warnings | |

**User's choice:** Low Stock Warning Badge ('Only N Left!')

---

## Product Card & Detail View

### Product Grid Card Layout
| Option | Description | Selected |
|--------|-------------|----------|
| Compact 2-Column Product Grid Card | Image, Title, Unit Display (e.g. 500g / 4-Pack), Price in ₹, Stock Badge, and Quick 'ADD' Button | ✓ |
| Single-Column Full Width List Items | Wide list layout with large horizontal rows | |

**User's choice:** Compact 2-Column Product Grid Card

### Product Detail View Presentation
| Option | Description | Selected |
|--------|-------------|----------|
| Mobile Slide-Up Bottom Drawer / Modal | Instant preview drawer without leaving current scroll position | ✓ |
| Dedicated Page Navigation (/product/[id]) | Full page route transition | |

**User's choice:** Mobile Slide-Up Bottom Drawer / Modal

### Card Quantity Stepper Controls
| Option | Description | Selected |
|--------|-------------|----------|
| Inline '- N +' Stepper Button | Tapping 'ADD' converts button to minus/plus controls directly on card | ✓ |
| Static 'ADD' Button | Open detail modal or cart drawer for quantity adjustments | |

**User's choice:** Inline '- N +' Stepper Button

---

## Agent's Discretion

- Tailwind CSS transition properties for bottom drawer slide-up animation.
- Skeleton card design for loading states during product data fetching.

## Deferred Ideas

- None — discussion stayed within Phase 2 scope.
