# Deployment

The backend is deployed on [Railway](https://railway.app), the frontend on [Vercel](https://vercel.com). The database runs on [Neon](https://neon.tech) serverless PostgreSQL.

---

## Backend — Railway

**Live URL:** https://api.rhizobook.cyberrhizome.ca

### Setup

1. Create a new project on [Railway](https://railway.app) and connect the GitHub repo
2. Set the **Root Directory** to `backend`
3. Configure build and start commands in the Railway service settings:
   - **Build command:** `npm install && npm run build && npx prisma generate && npx prisma migrate deploy`
   - **Start command:** `npm run start:prod`
4. Add a custom domain `api.rhizobook.cyberrhizome.ca` in Railway → Settings → Networking
5. Set environment variables in the Railway dashboard:

| Variable | Value |
|----------|---------|
| `DATABASE_URL` | Neon connection string (pooled URL, `?sslmode=require`) |
| `JWT_SECRET` | Long random string — never commit this |
| `JWT_EXPIRATION` | `7d` |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | `https://rhizobook.cyberrhizome.ca` |

### Seeding on first deploy

After the first successful deploy, open a Railway shell (Dashboard → your service → Shell) and run:

```bash
npx prisma db seed
```

---

## Frontend — Vercel

**Live URL:** https://rhizobook.cyberrhizome.ca

### Setup

1. Create a new project on [Vercel](https://vercel.com) and connect the GitHub repo
2. Set the **Root Directory** to `frontend`
3. Add a custom domain `rhizobook.cyberrhizome.ca` in Vercel → Settings → Domains
4. Vercel auto-detects Next.js — no build or start commands needed
5. Set environment variables in the Vercel dashboard:

| Variable | Value |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | `https://api.rhizobook.cyberrhizome.ca` |
| `NEXTAUTH_URL` | `https://rhizobook.cyberrhizome.ca` |
| `NEXTAUTH_SECRET` | Long random string — must match across all frontend instances |

---

## Database — Neon

1. Create a project at [neon.tech](https://neon.tech)
2. Copy the **connection string** from the dashboard (use the pooled URL for production)
3. Paste into `DATABASE_URL` in both local `.env` and the Railway (backend) environment variables
4. Migrations run automatically during deploy via `npx prisma migrate deploy`

### Branches

Neon supports database branching (similar to Git branches). Useful for staging:
- `main` branch → production
- Create a `dev` branch for local or staging use without affecting production data

---

## Continuous Deployment

**Backend (Railway):** Auto-deploys on every push to `main`. The build process automatically runs `prisma migrate deploy` which applies any pending migrations without data loss.

**Frontend (Vercel):** Auto-deploys on every push to `main`. Preview deployments are created for every pull request.

To run migrations manually:

```bash
# From the Railway shell (backend service) or locally with production DATABASE_URL
npx prisma migrate deploy
```

---

## Health Check

The backend exposes `GET /` which returns a simple 200 response. Configure this as the Railway health check path to enable zero-downtime deploys.
