@AGENTS.md

<!-- GSD:project-start source:PROJECT.md -->
## Project

**x-grocery**

`x-grocery` is a hyperlocal instant grocery delivery platform built for VIT Bhopal students living outside campus in nearby flats, rooms, and PGs. In Phase 1, the platform powers a single-store operation for local store owner "X", enabling students to order groceries for 10–15 minute local delivery handled by X's dedicated delivery team.

**Core Value:** Frictionless 10–15 minute hyperlocal grocery ordering and realtime order tracking for off-campus VIT Bhopal students with reliable inventory consistency.

### Constraints

- **Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Supabase PostgreSQL, Prisma ORM
- **UI/UX:** Mobile-first responsive web design optimized for smartphone usage
- **Branding:** Configurable branding (internal project name `x-grocery`; brand names must remain configurable)
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Core Technologies
- **Language:** TypeScript 5 (`tsconfig.json`)
- **Runtime:** Node.js / Vercel Edge Runtime
- **Framework:** Next.js 16.3.1 (`package.json`)
- **UI Library:** React 19.2.8 & React DOM 19.2.8 (`package.json`)
## Styling & Typography
- **CSS Engine:** Tailwind CSS v4 (`@tailwindcss/postcss` & `tailwindcss`)
- **Styling Method:** Utility classes & CSS Variables (`src/app/globals.css`)
- **Fonts:** Next.js Google Fonts optimization (`Geist`, `Geist_Mono` in `src/app/layout.tsx`)
## Build & Tooling
- **Compiler Plugin:** `babel-plugin-react-compiler` 1.0.0 (enabled via `reactCompiler: true` in `next.config.ts`)
- **Linter:** ESLint 9 with `eslint-config-next` (`eslint.config.mjs`)
- **Module Resolution:** Bundler mode with `@/*` path mapping to `./src/*` (`tsconfig.json`)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Coding Standards
- **Language:** Strict TypeScript (`"strict": true` in `tsconfig.json`).
- **Formatting & Style:** ESLint 9 using `eslint-config-next` (`eslint.config.mjs`).
- **Imports:** Use absolute path aliases `@/...` (maps to `./src/...`).
## React & Next.js Patterns
- **Server Components:** Default to Server Components in `src/app/` unless client interactivity (`"use client"`) is required.
- **Styling:** Utility-first Tailwind CSS v4 styling with responsive inline variants and dark mode support (`dark:...`).
- **Fonts:** Load fonts with `next/font/google` at layout level and inject CSS variables (`--font-geist-sans`).
## File Naming
- **App Router:** Standard Next.js special files (`layout.tsx`, `page.tsx`, `globals.css`).
- **Components:** CamelCase or PascalCase React components in TypeScript (`.tsx`).
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Architectural Overview
```
```
## Key Abstractions
- **App Directory (`src/app/`):** Contains route definitions, layouts, and page components.
- **Root Layout (`src/app/layout.tsx`):** Wraps the entire application, configures global fonts (`Geist`, `Geist_Mono`), HTML metadata, and body classes.
- **Entry Page (`src/app/page.tsx`):** Main entry view component rendered at root `/`.
- **Path Aliasing:** Configured in `tsconfig.json` with `@/*` pointing to `src/*`.
## Data Flow & State Management
- Currently relies on standard server-side page rendering without complex client state or backend API endpoints.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
