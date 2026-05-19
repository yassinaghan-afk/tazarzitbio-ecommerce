# QA Checklist — Tazarzit Bio

Use before each release (staging → production). Check **Pass / Fail / N/A**.

## Global

- [ ] Site loads over HTTPS with valid certificate
- [ ] Default language Arabic; `dir="rtl"` on document
- [ ] No console errors on home, PDP, cart, checkout
- [ ] No references to Dentclino or wrong brand assets
- [ ] All prices show `د.م.` (MAD)
- [ ] COD messaging visible; no card payment fields

## Responsive / mobile

- [ ] iPhone Safari: home, PDP, cart, checkout usable
- [ ] Android Chrome: same
- [ ] Sticky ATC visible on PDP mobile
- [ ] Tap targets ≥ 44px
- [ ] No horizontal scroll on 375px width
- [ ] Keyboard does not hide submit on checkout

## RTL & Arabic

- [ ] Layout mirrors correctly (nav, cart sheet, chevrons)
- [ ] Arabic product names display correctly (no tofu boxes)
- [ ] Form labels and errors in Arabic
- [ ] Numbers and currency format consistent site-wide

## Catalog

- [ ] All active products load from API
- [ ] Category filters work
- [ ] Out-of-stock SKU cannot checkout (or shows clear message)
- [ ] Images load with alt text
- [ ] PDP shows ingredients/description for each product type

## Cart

- [ ] Add / update quantity / remove works
- [ ] Totals match backend calculation
- [ ] Cart persists on refresh (if localStorage enabled)
- [ ] Upsell/bundle links work (when implemented)

## Checkout (COD)

- [ ] Required field validation (name, phone, city, address)
- [ ] Invalid Moroccan phone rejected with Arabic message
- [ ] Shipping cost updates by city/rules
- [ ] Order summary matches cart
- [ ] Double-submit prevented
- [ ] Success page shows `public_id` and total
- [ ] `purchase` analytics fires once per order

## API / backend

- [ ] `GET /health` returns ok
- [ ] Order create stores correct snapshots on `order_items`
- [ ] Price tampering in client cannot lower total (server validation)
- [ ] Admin login required for admin routes
- [ ] CORS blocks unknown origins
- [ ] Rate limit on order create behaves as expected

## SEO

- [ ] Unique title/description per PDP
- [ ] `sitemap.xml` accessible
- [ ] `robots.txt` correct for environment
- [ ] Structured data validates (Rich Results Test)
- [ ] Canonical URLs on PDP

## Performance

- [ ] Lighthouse mobile performance ≥ 80 (target)
- [ ] LCP < 2.5s on home (4G throttled spot check)
- [ ] Images use modern formats where supported

## Accessibility

- [ ] Keyboard navigation through checkout
- [ ] Focus visible on interactive elements
- [ ] Color contrast AA on body text and buttons

## Security

- [ ] No secrets in frontend bundle (grep `DATABASE`, `SECRET`)
- [ ] Admin `/docs` not public in production (if applicable)
- [ ] Security headers (HSTS, X-Frame-Options) via proxy

## Deployment (EasyPanel)

- [ ] Env vars set per `env-variables.md`
- [ ] Alembic migrations applied
- [ ] Postgres backup configured
- [ ] Staging test order completed end-to-end
- [ ] Production smoke test after deploy

## Regression smoke (15 min)

1. Open home → open Amlou PDP → add to cart  
2. Open cart → proceed checkout  
3. Fill valid Moroccan phone + address → submit  
4. See confirmation → verify order in admin DB  
5. Change order status in admin → verify API reflects status  

## Sign-off

| Role | Name | Date |
|------|------|------|
| Dev | | |
| Product | | |
| Launch | | |

Log defects with: device, browser, URL, screenshot, steps.
