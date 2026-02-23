# RhizoBook | Health Appointment Scheduler

A full-stack healthcare appointment scheduling system built with NestJS, Next.js, and TypeScript. Patients can browse providers, book appointments, and manage their schedule. Providers can view upcoming appointments and manage cancellations.

## Status

- **Backend API** — live at **https://health-scheduler-ts.onrender.com/api** (Swagger UI, currently slow on initial load. Transitioning to Railway for immediate availability.)
- **Frontend** — deployed and functional
- Both services connect to a hosted PostgreSQL database on [Neon](https://neon.tech)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | NestJS 11, TypeScript |
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| Database | PostgreSQL (Neon serverless) |
| ORM | Prisma 6 |
| Auth | JWT + Passport (backend), NextAuth v4 (frontend) |
| Forms | react-hook-form + zod |
| API docs | Swagger / OpenAPI |

## Features

- **Multi-role authentication** — JWT-based login for Providers and Patients via NextAuth
- **Provider discovery** — patients browse providers by specialty with live availability
- **Appointment booking** — time-slot picker generated from provider availability schedules
- **Appointment management** — list, filter by status, and cancel with optional reason
- **Swagger / OpenAPI** — fully documented API with typed request/response schemas
- **Role-based access control** — providers and patients see only their own data
- **Landing page** — public marketing page with provider/patient CTAs

## Quick Start

See [docs/DEV_GETTING_STARTED.md](docs/DEV_GETTING_STARTED.md) for full local setup including environment variables.

```bash
# Backend
cd backend && npm install && npm run start:dev   # http://localhost:3001

# Frontend (separate terminal)
cd frontend && npm install && npm run dev         # http://localhost:3000
```

## Seed Credentials

After running `npx prisma db seed` in the `backend/` directory:

| Role | Email | Password |
|------|-------|----------|
| Provider | sarah.johnson@clinic.com | password123 |
| Provider | mike.chen@clinic.com | password123 |
| Provider | priya.patel@clinic.com | password123 |
| Patient | alice.smith@email.com | password123 |
| Patient | james.nguyen@email.com | password123 |
| Patient | emma.wilson@email.com | password123 |

## Project Structure

```
health-scheduler-ts/
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DEV_GETTING_STARTED.md
│   └── DEPLOYMENT.md
├── backend/                   # NestJS API
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   └── src/
│       ├── auth/
│       ├── users/
│       ├── providers/
│       ├── appointments/
│       └── main.ts
└── frontend/                  # Next.js app
    ├── app/
    │   ├── (marketing)/       # Public landing page
    │   ├── (app)/             # Authenticated routes + shared nav layout
    │   │   ├── dashboard/
    │   │   ├── appointments/
    │   │   └── providers/[id]/
    │   ├── api/auth/          # NextAuth route handler
    │   └── login/
    └── components/
```

## Documentation

| File | Contents |
|------|----------|
| [docs/DEV_GETTING_STARTED.md](docs/DEV_GETTING_STARTED.md) | Local development setup |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design, data model, module map, auth flow |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Render + Neon production deployment |
| [backend/README.md](backend/README.md) | Backend-specific commands and structure |
| [frontend/README.md](frontend/README.md) | Frontend-specific commands and structure |

## Roadmap

- [x] Backend API with full CRUD for appointments
- [x] JWT authentication with role-based access
- [x] Swagger / OpenAPI documentation
- [x] Frontend — patient and provider dashboards
- [x] Booking flow with availability-based time slot picker
- [x] Appointment cancellation with reason
- [x] Public landing page
- [ ] Consistent branding across
- [ ]
- [ ] Email notifications and reminders
- [ ] Calendar view for appointments
- [ ] Recurring availability schedules
- [ ] Timezone handling
- [ ] HIPAA compliance features

## Author

**Amanda O'Brien**


## License

Private and proprietary.
