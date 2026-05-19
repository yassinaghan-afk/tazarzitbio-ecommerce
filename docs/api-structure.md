# API Structure — Tazarzit Bio

**Base URL:** `https://api.{domain}/api/v1`  
**Format:** JSON, UTF-8  
**Auth:** Bearer JWT for admin routes; public for catalog and order create

## Conventions

| Topic | Rule |
|-------|------|
| Version | `/api/v1` prefix on all routes |
| IDs | UUID in paths; `public_id` for customer order lookup |
| Money | Numbers as JSON floats **or** strings — document at scaffold (recommend `"149.00"` strings for precision optional) |
| Errors | `{ "detail": "...", "code": "ERROR_CODE" }` |
| Pagination | `?page=1&limit=20` → `{ "items": [], "total": 0, "page": 1, "limit": 20 }` |
| Language | Arabic fields returned as stored; no runtime translation in API v1 |

## Public endpoints

### Health

```
GET /health
```

**200**

```json
{ "status": "ok", "version": "1.0.0" }
```

---

### Categories

```
GET /categories
GET /categories/{slug}
```

**Response item**

```json
{
  "id": "uuid",
  "slug": "amlou",
  "name_ar": "أملو",
  "description_ar": "...",
  "product_count": 5
}
```

---

### Products

```
GET /products
GET /products/{slug}
```

**Query params (list)**

| Param | Type | Description |
|-------|------|-------------|
| category | string | category slug |
| featured | bool | |
| page, limit | int | pagination |

**Product detail**

```json
{
  "id": "uuid",
  "slug": "amlou-pistachio",
  "name_ar": "أملو بالفستق",
  "description_ar": "...",
  "short_description_ar": "...",
  "category": { "slug": "amlou", "name_ar": "أملو" },
  "images": [{ "url": "/...", "alt_ar": "..." }],
  "variants": [
    {
      "id": "uuid",
      "sku": "AML-PIS-250",
      "label_ar": "250 غ",
      "price_mad": 149.0,
      "compare_at_price_mad": null,
      "in_stock": true
    }
  ],
  "related_products": []
}
```

---

### Shipping estimate (optional v1)

```
POST /shipping/quote
```

**Body**

```json
{ "city": "الدار البيضاء", "subtotal_mad": 280.0 }
```

**Response**

```json
{
  "shipping_mad": 30.0,
  "total_mad": 310.0,
  "estimated_days_min": 2,
  "estimated_days_max": 4
}
```

---

### Orders (COD)

```
POST /orders
GET /orders/{public_id}
```

**Create body**

```json
{
  "customer": {
    "full_name": "فاطمة العلوي",
    "phone": "0612345678",
    "phone_alt": null
  },
  "shipping": {
    "city": "الدار البيضاء",
    "address": "حي..., شارع..., رقم...",
    "notes": "اتصل قبل التوصيل"
  },
  "items": [
    { "variant_id": "uuid", "quantity": 2 }
  ],
  "utm": {
    "source": "instagram",
    "medium": "paid",
    "campaign": "eid-2026"
  }
}
```

**201 Response**

```json
{
  "public_id": "TB-20260520-A1B2",
  "status": "pending",
  "payment_method": "cod",
  "subtotal_mad": 298.0,
  "shipping_mad": 30.0,
  "total_mad": 328.0,
  "currency": "MAD",
  "created_at": "2026-05-20T12:00:00Z"
}
```

**Validation errors:** `400` with field-level detail

**Stock:** `409` if variant unavailable

**Rate limit:** `429` if exceeded

**Get by public_id** — limited fields for customer tracking (status + totals + items names only).

---

## Admin endpoints

**Header:** `Authorization: Bearer {token}`

### Auth

```
POST /admin/auth/login
```

**Body:** `{ "email": "...", "password": "..." }`  
**Response:** `{ "access_token": "...", "token_type": "bearer" }`

---

### Products (admin)

```
GET    /admin/products
POST   /admin/products
PATCH  /admin/products/{id}
DELETE /admin/products/{id}          # soft delete preferred
POST   /admin/products/{id}/variants
PATCH  /admin/variants/{id}
```

---

### Orders (admin)

```
GET   /admin/orders
GET   /admin/orders/{id}
PATCH /admin/orders/{id}
```

**PATCH body (example)**

```json
{
  "status": "confirmed",
  "admin_notes": "تم التأكيد عبر الهاتف"
}
```

---

## Status codes

| Code | Usage |
|------|--------|
| 200 | OK |
| 201 | Created (order) |
| 400 | Validation |
| 401 | Unauthorized admin |
| 404 | Not found |
| 409 | Conflict (stock) |
| 429 | Rate limit |
| 500 | Server error |

## OpenAPI

FastAPI auto-generates `/docs` and `/openapi.json` — disable public `/docs` in production or protect behind admin.

## CORS

- Methods: `GET`, `POST`, `PATCH`, `OPTIONS`
- Headers: `Content-Type`, `Authorization`
- Origins: frontend production URL only

## Versioning policy

Breaking changes → `/api/v2`. Additive fields OK in v1.

## Frontend mapping

| UI route | API |
|----------|-----|
| Home featured | `GET /products?featured=true` |
| Category | `GET /products?category=` |
| PDP | `GET /products/{slug}` |
| Checkout submit | `POST /orders` |
| Confirmation | `GET /orders/{public_id}` |

See `checkout-flow.md`, `backend-rules.md`.
