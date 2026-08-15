# Code Conventions

**Last Updated:** 2026-08-15

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
