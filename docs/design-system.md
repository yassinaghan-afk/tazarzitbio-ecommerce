# Design System — Tazarzit Bio

## Design goals

1. **Premium** — generous spacing, restrained color, quality typography
2. **Trust** — clarity, real product photography, visible policies
3. **Mobile-first** — thumb-friendly CTAs, readable Arabic at 16px+ body
4. **RTL-native** — layout mirrors correctly; no “bolted-on” RTL

## Stack

- **Tailwind CSS** — design tokens via `tailwind.config` theme extension
- **shadcn/ui** — accessible primitives (Button, Dialog, Sheet, etc.)
- **Framer Motion** — subtle only (150–300ms, opacity/y, no bounce circus)

## Color tokens (proposed)

| Token | Hex (draft) | Usage |
|-------|-------------|--------|
| `primary` | `#1B4332` | CTAs, links, trust headers |
| `primary-foreground` | `#FFFFFF` | Text on primary |
| `accent` | `#D4A373` | Highlights, argan/honey warmth |
| `accent-foreground` | `#1A1A1A` | Text on accent |
| `background` | `#FAF8F5` | Page background |
| `foreground` | `#1A1A1A` | Body text |
| `muted` | `#6B7280` | Secondary text |
| `border` | `#E5E0D8` | Dividers, cards |
| `destructive` | `#B91C1C` | Errors |
| `success` | `#15803D` | Order confirmed |

Adjust after brand photography review.

## Typography

| Role | Suggestion | Notes |
|------|------------|--------|
| Arabic headlines | **Tajawal** or **Cairo** (700) | Strong, modern MENA premium |
| Arabic body | Same family (400–500) | 16–18px mobile body |
| Latin (weights, codes) | **Inter** or system-ui | Tabular nums for prices |

### Scale (mobile-first)

```
text-xs   12px  — captions, legal
text-sm   14px  — secondary labels
text-base 16px  — body (minimum)
text-lg   18px  — lead paragraphs
text-xl   20px  — card titles
text-2xl  24px  — section titles
text-3xl+       — hero only
```

## Spacing & layout

- Base unit: **4px** (Tailwind default)
- Section padding mobile: `py-12 px-4`; desktop: `py-16 px-6 max-w-6xl mx-auto`
- Card padding: `p-4` mobile, `p-6` desktop
- Touch targets: **min 44×44px**

## RTL rules

- `dir="rtl"` on `<html>`; `lang="ar"`
- Use logical properties: `ms-*`, `me-*`, `ps-*`, `pe-*`, `start`, `end`
- Icons that imply direction (chevrons, arrows) must flip in RTL
- Numbers: prices display `١٢٣٫٤٥ د.م.` or Western digits consistently — pick one site-wide (recommend Western digits + `د.م.` for clarity)

## Components (shadcn mapping)

| Pattern | Component |
|---------|-----------|
| Primary CTA | `Button` variant default, full-width on mobile sticky bars |
| Secondary | `Button` variant outline |
| Product card | Card + Image aspect `1/1` or `4/5` |
| Size/variant picker | `ToggleGroup` or custom pill buttons |
| Cart drawer | `Sheet` side=`left` in RTL (opens from “start”) |
| Modals | `Dialog` — confirm COD, leave checkout |
| Forms | `Input`, `Label`, `Select` — always associated labels |
| Toast | Order success / error |

## Motion (Framer Motion)

**Allowed**

- Fade in sections on scroll (once, `viewport: { once: true }`)
- Sticky bar slide-up on cart add
- Micro scale on button press (`whileTap: { scale: 0.98 }`)

**Avoid**

- Parallax overload
- Infinite animations
- Motion on every list item (stagger max 3–4 items)

```tsx
// Example: subtle section reveal
const fadeUp = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.25 },
  viewport: { once: true },
};
```

## Imagery

- Ratio: product grid **1:1**; hero **16:9** or **3:4** portrait on mobile
- WebP with JPEG fallback; `sizes` for responsive loading
- No stock “honey drip” clichés — real Tazarzit Bio photography only

## Ecommerce UI patterns

- **Sticky mobile ATC** on PDP bottom
- **Trust row** under hero: COD | طبيعي 100% | من سوس | توصيل
- **Bundle cards** with “وفّر X د.م.” when applicable
- **Empty states** in Arabic with single CTA back to catalog

## Accessibility

- WCAG 2.1 AA contrast on text
- Focus rings visible (`ring-2 ring-primary`)
- `alt` text in Arabic for product images
- Form errors linked with `aria-describedby`

See also `frontend-rules.md`.
