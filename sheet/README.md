# Sheet — Catalog source data

This folder holds **product and pricing spreadsheets** used as the source of truth before data is imported into PostgreSQL (`tazarzitbio`).

## Intended files (to add)

- `products.csv` — SKU, name (AR/FR), category, weight, price MAD, stock flags
- `bundles.csv` — Gift boxes and family packs composition
- `copy.csv` — Marketing descriptions aligned with [`docs/copywriting-guide.md`](../docs/copywriting-guide.md)

## Rules

- Prices in **MAD** only
- Arabic product names are canonical; French optional for SEO
- Do not commit customer PII or order exports here
