# CRO Strategy — Tazarzit Bio

## North-star metrics

| Metric | Target direction | Why |
|--------|------------------|-----|
| **Conversion rate (CVR)** | ↑ | COD reduces payment friction; optimize trust + speed |
| **AOV (MAD)** | ↑ | Bundles, gifts, family packs |
| **Mobile CVR** | ↑ primary | Majority of Moroccan traffic is mobile |
| **Cart abandonment** | ↓ | Simple checkout, WhatsApp recovery (later) |
| **Repeat purchase rate** | ↑ | Quality + post-purchase nurture |

## Funnel stages

```
Traffic → Landing → PDP → Add to cart → Checkout → COD confirm → Delivered
```

Optimize each stage independently; measure in `analytics.md`.

## Homepage

- **Hero:** Slogan + one primary CTA (“تسوق الآن”) + hero product (Amlou)
- **Social proof:** Short testimonials, “X طلبات” when volume allows (only if truthful)
- **Category grid:** Visual, 2 columns mobile
- **Origin block:** Souss story — 3 bullets max
- **Best sellers:** 4–6 SKUs with quick add where variants are simple
- **Gift section:** Drive AOV with boxes/family packs
- **FAQ + COD:** Reduce anxiety before click

## Product detail page (PDP)

- Above fold: image, title, price MAD, size, **أضف إلى السلة**
- Trust bullets: طبيعي 100% · من سوس · COD
- **Cross-sell:** “يُشترى معاً” — honey + amlou, nuts + honey
- Scarcity only if real (low stock from API)
- Long description collapsed (“اقرأ المزيد”)
- Reviews when available

## Cart & AOV

- **Free shipping threshold** (e.g. over 300 MAD) — display progress bar
- **Upsell in cart:** Upgrade to family pack or add honey mini
- **Bundle discount** visible in MAD, not %
- Minimize fields before checkout — collect essentials on checkout step only

## Checkout (COD)

- Guest checkout only in v1
- Phone number **required** — primary confirmation channel
- City + address + notes; optional landmark
- **Order summary** sticky on mobile
- Explicit COD copy: “ستدفع عند الاستلام — لا حاجة لبطاقة بنكية”
- Single primary button: “تأكيد الطلب”

See `checkout-flow.md`.

## Mobile-specific

- Sticky ATC on PDP
- Large tap targets
- Autocomplete cities (Morocco list) to reduce typos
- Click-to-call / WhatsApp on confirmation page

## Trust & risk reversal

- Delivery time estimate by city tier
- Return/refund policy link in footer and checkout
- Real product photos on every SKU
- “اتصل بنا للتأكيد” expectation set before submit

## Experiment backlog (prioritized)

| # | Hypothesis | Surface |
|---|------------|---------|
| 1 | Family pack on home ↑ AOV | Home |
| 2 | Sticky ATC ↑ mobile add-to-cart | PDP |
| 3 | Free shipping bar ↑ AOV | Cart |
| 4 | Shorter checkout form ↑ CVR | Checkout |
| 5 | WhatsApp order recap ↓ no-shows | Post-order |
| 6 | Arabic video on PDP ↑ trust | PDP |

Run one major test at a time; document winners in this file.

## Anti-patterns

- Fake countdown timers
- Pop-ups on first visit (delay or exit-intent only later)
- Hidden delivery fees
- Forcing account creation

## Segments (Morocco)

See `icp-morocco.md` — tailor hero and bundles per campaign (gifts Ramadan, Eid, home daily use).
