# Architecture — Tazarzit Bio

## Overview

Tazarzit Bio is a **standalone** premium DTC ecommerce platform for Moroccan natural food products. The system is optimized for mobile-first Arabic RTL shopping, cash-on-delivery (COD) checkout, high trust, and high average order value (AOV).

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (Browser)                         │
│              Next.js · React · TypeScript · RTL AR               │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS / REST (JSON)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FastAPI Application                           │
│         Auth (admin) · Catalog · Cart · Orders · Webhooks        │
└────────────────────────────┬────────────────────────────────────┘
                             │ SQLAlchemy / SQLModel
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              PostgreSQL — database: tazarzitbio                  │
└─────────────────────────────────────────────────────────────────┘
```

## Principles

| Principle | Implementation |
|-----------|----------------|
| Standalone | No shared DB, services, or code with Dentclino or other projects |
| Trust-first | Reviews, origin story, certifications, transparent COD |
| Conversion | Fast PDP, sticky mobile CTA, bundles, upsells at cart |
| Premium perception | Typography, photography, whitespace, motion restraint |
| Morocco-local | Arabic default, RTL, MAD, Moroccan phone/address formats |
| COD-only | No card gateway in v1; order = commitment + phone confirmation |

## Repository layout

```
/
├── frontend/     # Next.js storefront
├── backend/      # FastAPI API + Alembic migrations
├── docs/         # This documentation set
└── sheet/        # Catalog spreadsheets → import pipeline (future)
```

## Runtime components

### Frontend (Next.js)

- **App Router** with Arabic as default locale
- **Server Components** for SEO-critical pages (home, category, PDP)
- **Client Components** for cart, checkout, animations
- **Tailwind + shadcn/ui** for consistent UI
- **Framer Motion** — subtle transitions only (see `design-system.md`)

Communicates with backend via REST. No direct database access from the browser.

### Backend (FastAPI)

- REST API versioned under `/api/v1`
- PostgreSQL via SQLModel or SQLAlchemy 2.x
- Alembic for schema migrations
- Stateless API instances (horizontal scale on EasyPanel)

### Data

- Single PostgreSQL database: `tazarzitbio`
- Product catalog, inventory flags, orders, customers (minimal PII for COD)

## Key user flows

1. **Discover** — SEO landing, category browse, Instagram/social deep links
2. **Evaluate** — PDP with origin, ingredients, social proof, bundle suggestions
3. **Convert** — Add to cart → checkout (COD) → order confirmation
4. **Fulfill** — Admin marks order shipped/delivered; optional SMS/WhatsApp (future)

See `checkout-flow.md` for checkout detail.

## Security boundaries

- Public: catalog read, cart session, order create (rate-limited)
- Admin: JWT or session auth for order management, product CRUD
- Secrets only in backend env (see `env-variables.md`)
- CORS restricted to frontend origin(s)

## Non-goals (v1)

- Payment gateways (Stripe, CMI, etc.)
- Multi-country shipping
- Customer accounts (optional later; guest checkout first)
- Real-time inventory sync with ERP

## Related documents

| Topic | Document |
|-------|----------|
| API contracts | `api-structure.md` |
| Schema | `database-schema.md` |
| Frontend conventions | `frontend-rules.md` |
| Backend conventions | `backend-rules.md` |
| Deploy | `deployment.md` |
| CRO | `cro-strategy.md` |
| Analytics | `analytics.md` |

## Phase roadmap

| Phase | Scope |
|-------|--------|
| **0 (current)** | Docs + folder structure only |
| **1** | Backend scaffold, DB migrations, core catalog + orders API |
| **2** | Frontend scaffold, RTL shell, home + PDP + cart |
| **3** | Checkout COD, admin minimal, EasyPanel deploy |
| **4** | CRO experiments, analytics, SEO content scale |
