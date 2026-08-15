# Known Concerns & Tech Debt

**Last Updated:** 2026-08-15

## Technical Debt

- **Starter Boilerplate:** App currently contains default Next.js `create-next-app` landing page template code in `src/app/page.tsx`.
- **Missing Test Infrastructure:** No unit, component, or end-to-end testing suite set up in `package.json`.

## Security & Performance

- **React Compiler:** Enabled (`babel-plugin-react-compiler` with `reactCompiler: true` in `next.config.ts`); ensure dependencies remain compatible.
- **Dependencies:** Core framework dependencies (`next`, `react`) are on modern release channels (Next.js 16, React 19).
