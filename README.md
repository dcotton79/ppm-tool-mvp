# PPM Tool (Vercel-ready MVP)

- Next.js App Router + Prisma (Postgres) + NextAuth (Credentials)
- Agile board with drag & drop swimlanes by assignee
- Assignee filter + "Only mine" with URL sync and DB prefs
- Burndown & Burnup charts with ideal line + color-coded scope markers (▲ green increase / ▼ red decrease), animated
- Per-user, per-project chart toggles stored in DB
- Vercel build runs Prisma generate + migrate deploy

## Local setup
```bash
cp .env.example .env
# Fill DATABASE_URL + NEXTAUTH_SECRET
npm install
npm run prisma:gen
npm run prisma:migrate
npm run seed          # optional demo data
npm run dev
```

## Deploy (GitHub → Vercel)
- Add env vars: `DATABASE_URL`, `NEXTAUTH_SECRET` (and optionally `NEXTAUTH_URL`)
- Import repo and deploy. Build runs `vercel-build` → `migrate deploy`.
- Visit `/login` to sign in (creates User + Resource).
