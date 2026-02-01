# Session Context

## Project Summary
Next.js 15 numerical approximation web app for PNMuSI course. Frontend-only with bilingual support (EN/BS).

## Methods Implemented
- **Interpolation:** Lagrange, Newton, Direct (Vandermonde)
- **Approximation:** Linear, Quadratic, Polynomial, Power, Exponential (least squares)

## Tech Stack
- Next.js 15.2.6 (App Router, Turbopack)
- TypeScript 5, Tailwind CSS 4
- MathLive (math input), KaTeX (LaTeX), Plotly.js (plotting)
- next-intl (i18n)

## Key Paths
- `/app/[locale]/` - Route group for i18n
- `/components/math/` - MathLive, KaTeX, Plotly wrappers
- `/lib/math/` - Algorithm implementations
- `/messages/` - EN/BS translations

## Available MCPs
- `next-devtools` - Next.js docs, dev server tools, browser automation
- `context7` - Up-to-date library documentation lookup
- `react-docs` - React documentation search
- `ESLint` - File linting

## Commands
```bash
npm run dev      # Dev server (localhost:3000)
npm run build    # Production build
npm run lint     # ESLint
```

## Notes
- Client components required for MathLive/Plotly (`"use client"`, dynamic import with `ssr: false`)
- Dark theme by default
- History in localStorage (max 50 entries)
