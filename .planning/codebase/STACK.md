# Tech Stack

**Last Updated:** 2026-08-15

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
