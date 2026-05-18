# PulsePath 🔥

A premium daily routine tracker app built with Next.js, TypeScript, Prisma, and Neon PostgreSQL. Features swipe gestures, push notifications, streak tracking, and a beautiful dark UI.

## Features

- ⚡ Beautiful dark UI with glassmorphism and neon accents
- 👆 Swipe right to complete, swipe left to delete tasks
- 🔥 7-day streak tracking with confetti celebrations
- 🔔 Browser push notifications with service workers
- 📅 Timeline view with live time indicator
- 📊 Statistics with 7-day bar charts
- 📱 PWA with "Add to Home Screen" support
- 🔐 Secure auth with NextAuth + bcrypt
- 🗄️ Neon PostgreSQL + Prisma ORM
- 🧹 Auto-cleanup of history older than 7 days (Vercel Cron)

---

## Quick Start

### 1. Clone and install

```bash
git clone <repo>
cd pulsepath
npm install
```

### 2. Create a Neon database

1. Go to [neon.tech](https://neon.tech) and create a free project
2. Copy your connection strings from the Neon dashboard

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
DATABASE_URL="postgresql://user:password@ep-xxxx.us-east-1.aws.neon.tech/pulsepath?sslmode=require"
DIRECT_URL="postgresql://user:password@ep-xxxx.us-east-1.aws.neon.tech/pulsepath?sslmode=require"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Set up the database

```bash
npx prisma db push
npx prisma generate
```

### 5. Run development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Vercel Deployment

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo>
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. Add environment variables in the Vercel dashboard:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Your Neon connection string |
| `DIRECT_URL` | Your Neon direct connection string |
| `NEXTAUTH_SECRET` | A 32+ character random string |
| `NEXTAUTH_URL` | Will be set automatically by Vercel |

3. Deploy!

### 3. Run database migrations on Vercel

After first deploy, Prisma runs `prisma generate` automatically via `postinstall`.

For schema changes, run from local:
```bash
DATABASE_URL="<your-production-url>" npx prisma db push
```

---

## Cron Job (Auto Cleanup)

The `vercel.json` configures a daily cron at 2 AM UTC to delete history older than 7 days:

```json
{
  "crons": [{ "path": "/api/cleanup", "schedule": "0 2 * * *" }]
}
```

To protect the endpoint, add `CRON_SECRET` to your environment variables and it will require `Authorization: Bearer <secret>` header.

---

## Push Notifications

Push notifications work via browser Notification API + Service Worker.

1. Users enable notifications in Settings → Notifications
2. Browser permission is requested
3. Notifications are scheduled client-side based on task times
4. Service worker handles background delivery

For server-side push (optional enhancement), generate VAPID keys:
```bash
npx web-push generate-vapid-keys
```

---

## Database Schema

```
User → Tasks → TaskCompletions
     → Streaks
     → NotificationPrefs
```

History older than 7 days is automatically deleted by the cron job.

---

## Project Structure

```
pulsepath/
├── app/
│   ├── (auth)/          # Login, signup, forgot password
│   ├── (app)/           # Protected app pages
│   │   ├── dashboard/   # Main task view
│   │   ├── timeline/    # Chronological timeline
│   │   ├── stats/       # Statistics & streaks
│   │   └── settings/    # Account & notification settings
│   ├── api/             # API routes
│   └── page.tsx         # Landing page
├── components/
│   ├── navigation/      # Bottom nav
│   ├── tasks/           # Task card, modal
│   └── ui/              # Skeletons, confetti
├── hooks/               # Service worker, notifications
├── lib/                 # Auth, DB, utils
├── prisma/              # Schema
├── public/              # Manifest, icons, service worker
└── types/               # TypeScript types
```

---

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Auth**: NextAuth.js v4
- **ORM**: Prisma
- **Database**: Neon PostgreSQL
- **Deployment**: Vercel

---

Built with ❤️ for peak performance.
