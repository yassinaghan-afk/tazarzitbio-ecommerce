# SEO Strategy — Tazarzit Bio

## Goals

1. Rank for **high-intent Moroccan Arabic** product queries
2. Build **brand searches** for “Tazarzit Bio” / “تازارزيت بيو”
3. Support **conversion** — meta copy mentions COD and trust

## Technical SEO (Next.js)

- Server-rendered catalog and PDP
- Clean URLs: `/products/amlou-classic` (Latin slug) + Arabic H1 on page
- `sitemap.xml` — products, categories, static pages
- `robots.txt` — allow catalog; disallow `/admin`, `/api`
- Canonical tags on all indexable pages
- `hreflang` — `ar-MA` primary; `fr-MA` when French pages exist
- Core Web Vitals: LCP, INP, CLS within Google “good” thresholds
- HTTPS only in production

## On-page template

| Element | Pattern |
|---------|---------|
| **Title** | `{Product AR} \| Tazarzit Bio — من قلب سوس` (≤ 60 chars ideal) |
| **Meta description** | Benefit + COD + طبيعي (≤ 155 chars) |
| **H1** | Product name Arabic |
| **H2** | المكونات، منطقة المنشأ، التوصيل |
| **Alt images** | `{product} طبيعي من سوس — Tazarzit Bio` |

## Keyword themes (Arabic-first)

| Theme | Example queries |
|-------|-----------------|
| Amlou | أملو طبيعي، أملو بالفستق، أملو سوس |
| Argan | زيت أركان أصلي، زيت أركان للأكل |
| Honey | عسل طبيعي المغرب |
| Gifts | علبة هدايا أملو، هدية من سوس |
| Brand | تازارزيت بيو، Tazarzit Bio |

Map one primary keyword per PDP; secondary in body copy naturally (see `copywriting-guide.md`).

## Content plan

| Page type | Purpose |
|-----------|---------|
| Home | Brand + categories + trust |
| Category | Index amlou, honey, gifts, etc. |
| PDP | Transactional SEO |
| Blog (phase 2) | Recipes, Souss origin stories, Eid gift guides |
| Static | من نحن، التوصيل والدفع، الأسئلة الشائعة |

## Structured data

- **Organization** on home
- **Product** on PDP: name, image, price, `priceCurrency: MAD`, availability
- **BreadcrumbList** on PDP and category
- **FAQPage** on FAQ when content stable

Validate with Google Rich Results Test before launch.

## Local / Morocco

- Google Business Profile if physical pickup point exists
- NAP consistency (name, address, phone) in footer
- Moroccan phone in `tel:` link

## Link building

- Food bloggers Morocco
- Souss tourism / culture sites (authentic partnerships)
- Press kits for gift seasons
- No paid link farms

## French layer (optional)

- `/fr/...` or `?lang=fr` for secondary indexation
- Unique titles/descriptions — not machine-translated garbage

## Measurement

- Google Search Console — property per domain
- Track queries, CTR, indexing errors
- See `analytics.md`

## Avoid

- Duplicate PDPs for same SKU
- Thin category pages (min 150 words unique copy)
- Keyword stuffing in Arabic
- Blocking JS/CSS in robots

Update quarterly with Search Console query export.
