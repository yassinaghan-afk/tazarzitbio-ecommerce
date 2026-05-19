# Backend Rules — Tazarzit Bio

## Stack (mandatory)

- **Python 3.11+**
- **FastAPI**
- **PostgreSQL** — database name: `tazarzitbio`
- **SQLModel** or **SQLAlchemy 2.x** (pick one at scaffold; document in README)
- **Alembic** migrations
- **REST API** (JSON)

## Project constraints

- **Standalone** — no shared code or DB with Dentclino
- **COD-only orders** — no payment processor integration in v1
- **Pydantic v2** for request/response schemas

## Directory structure (when scaffolded)

```
backend/
├── app/
│   ├── main.py
│   ├── config.py
│   ├── api/
│   │   └── v1/
│   │       ├── router.py
│   │       ├── products.py
│   │       ├── categories.py
│   │       ├── cart.py          # optional server cart
│   │       └── orders.py
│   ├── models/
│   ├── schemas/
│   ├── services/
│   └── db/
│       └── session.py
├── alembic/
│   └── versions/
├── tests/
├── requirements.txt
└── Dockerfile
```

## API design

- Version prefix: `/api/v1`
- Plural nouns: `/products`, `/orders`
- JSON only; UTF-8 Arabic in strings
- Standard error shape:

```json
{
  "detail": "رسالة خطأ أو كود",
  "code": "VALIDATION_ERROR"
}
```

- Pagination: `?page=1&limit=20` with `{ items, total, page, limit }`
- See `api-structure.md`

## Layers

| Layer | Responsibility |
|-------|----------------|
| **Router** | HTTP, status codes, deps |
| **Service** | Business logic, transactions |
| **Model** | SQLAlchemy/SQLModel tables |
| **Schema** | Pydantic in/out DTOs |

No business logic in routers beyond validation delegation.

## Database

- Connection string via `DATABASE_URL`
- Pool: `pool_pre_ping=True`, sensible pool size for EasyPanel
- All schema changes via **Alembic** — never manual prod edits
- See `database-schema.md`

## Auth (v1)

- **Public** endpoints: catalog, create order (rate-limited)
- **Admin** endpoints: JWT bearer or API key in header
- Passwords hashed with bcrypt/argon2 when admin users exist
- Separate admin role from customer (customers are records, not accounts in v1)

## Validation

- Moroccan phone: normalize to E.164 or local pattern `06xxxxxxxx`
- Money: store as **integer centimes** or **decimal(10,2)** — pick one and stick (recommend decimal MAD)
- Slugs: ASCII `a-z0-9-` for URLs; Arabic names in separate fields

## Orders & COD

- Status enum: `pending`, `confirmed`, `shipped`, `delivered`, `cancelled`
- `payment_method` = `cod` only in v1
- Idempotency: optional `Idempotency-Key` header on order create (recommended)

## Security

- CORS: allow only frontend origin(s)
- Rate limit order creation per IP
- No secrets in logs
- Input max lengths on text fields
- SQL injection prevented via ORM only

## Testing

- pytest + httpx AsyncClient
- Test DB or transactions rollback per test
- Cover: order create, stock decrement rules, validation failures

## Logging & observability

- Structured JSON logs in production
- Request ID middleware
- Health: `GET /health` → `{ "status": "ok" }`

## Dependencies

- Pin versions in `requirements.txt`
- Use `uv` or `pip` consistently in docs/Dockerfile

## Out of scope (v1 backend)

- Payment gateways
- Multi-warehouse ERP sync
- Email/SMS providers (stub hooks OK)

See `env-variables.md`, `deployment.md`.
