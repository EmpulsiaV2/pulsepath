# PulsePath ⚡

A precision-designed daily routine tracker. Schedule tasks for specific days of the week, swipe to complete or delete, track streaks, get push notifications.

**Stack:** Next.js 15 · TypeScript · Tailwind CSS · Framer Motion · Prisma · Neon PostgreSQL · NextAuth

---

## Setup

### 1 — Install

```bash
npm install
```

### 2 — Create a Neon database

1. Sign up at [neon.tech](https://neon.tech) (free tier is plenty)
2. Create a new project → copy the connection string

### 3 — Environment variables

```bash
cp .env.example .env.local
```

Fill in:

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | Neon dashboard → Connection Details |
| `DIRECT_URL` | Same as DATABASE_URL (Neon supports both) |
| `NEXTAUTH_SECRET` | Run: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `http://localhost:3000` locally |

### 4 — Push schema to database

```bash
npx prisma db push
```

### 5 — Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel

### 1 — Push to GitHub

```bash
git init && git add . && git commit -m "init"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2 — Import on Vercel

1. [vercel.com/new](https://vercel.com/new) → Import your repo
2. Add environment variables:
   - `DATABASE_URL` — your Neon connection string
   - `DIRECT_URL` — same as DATABASE_URL
   - `NEXTAUTH_SECRET` — your generated secret
   - `NEXTAUTH_URL` is set automatically by Vercel ✓

3. Deploy — Prisma client generates automatically via `postinstall`

### 3 — Initialize production database

```bash
# Run once after first deploy, pointing at your production DB
DATABASE_URL="<neon-production-url>" npx prisma db push
```

---

## Cron Job

`vercel.json` schedules `/api/cleanup` at **2 AM UTC daily** — deletes task completion history older than 7 days.

To protect the endpoint, set `CRON_SECRET` in your env vars.

---

## Swipe controls

| Gesture | Action |
|---|---|
| Swipe **left** | ✅ Complete / undo |
| Swipe **right** | 🗑️ Delete |

---

## Weekly scheduling

Each task has a `recurDays` field — an array of day abbreviations (`mon`, `tue`, `wed`, `thu`, `fri`, `sat`, `sun`). The dashboard only shows tasks scheduled for today's day of the week.

**Presets available in the task modal:**
- Every day
- Weekdays (Mon–Fri)
- Weekends (Sat–Sun)
- Mon / Wed / Fri

---

## Project structure

```
pulsepath/
├── app/
│   ├── (auth)/         login · signup · forgot-password
│   ├── (app)/          dashboard · timeline · stats · settings
│   ├── api/            tasks · stats · notifications · account · cleanup
│   └── page.tsx        landing page
├── components/
│   ├── navigation/     BottomNav (safe-area aware)
│   ├── tasks/          SwipeableTaskCard · TaskModal
│   └── ui/             Confetti · Skeletons
├── hooks/              useServiceWorker · useTaskNotifications
├── lib/                auth · db · utils
├── public/             manifest.json · sw.js · icons/
└── prisma/             schema.prisma
```
