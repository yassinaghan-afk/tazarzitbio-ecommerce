# Checkout Flow — Tazarzit Bio (COD only)

## Overview

Checkout is **guest-only**, **mobile-optimized**, and **COD-only**. No card, wallet, or bank transfer in v1.

```
Cart → Checkout (form) → Review → Submit → Confirmation
```

## Cart

**Entry:** ATC from PDP, cart icon, or direct `/cart`

**Contents per line**

- Product name (AR)
- Variant (size/weight)
- Quantity stepper
- Line total MAD
- Remove

**Cart-level**

- Subtotal
- Shipping (flat or city-based — config in backend)
- Free-shipping progress bar if threshold enabled
- Optional upsell: family pack / honey add-on
- CTA: **متابعة الطلب** → checkout

**Persistence**

- Client cart in `localStorage` + optional server sync later
- On checkout submit, send full cart snapshot to API (prices validated server-side)

## Checkout form (single page preferred for CVR)

| Field | Required | Validation |
|-------|----------|------------|
| الاسم الكامل | Yes | min 2 chars |
| رقم الهاتف | Yes | Moroccan mobile format |
| المدينة | Yes | Select from list or autocomplete |
| العنوان | Yes | street, quartier, building |
| ملاحظات | No | delivery instructions |
| رقم هاتف بديل | No | optional |

**Not collected in v1:** email (optional field OK), account password, payment details

## COD disclosure (must be visible)

Before submit, show boxed notice:

> **الدفع عند الاستلام**  
> ستدفع المبلغ نقداً عند استلام الطلب. لا نطلب أي دفع إلكتروني.

Checkbox optional: “أفهم أن الدفع يكون عند التسليم” — only if legal advises; otherwise static text is enough.

## Order review block

- Line items (read-only)
- Subtotal, shipping, **المجموع** in MAD
- Estimated delivery window by city tier
- Link: سياسة الإرجاع

## Submit

- Button: **تأكيد الطلب**
- Loading state; disable double-submit
- API: `POST /api/v1/orders` with cart + customer fields
- Server recalculates prices, checks stock flags, creates order `pending`

## Confirmation page

**URL:** `/order/confirmation?order={public_id}`

Display:

- شكراً — تم استلام طلبك
- رقم الطلب
- المجموع MAD
- COD reminder
- Expected contact: “سنتصل بك لتأكيد الطلب خلال 24 ساعة”
- WhatsApp / call CTA if configured
- **تتبع الطلب** — future; hide if not ready

Fire `purchase` analytics once (see `analytics.md`).

## Backend order states (customer-visible subset)

| Status | Customer message |
|--------|------------------|
| `pending` | قيد المراجعة |
| `confirmed` | تم التأكيد — قيد التحضير |
| `shipped` | في الطريق |
| `delivered` | تم التسليم |
| `cancelled` | ملغى |

## Error handling

| Case | UX |
|------|-----|
| Validation error | Inline Arabic under field |
| Out of stock | Remove SKU or reduce qty message |
| Rate limit | “حاول مرة أخرى بعد قليل” |
| Server error | Retry CTA + WhatsApp support |

## Admin flow (post-order)

1. New order notification (email/Telegram — future)
2. Staff calls customer to confirm → `confirmed`
3. Pack and ship → `shipped`
4. COD collected on delivery → `delivered`

## Fraud & no-shows (COD reality)

- Phone confirmation before ship
- Block repeat abusive phones (admin flag)
- Optional minimum order value

## Mobile UX requirements

- Sticky **تأكيد الطلب** bar with total
- Numeric keyboard for phone
- Large inputs, autofill-friendly `autocomplete` attributes

## Out of scope (v1)

- Coupons (document schema for phase 2)
- Split payment
- Pickup points map

Cross-reference: `api-structure.md`, `database-schema.md`, `cro-strategy.md`.
