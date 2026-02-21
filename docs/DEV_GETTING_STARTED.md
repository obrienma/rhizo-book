# Developer Getting Started

## Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- A PostgreSQL database — [Neon](https://neon.tech) free tier works well

---

## 1. Clone and install

```bash
git clone git@github.com:obrienma/health-scheduler-ts.git
cd health-scheduler-ts

# Install backend deps
cd backend && npm install && cd ..

# Install frontend deps
cd frontend && npm install && cd ..
```

---

## 2. Configure environment variables

### Backend — `backend/.env`

```env
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
JWT_SECRET=change-this-to-a-long-random-string
JWT_EXPIRATION=7d
PORT=3001
```

> Get your `DATABASE_URL` from the Neon dashboard → your project → Connection string.

### Frontend — `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=change-this-to-a-long-random-string
```

---

## 3. Run database migrations

```bash
cd backend
npx prisma migrate dev
```

This creates all tables and applies any pending migrations from `prisma/migrations/`.

---

## 4. Seed the database

```bash
cd backend
npx prisma db seed
```

Creates 3 providers, 3 patients, and 8 sample appointments (past/completed, cancelled, and upcoming).

**Test credentials (all passwords: `password123`)**

| Role | Email |
|------|-------|
| Provider | sarah.johnson@clinic.com |
| Provider | mike.chen@clinic.com |
| Provider | priya.patel@clinic.com |
| Patient | alice.smith@email.com |
| Patient | james.nguyen@email.com |
| Patient | emma.wilson@email.com |

> The seed script is idempotent — safe to run multiple times.

---

## 5. Start the backend

```bash
cd backend
npm run start:dev
```

- API: http://localhost:3001
- Swagger UI: http://localhost:3001/api

---

## 6. Start the frontend

In a separate terminal:

```bash
cd frontend
npm run dev
```

- App: http://localhost:3000

---

## Useful commands

### Backend

```bash
npm run start:dev          # watch mode
npm run build              # compile to dist/
npm run start:prod         # run compiled build

npm run test               # unit tests
npm run test:cov           # coverage report

npx prisma studio          # visual DB browser
npx prisma migrate dev     # apply new migrations
npx prisma db seed         # re-seed data
npx prisma generate        # regenerate Prisma client after schema changes
```

### Frontend

```bash
npm run dev                # dev server (hot reload)
npm run build              # production build
npm run lint               # ESLint
```

---

## Common issues

### `401 Unauthorized` on all protected routes
Ensure the JWT token in your session matches the `JWT_SECRET` in `backend/.env`. If you changed the secret, clear cookies/session and log in again.

### `Can't reach database` / Prisma connection error
- Check `DATABASE_URL` in `backend/.env` is correct
- Neon connections require `?sslmode=require` at the end of the URL

### Frontend shows blank page after login
- Confirm `NEXT_PUBLIC_API_URL` in `frontend/.env.local` points to the running backend
- Check the browser console for CORS or network errors
