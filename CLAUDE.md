# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 15 numerical approximation web app for PNMuSI course. Implements various interpolation and approximation methods with mathematical input, LaTeX rendering, and function plotting. Frontend-only with bilingual support (English/Bosnian).

## Tech Stack

- **Framework:** Next.js 15.2.6 with App Router
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **UI Components:** Custom shadcn-style components + Radix UI primitives
- **Math Libraries:**
  - MathLive - Mathematical expression input with virtual keyboard
  - math.js - Expression parsing and evaluation
  - KaTeX - LaTeX rendering
  - Plotly.js - Interactive plotting
- **i18n:** next-intl for English/Bosnian support

## Commands

```bash
npm run dev      # Development server with Turbopack (http://localhost:3000)
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint
```

## Architecture

```
app/
├── layout.tsx              # Root layout with dark theme
├── page.tsx                # Redirects to /en
├── globals.css             # Global styles + MathLive/KaTeX theming
├── i18n/
│   ├── request.ts          # next-intl server config
│   └── routing.ts          # Locale routing config
└── [locale]/               # i18n route group
    ├── layout.tsx          # Locale layout with navbar
    ├── page.tsx            # Home page with method cards
    ├── approximation/      # Least squares methods
    ├── interpolation/      # Lagrange, Newton, Direct
    └── history/            # localStorage calculation history

components/
├── ui/                     # Reusable shadcn-style components
├── math/                   # Math-specific components
│   ├── math-input.tsx      # MathLive wrapper
│   ├── latex-display.tsx   # KaTeX wrapper
│   ├── function-plot.tsx   # Plotly wrapper
│   └── data-point-input.tsx
├── data-input/             # Data entry components
│   ├── manual-input.tsx
│   ├── file-upload.tsx
│   ├── function-input.tsx
│   └── input-tabs.tsx
├── layout/                 # Navigation components
│   ├── navbar.tsx
│   ├── mobile-nav.tsx
│   └── language-switcher.tsx
└── results/                # Result display components
    ├── polynomial-result.tsx
    └── step-display.tsx

lib/
├── utils.ts                # cn() utility
├── math/                   # Mathematical algorithms
│   ├── approximation.ts    # Least squares methods
│   ├── interpolation.ts    # Lagrange, Newton, Direct
│   ├── matrix-utils.ts     # Linear algebra operations
│   ├── expression-parser.ts # math.js wrapper
│   ├── validators.ts       # Data validation
│   └── nonlinear.ts        # Power, exponential
├── hooks/                  # React hooks
│   ├── use-history.ts      # localStorage management
│   └── use-calculation.ts  # Calculation state
└── types/
    └── index.ts            # TypeScript type definitions

messages/
├── en.json                 # English translations
└── bs.json                 # Bosnian translations
```

## Key Patterns

- **Client Components:** MathLive and Plotly require `"use client"` and dynamic imports with `ssr: false`
- **Path Aliases:** Use `@/` prefix for imports
- **i18n:** Locale in URL (`/en/approximation`, `/bs/interpolation`)
- **Styling:** Dark theme by default, oklch color values
- **Mobile:** Bottom navigation bar, responsive layouts

## Mathematical Methods

### Approximation (Least Squares)
- Linear: y = a + bx
- Quadratic: y = a + bx + cx²
- Polynomial (degree n)
- Power: y = ax^b (via ln transform)
- Exponential: y = ae^(bx) (via ln transform)

### Interpolation
- Lagrange: Basis polynomial method
- Newton: Divided differences
- Direct: Vandermonde matrix

## Data Input Modes

1. **Manual:** Table entry with add/remove rows
2. **File Upload:** CSV (x,y or x;y) and JSON ([{x,y},...])
3. **Function:** Enter f(x) expression and auto-generate points

## Notes

- History stored in localStorage (max 50 entries)
- LaTeX stays universal across languages
- Validation enforces unique x for interpolation, positive values for log transforms
