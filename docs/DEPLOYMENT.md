# Deployment

Both services are deployed on [Render](https://render.com). The database runs on [Neon](https://neon.tech) serverless PostgreSQL.

---

## Backend — Render Web Service

**Live URL:** https://health-scheduler-ts.onrender.com

### Setup

1. Create a new **Web Service** on Render and connect the GitHub repo
2. Set the root directory to `backend`
3. Configure build and start commands:
   - **Build command:** `npm install && npm run build && npx prisma generate && npx prisma migrate deploy`
   - **Start command:** `npm run start:prod`
4. Set environment variables in the Render dashboard:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Neon connection string (pooled URL, `?sslmode=require`) |
| `JWT_SECRET` | Long random string — never commit this |
| `JWT_EXPIRATION` | `7d` |
| `NODE_ENV` | `production` |
| `PORT` | `3001` (Render sets this automatically) |

### Seeding on first deploy

After the first successful deploy, open a Render Shell (Dashboard → your service → Shell) and run:

```bash
npx prisma db seed
```

---

## Frontend — Render Static Site / Web Service

### Setup

1. Create a new **Web Service** on Render and connect the same repo
2. Set the root directory to `frontend`
3. Configure:
   - **Build command:** `npm install && npm run build`
   - **Start command:** `npm run start`
4. Set environment variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://health-scheduler-ts.onrender.com` |
| `NEXTAUTH_URL` | The frontend's Render URL, e.g. `https://health-scheduler-frontend.onrender.com` |
| `NEXTAUTH_SECRET` | Long random string — must match across all frontend instances |

---

## Database — Neon

1. Create a project at [neon.tech](https://neon.tech)
2. Copy the **connection string** from the dashboard (use the pooled URL for production)
3. Paste into `DATABASE_URL` in both local `.env` and Render environment variables
4. Migrations run automatically during deploy via `npx prisma migrate deploy`

### Branches

Neon supports database branching (similar to Git branches). Useful for staging:
- `main` branch → production
- Create a `dev` branch for local or staging use without affecting production data

---

## Continuous Deployment

Render auto-deploys on every push to the `main` branch. The build process automatically runs `prisma migrate deploy` which applies any pending migrations without data loss.

To run migrations manually:

```bash
# From the Render shell or locally with production DATABASE_URL
npx prisma migrate deploy
```

---

## Health Check

The backend exposes `GET /` which returns a simple 200 response. Configure this as the Render health check path to enable zero-downtime deploys.
