# Environment Variables — Tazarzit Bio

Reference for **backend**, **frontend**, and **EasyPanel** configuration. Never commit real secrets to git.

## Backend

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `ENVIRONMENT` | Yes | `production` | `development` \| `staging` \| `production` |
| `DEBUG` | Yes | `false` | FastAPI debug; must be `false` in prod |
| `SECRET_KEY` | Yes | *(random 64+ chars)* | JWT signing, session crypto |
| `DATABASE_URL` | Yes | `postgresql+asyncpg://user:pass@postgres:5432/tazarzitbio` | SQLAlchemy URL; DB name **tazarzitbio** |
| `CORS_ORIGINS` | Yes | `https://tazarzitbio.ma` | Comma-separated frontend origins |
| `API_PREFIX` | No | `/api/v1` | Mount path |
| `ADMIN_JWT_EXPIRE_MINUTES` | No | `1440` | Admin token TTL |
| `ORDER_RATE_LIMIT_PER_MINUTE` | No | `10` | Per-IP order create limit |
| `DEFAULT_SHIPPING_MAD` | No | `30` | Fallback flat shipping |
| `FREE_SHIPPING_THRESHOLD_MAD` | No | `300` | Subtotal for free shipping |
| `LOG_LEVEL` | No | `INFO` | `DEBUG` \| `INFO` \| `WARNING` |

### Backend (future / optional)

| Variable | Description |
|----------|-------------|
| `SENTRY_DSN` | Error tracking |
| `SMTP_*` | Transactional email |
| `TELEGRAM_BOT_TOKEN` | Order notifications |

## Frontend (Next.js)

Public vars must be prefixed with `NEXT_PUBLIC_`.

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | Yes | `production` | Node environment |
| `NEXT_PUBLIC_API_URL` | Yes | `https://api.tazarzitbio.ma` | Backend base URL (no trailing slash) |
| `NEXT_PUBLIC_SITE_URL` | Yes | `https://tazarzitbio.ma` | Canonical site URL for metadata |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | No | `G-XXXXXXXX` | Google Analytics 4 |
| `NEXT_PUBLIC_META_PIXEL_ID` | No | | Meta ads pixel |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | No | `2126XXXXXXXX` | E.164 without + for wa.me links |
| `NEXT_PUBLIC_SUPPORT_PHONE` | No | | Display phone |

## PostgreSQL (EasyPanel service)

| Variable | Example | Description |
|----------|---------|-------------|
| `POSTGRES_USER` | `tazarzit` | DB user |
| `POSTGRES_PASSWORD` | *(secret)* | |
| `POSTGRES_DB` | `tazarzitbio` | **Exact database name** |

Compose `DATABASE_URL` for backend from internal hostname, e.g.:

```
postgresql+asyncpg://tazarzit:***@tazarzit-postgres:5432/tazarzitbio
```

## Per environment

### Development (local)

```bash
# backend/.env (gitignored)
ENVIRONMENT=development
DEBUG=true
SECRET_KEY=dev-only-change-me
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/tazarzitbio
CORS_ORIGINS=http://localhost:3000

# frontend/.env.local (gitignored)
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Staging

- Separate Postgres database or instance
- `ENVIRONMENT=staging`
- Staging domains in `CORS_ORIGINS` and `NEXT_PUBLIC_*`

### Production

- `DEBUG=false`
- Strong `SECRET_KEY` and DB password
- Only production domains in CORS and public URLs
- No `NEXT_PUBLIC_` secrets that are actually private

## Gitignore (when code exists)

```
.env
.env.local
.env.*.local
backend/.env
frontend/.env.local
```

## EasyPanel mapping

| Service | Env source |
|---------|------------|
| postgres | `POSTGRES_*` |
| backend | all Backend vars |
| frontend | all `NEXT_PUBLIC_*` at **build** and runtime |

Document any new variable in this file in the same PR as code that uses it.
