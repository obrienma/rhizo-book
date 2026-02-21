# Health Appointment Scheduler — Backend

NestJS REST API powering the Health Appointment Scheduler. Provides JWT authentication, provider and appointment management, and a fully documented Swagger UI.

## Stack

- **NestJS 11** + TypeScript
- **Prisma 6** + PostgreSQL (Neon)
- **Passport / JWT** authentication
- **Swagger / OpenAPI** at `/api`

## Getting Started

See [../docs/DEV_GETTING_STARTED.md](../docs/DEV_GETTING_STARTED.md) for full setup including environment variables, migrations, and seeding.

```bash
npm install
npm run start:dev        # http://localhost:3001
```

API docs: http://localhost:3001/api

## Scripts

```bash
npm run start:dev        # watch mode
npm run start:prod       # run compiled dist/

npm run build            # compile TypeScript
npm run lint             # ESLint + fix
npm run test             # unit tests
npm run test:cov         # coverage

npx prisma studio        # visual database browser
npx prisma migrate dev   # apply + create migrations
npx prisma db seed       # seed with sample data
npx prisma generate      # regenerate client after schema changes
```

## Project Structure

```
src/
├── auth/               POST /auth/register, POST /auth/login
├── users/              GET  /users, GET  /users/:id
├── providers/          GET  /providers, GET  /providers/:id
├── appointments/       POST /appointments
│                       GET  /appointments
│                       GET  /appointments/:id
│                       PATCH /appointments/:id/cancel
├── prisma/             Global PrismaService
└── main.ts             Entry point, Swagger setup
prisma/
├── schema.prisma       Database schema
├── migrations/         Migration history
└── seed.ts             Sample data (3 providers, 3 patients, 8 appointments)
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `JWT_SECRET` | Secret used to sign JWTs |
| `JWT_EXPIRATION` | Token lifetime e.g. `7d` |
| `PORT` | Port to listen on (default `3001`) |
