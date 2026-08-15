# System Architecture

**Last Updated:** 2026-08-15

## Architectural Overview

This application follows the **Next.js App Router** architecture using React Server Components (RSC) by default.

```
[Browser Client]
       │
       ▼
[Next.js App Router] ── (src/app/layout.tsx)
       │
       ├─────────► [Global Styles] (src/app/globals.css)
       │
       └─────────► [Page Route] (src/app/page.tsx)
```

## Key Abstractions

- **App Directory (`src/app/`):** Contains route definitions, layouts, and page components.
- **Root Layout (`src/app/layout.tsx`):** Wraps the entire application, configures global fonts (`Geist`, `Geist_Mono`), HTML metadata, and body classes.
- **Entry Page (`src/app/page.tsx`):** Main entry view component rendered at root `/`.
- **Path Aliasing:** Configured in `tsconfig.json` with `@/*` pointing to `src/*`.

## Data Flow & State Management

- Currently relies on standard server-side page rendering without complex client state or backend API endpoints.
