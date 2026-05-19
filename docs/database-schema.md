# Database Schema — Tazarzit Bio

**Database name:** `tazarzitbio`  
**Engine:** PostgreSQL 15+  
**Migrations:** Alembic

All tables use `id` UUID primary keys unless noted. Timestamps in UTC: `created_at`, `updated_at`.

## ER diagram (logical)

```
categories ──< products ──< product_variants
                │
                └──< product_images

orders ──< order_items
   │
   └── (optional) customers

admin_users
```

## Tables

### `categories`

| Column | Type | Notes |
|--------|------|--------|
| id | UUID PK | |
| slug | VARCHAR(100) UNIQUE | Latin, e.g. `amlou` |
| name_ar | VARCHAR(255) | |
| name_fr | VARCHAR(255) NULL | |
| description_ar | TEXT NULL | |
| sort_order | INT DEFAULT 0 | |
| is_active | BOOLEAN DEFAULT true | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### `products`

| Column | Type | Notes |
|--------|------|--------|
| id | UUID PK | |
| category_id | UUID FK → categories | |
| slug | VARCHAR(150) UNIQUE | |
| name_ar | VARCHAR(255) | |
| name_fr | VARCHAR(255) NULL | |
| description_ar | TEXT | |
| short_description_ar | VARCHAR(500) NULL | |
| is_active | BOOLEAN DEFAULT true | |
| is_featured | BOOLEAN DEFAULT false | |
| meta_title | VARCHAR(255) NULL | |
| meta_description | VARCHAR(500) NULL | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

**Product catalog (seed reference)**

| slug (example) | name_ar |
|----------------|---------|
| amlou-classic | أملو تازارزيت |
| amlou-pistachio | أملو بالفستق |
| amlou-almond | أملو باللوز |
| argan-oil | زيت أركان |
| honey | عسل طبيعي |
| nuts-honey | مكسرات بالعسل |
| gift-box-* | علب هدايا (multiple SKUs) |
| family-pack-* | عروض عائلية |

### `product_variants`

Sellable SKU (size/weight).

| Column | Type | Notes |
|--------|------|--------|
| id | UUID PK | |
| product_id | UUID FK → products | |
| sku | VARCHAR(50) UNIQUE | |
| label_ar | VARCHAR(100) | e.g. `250 غ` |
| price_mad | NUMERIC(10,2) | |
| compare_at_price_mad | NUMERIC(10,2) NULL | |
| weight_grams | INT NULL | |
| stock_quantity | INT DEFAULT 0 | |
| allow_backorder | BOOLEAN DEFAULT false | |
| is_active | BOOLEAN DEFAULT true | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### `product_images`

| Column | Type | Notes |
|--------|------|--------|
| id | UUID PK | |
| product_id | UUID FK → products | |
| url | VARCHAR(500) | path or CDN URL |
| alt_ar | VARCHAR(255) | |
| sort_order | INT DEFAULT 0 | |

### `customers` (lightweight, guest checkout)

| Column | Type | Notes |
|--------|------|--------|
| id | UUID PK | |
| full_name | VARCHAR(255) | |
| phone | VARCHAR(20) | indexed |
| phone_alt | VARCHAR(20) NULL | |
| created_at | TIMESTAMPTZ | |

Dedupe by phone optional on repeat orders.

### `orders`

| Column | Type | Notes |
|--------|------|--------|
| id | UUID PK | |
| public_id | VARCHAR(20) UNIQUE | human-friendly, e.g. `TB-20260520-ABC1` |
| customer_id | UUID FK NULL → customers | |
| status | VARCHAR(20) | enum below |
| payment_method | VARCHAR(20) | `cod` only v1 |
| subtotal_mad | NUMERIC(10,2) | |
| shipping_mad | NUMERIC(10,2) | |
| total_mad | NUMERIC(10,2) | |
| currency | CHAR(3) | `MAD` |
| shipping_full_name | VARCHAR(255) | snapshot |
| shipping_phone | VARCHAR(20) | |
| shipping_city | VARCHAR(100) | |
| shipping_address | TEXT | |
| shipping_notes | TEXT NULL | |
| utm_source | VARCHAR(100) NULL | |
| utm_medium | VARCHAR(100) NULL | |
| utm_campaign | VARCHAR(100) NULL | |
| admin_notes | TEXT NULL | |
| confirmed_at | TIMESTAMPTZ NULL | |
| shipped_at | TIMESTAMPTZ NULL | |
| delivered_at | TIMESTAMPTZ NULL | |
| cancelled_at | TIMESTAMPTZ NULL | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

**`status` values:** `pending`, `confirmed`, `shipped`, `delivered`, `cancelled`

### `order_items`

| Column | Type | Notes |
|--------|------|--------|
| id | UUID PK | |
| order_id | UUID FK → orders | |
| variant_id | UUID FK → product_variants | |
| product_name_ar | VARCHAR(255) | snapshot |
| variant_label_ar | VARCHAR(100) | snapshot |
| sku | VARCHAR(50) | snapshot |
| quantity | INT | |
| unit_price_mad | NUMERIC(10,2) | snapshot |
| line_total_mad | NUMERIC(10,2) | |

### `admin_users`

| Column | Type | Notes |
|--------|------|--------|
| id | UUID PK | |
| email | VARCHAR(255) UNIQUE | |
| password_hash | VARCHAR(255) | |
| is_active | BOOLEAN DEFAULT true | |
| created_at | TIMESTAMPTZ | |

### `shipping_rates` (optional v1)

| Column | Type | Notes |
|--------|------|--------|
| id | UUID PK | |
| city_or_zone | VARCHAR(100) | |
| price_mad | NUMERIC(10,2) | |
| estimated_days_min | INT | |
| estimated_days_max | INT | |
| is_active | BOOLEAN DEFAULT true | |

Flat rate can be implemented as single row `DEFAULT` instead.

## Indexes

- `products(category_id)`, `products(slug)`
- `product_variants(product_id)`, `product_variants(sku)`
- `orders(public_id)`, `orders(status)`, `orders(created_at DESC)`
- `orders(shipping_phone)`
- `customers(phone)`

## Constraints

- `order_items.quantity` > 0
- `product_variants.price_mad` >= 0
- `orders.total_mad` = `subtotal_mad` + `shipping_mad` (enforced in service layer)

## Seed data

Import from `/sheet` CSVs when ready. Categories at minimum:

1. أملو  
2. زيت أركان  
3. عسل  
4. مكسرات وعسل  
5. هدايا وعروض  

## Future tables (not v1)

- `coupons`
- `reviews`
- `inventory_movements`
- `newsletter_subscribers`

Schema changes require Alembic revision + update this document.
