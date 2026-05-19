# Tazarzit Bio — Frontend

Next.js 15 · TypeScript · Tailwind CSS · RTL Arabic · shadcn/ui-ready.

## Local setup

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000

## shadcn/ui

`components.json` is configured. Add components with:

```bash
npx shadcn@latest add card
```

## Docker

```bash
docker build -t tazarzit-bio-frontend .
docker run -p 3000:3000 tazarzit-bio-frontend
```
