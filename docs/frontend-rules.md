# Frontend Rules — Tazarzit Bio

## Stack (mandatory)

- **Next.js** (App Router)
- **React 18+**
- **TypeScript** (strict)
- **Tailwind CSS**
- **shadcn/ui**
- **Framer Motion** — subtle animations only

## Project constraints

- **Standalone** — no imports from Dentclino or other repos
- **Default locale:** Arabic (`ar`)
- **Direction:** RTL (`dir="rtl"`)
- **Currency display:** MAD (`د.م.`)
- **No payment UI** in v1 — COD messaging only

## Directory structure (when scaffolded)

```
frontend/
├── app/                    # App Router pages
│   ├── layout.tsx          # RTL root, fonts, providers
│   ├── page.tsx            # Home
│   ├── products/
│   ├── cart/
│   └── checkout/
├── components/
│   ├── ui/                 # shadcn
│   ├── product/
│   ├── cart/
│   └── layout/
├── lib/
│   ├── api.ts              # fetch wrapper to backend
│   └── utils.ts
├── hooks/
├── types/
├── public/
│   └── brand/
└── styles/
    └── globals.css
```

## Coding standards

### TypeScript

- `strict: true` in `tsconfig.json`
- Prefer `interface` for object shapes; `type` for unions
- No `any` — use `unknown` + narrowing
- API types shared from `types/` or generated OpenAPI client (later)

### Components

- **Server Components by default** — add `"use client"` only when needed (state, effects, motion)
- One component per file; named exports for components
- Props interfaces: `{ComponentName}Props`

### Styling

- Tailwind only — no CSS modules unless exception documented
- Use `cn()` helper for conditional classes
- Logical properties for RTL (`ms-`, `me-`, `text-start`)
- Follow tokens in `design-system.md`

### Data fetching

- Server: `fetch` to `${API_URL}/api/v1/...` with revalidate tags for catalog
- Client: cart/checkout via client hooks + API routes optional BFF later
- Never expose admin keys in client bundles

### Images

- `next/image` always for product photos
- Explicit `width`/`height` or `fill` with `sizes`
- Arabic `alt` text from CMS/API

### i18n

- v1: Arabic only in UI strings (constants file or JSON `messages/ar.json`)
- Structure for future `fr` without rewriting components:
  - `lib/i18n.ts` + dictionary keys
- Dates: `ar-MA` locale via `Intl`

### Accessibility

- Semantic HTML (`main`, `nav`, `button` not `motion.div` for clicks)
- Keyboard navigable checkout
- Focus management on Sheet/Dialog open

### Performance

- LCP target: hero image optimized, priority on home
- Lazy load below-fold images
- Avoid large client bundles — dynamic import heavy client widgets
- `loading.tsx` and `error.tsx` per major route

### SEO

- `metadata` export on each page
- Canonical URLs
- JSON-LD Product on PDP (when data available)
- See `seo-strategy.md`

### Motion

- Wrap motion sections in client components
- Respect `prefers-reduced-motion`

### Security

- Sanitize any rich HTML from API before `dangerouslySetInnerHTML` (avoid if possible)
- Env: only `NEXT_PUBLIC_*` in client

### Git / quality

- ESLint + Prettier aligned with Next.js defaults
- No console.log in production paths

## API integration

- Base URL from `NEXT_PUBLIC_API_URL`
- All paths under `/api/v1`
- Handle errors with user-friendly Arabic messages

## Out of scope (v1 frontend)

- User accounts / login
- Card payment forms
- Admin dashboard (separate app or route group later)

See `architecture.md` and `api-structure.md`.
