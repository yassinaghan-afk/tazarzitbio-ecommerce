# Deployment — Tazarzit Bio (EasyPanel)

## Target platform

**EasyPanel** — Docker-based services, reverse proxy, SSL, env management.

Three deployable units:

1. **frontend** — Next.js (Node)
2. **backend** — FastAPI (Uvicorn)
3. **postgres** — PostgreSQL 15+ with database `tazarzitbio`

## Topology

```
                    ┌──────────────┐
   Internet ───────►│ EasyPanel    │
                    │   Proxy/SSL  │
                    └──────┬───────┘
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌────────────┐  ┌────────────┐  ┌────────────┐
    │  frontend  │  │  backend   │  │ postgres   │
    │  :3000     │  │  :8000     │  │  :5432     │
    └────────────┘  └─────┬──────┘  └────────────┘
                          │
                          └──── DATABASE_URL ────►
```

## Domains (example)

| Service | URL |
|---------|-----|
| Storefront | `https://tazarzitbio.ma` or `https://www.tazarzitbio.ma` |
| API | `https://api.tazarzitbio.ma` |

Set `NEXT_PUBLIC_API_URL` to public API URL.  
Set backend `CORS_ORIGINS` to storefront origin.

## Docker (when implemented)

### Backend Dockerfile (outline)

- Base: `python:3.11-slim`
- Install deps, copy `app/`
- CMD: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
- Run migrations on deploy: `alembic upgrade head` (init container or entrypoint script)

### Frontend Dockerfile (outline)

- Multi-stage: `node` build → `node:slim` run `next start`
- `NODE_ENV=production`
- Env at build time for `NEXT_PUBLIC_*` only

### PostgreSQL

- EasyPanel managed Postgres service
- Create database: `tazarzitbio`
- Persistent volume enabled
- Backups: enable EasyPanel/volume snapshots on schedule

## Video studio service (`/vid`)

A fourth service, **video**, renders captioned videos for the admin-only page `https://tazarzitbio.com/vid`.
It is internal only: the storefront proxies to it, so it needs no public domain.

1. EasyPanel → Create service → App → source: this repo, **Build path `video`**, Dockerfile `video/Dockerfile`.
2. Name it `video` (internal host becomes `<project>_video`, port **8000**).
3. Environment: `OPENAI_API_KEY`, `VIDEO_SERVICE_TOKEN` (generate with `openssl rand -hex 32`), optional `X264_PRESET=veryfast`.
4. Optional: mount a volume at `/data` so finished videos survive redeploys.
5. Frontend Environment: `VIDEO_SERVICE_URL=http://<project>_video:8000` and the same `VIDEO_SERVICE_TOKEN`, then redeploy the frontend.
6. Check: log in at `/admin/login`, open `/vid`, upload a short clip.

Rendering is CPU heavy (about 3× the video length on 4 cores) and runs one job at a time. Give the service at least 2 GB RAM.

## EasyPanel service checklist

### Postgres

- [ ] Service created with persistent storage
- [ ] Database `tazarzitbio` created
- [ ] Strong password in secrets
- [ ] Internal hostname noted for `DATABASE_URL`

### Backend

- [ ] Dockerfile path: `backend/Dockerfile`
- [ ] Port 8000 exposed internally
- [ ] Env vars from `env-variables.md`
- [ ] Health check: `GET /health`
- [ ] Run Alembic on deploy

### Frontend

- [ ] Dockerfile path: `frontend/Dockerfile`
- [ ] Port 3000
- [ ] Build args for `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- [ ] Health: `GET /` returns 200

### Proxy

- [ ] TLS certificates (Let’s Encrypt)
- [ ] Force HTTPS
- [ ] HTTP/2 enabled

## CI/CD (recommended)

- Git push → build images → EasyPanel webhook or registry pull
- Separate **staging** project in EasyPanel optional
- Never deploy `main` without migration review

## Migrations

1. Backup DB
2. Deploy backend with new image
3. Run `alembic upgrade head`
4. Deploy frontend if API contract changed

Rollback: revert image tag; downgrade migration only if safe.

## Static assets

- Next.js serves from frontend container
- Product images: `public/` or S3-compatible storage (future) — document when chosen

## Monitoring

- Uptime check on `/` and `/health`
- Log drain from EasyPanel
- Disk alert on Postgres volume

## Staging vs production

| Var | Staging | Production |
|-----|---------|------------|
| `DATABASE_URL` | separate DB | `tazarzitbio` |
| `ENVIRONMENT` | staging | production |
| GA4 | debug / separate property | live property |

## Pre-launch checklist

- [ ] Env vars set (no defaults in prod)
- [ ] CORS locked to prod domain
- [ ] `DEBUG=false` on backend
- [ ] Robots allow indexing only on prod
- [ ] COD copy verified in Arabic on live checkout
- [ ] Test order end-to-end on mobile network

See `env-variables.md` for full variable list.
