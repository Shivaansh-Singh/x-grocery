# Directory Structure

**Last Updated:** 2026-08-15

## Repository Layout

```text
x-grocery/
├── .agent/              # GSD skills and workflow configuration
├── .planning/           # Project planning and codebase mapping docs
├── public/              # Static public assets (SVG icons, images)
│   ├── favicon.ico
│   ├── next.svg
│   └── vercel.svg
├── src/
│   └── app/             # Next.js App Router root
│       ├── favicon.ico
│       ├── globals.css  # Global Tailwind CSS imports & theme setup
│       ├── layout.tsx   # Root HTML & font layout component
│       └── page.tsx     # Homepage entry point
├── AGENTS.md            # Agent instructions & Next.js rules
├── eslint.config.mjs    # ESLint configuration
├── next.config.ts       # Next.js compiler & build configuration
├── package.json         # Dependencies and NPM scripts
├── postcss.config.mjs   # PostCSS configuration for Tailwind
├── README.md            # Project overview documentation
└── tsconfig.json        # TypeScript compiler options
```

## Key File Locations

- **Root Layout:** `src/app/layout.tsx`
- **Main View:** `src/app/page.tsx`
- **Styles:** `src/app/globals.css`
- **Config Files:** `next.config.ts`, `tsconfig.json`, `package.json`
