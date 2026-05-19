# Analytics — Tazarzit Bio

## Objectives

Measure **traffic → engagement → cart → checkout → order** with enough detail to run CRO experiments (`cro-strategy.md`) without violating privacy expectations in Morocco.

## Tooling (recommended)

| Tool | Role |
|------|------|
| **Google Analytics 4** | Web analytics, funnels, audiences |
| **Google Search Console** | SEO performance |
| **Meta Pixel** (optional) | Paid social attribution |
| **Server-side order logs** | Source of truth for revenue |

Plausible or Umami acceptable if GDPR-style simplicity preferred — document choice at implementation.

## GA4 events (ecommerce)

| Event | When | Key params |
|-------|------|--------------|
| `view_item` | PDP load | `item_id`, `item_name`, `price`, `currency: MAD` |
| `view_item_list` | Category | `item_list_name` |
| `add_to_cart` | ATC click | `items`, `value`, `currency` |
| `remove_from_cart` | Remove line | `items` |
| `view_cart` | Cart page/drawer open | `value` |
| `begin_checkout` | Checkout step 1 | `value`, `items` |
| `add_shipping_info` | City selected | — |
| `purchase` | Order success page | `transaction_id`, `value`, `items` |

Use [GA4 ecommerce schema](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce).

## Custom events

| Event | Purpose |
|-------|---------|
| `click_whatsapp` | Support / recovery |
| `click_call` | Phone CTA |
| `cod_info_view` | User opened COD explanation |
| `bundle_upsell_click` | AOV tracking |
| `newsletter_signup` | If added later |

## UTM convention

```
?utm_source=instagram&utm_medium=paid&utm_campaign=eid-gift-2026
```

| Param | Values (examples) |
|-------|-------------------|
| `source` | instagram, facebook, google |
| `medium` | organic, paid, email |
| `campaign` | slug-lowercase-hyphens |

Store UTMs on order record at checkout when present (backend).

## Dashboards (weekly review)

1. **Acquisition** — sessions by channel, landing page  
2. **Conversion** — CVR by device (mobile vs desktop)  
3. **Revenue** — orders, AOV, revenue MAD (from DB, reconcile GA4)  
4. **Funnel** — PDP → cart → checkout → purchase drop-off  
5. **SEO** — GSC clicks/impressions top queries  

## Privacy & consent

- Cookie banner if using non-essential cookies (Meta Pixel)
- Privacy policy in Arabic — what is collected
- Do not send PII (phone, full address) to GA4 in event params
- Hash or omit customer identifiers in third-party tools

## Data quality

- Single `purchase` per `transaction_id` (dedupe on frontend)
- Backend webhook or success page triggers purchase event once
- Exclude admin/staging traffic via hostname filter or `debug_mode` off in prod

## KPI targets (set baselines post-launch)

| KPI | Notes |
|-----|--------|
| Mobile CVR | Primary |
| AOV (MAD) | Track weekly |
| Cart abandonment rate | |
| Bounce rate on home | Improve with CRO |
| Organic share of sessions | SEO health |

## Implementation notes (frontend)

- Load GA4 via `next/script` strategy `afterInteractive`
- Consent mode v2 if EU visitors ever — Morocco-focused site may still use for ad platforms
- Environment: `NEXT_PUBLIC_GA_MEASUREMENT_ID`

## Implementation notes (backend)

- Log order created with: `order_id`, `total_mad`, `utm_*`, `user_agent` hash optional
- Admin export CSV for finance — not in GA4

Align event names with marketing before go-live; changing later breaks funnel history.
