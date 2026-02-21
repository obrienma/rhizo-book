# Architecture

## Overview

Health Appointment Scheduler is a monorepo containing a NestJS REST API backend and a Next.js frontend. They are deployed as separate services and communicate over HTTP.

```
┌─────────────────────┐        HTTPS         ┌──────────────────────────┐
│   Next.js Frontend  │ ──────────────────► │   NestJS Backend API     │
│   (Next.js 15)      │ ◄──────────────────  │   (NestJS 11 / Node.js)  │
│   Port 3000         │      JSON / JWT      │   Port 3001              │
└─────────────────────┘                      └────────────┬─────────────┘
                                                          │ Prisma ORM
                                                          ▼
                                              ┌──────────────────────────┐
                                              │  PostgreSQL (Neon)       │
                                              │  Serverless / hosted     │
                                              └──────────────────────────┘
```

---

## Backend (`/backend`)

### Module Map

```
AppModule
├── ConfigModule        (global env config)
├── PrismaModule        (global DB client)
├── AuthModule          POST /auth/register, POST /auth/login
├── UsersModule         GET  /users, GET  /users/:id
├── ProvidersModule     GET  /providers, GET  /providers/:id
└── AppointmentsModule  POST/GET /appointments, GET/PATCH /appointments/:id/cancel
```

### Directory Structure

```
src/
├── auth/
│   ├── strategies/        jwt.strategy.ts — validates Bearer token
│   ├── guards/            jwt-auth.guard.ts
│   ├── decorators/
│   ├── dto/               login.dto.ts, register.dto.ts, auth-response.dto.ts
│   ├── auth.controller.ts
│   └── auth.service.ts    register(), login(), generateToken()
├── users/
│   ├── entities/          user.entity.ts (Swagger response shape)
│   ├── dto/
│   ├── users.controller.ts
│   └── users.service.ts
├── providers/
│   ├── entities/          provider.entity.ts, availability-slot.entity.ts
│   ├── dto/
│   ├── providers.controller.ts
│   └── providers.service.ts  findAll(), findOne() — includes availability slots
├── appointments/
│   ├── entities/          appointment.entity.ts
│   ├── dto/               create-appointment.dto.ts, cancel-appointment.dto.ts
│   ├── appointments.controller.ts
│   └── appointments.service.ts  create(), findAll(), findOne(), cancel()
├── prisma/
│   └── prisma.service.ts  (global PrismaClient wrapper)
└── main.ts               Bootstrap, Swagger setup, CORS, ValidationPipe
```

### Authentication Flow

```
Client                        Backend                      Database
  │                              │                             │
  ├─ POST /auth/login ──────────►│                             │
  │  { email, password }         ├─ findUnique(email) ────────►│
  │                              │◄─ user + hashed pw ─────────┤
  │                              ├─ bcrypt.compare()           │
  │                              ├─ jwtService.sign(payload)   │
  │◄─ { user, access_token } ───┤                             │
  │                              │                             │
  ├─ GET /appointments ─────────►│                             │
  │  Authorization: Bearer <jwt> ├─ JwtAuthGuard validates     │
  │                              ├─ Extracts req.user          │
  │                              ├─ Queries appointments ─────►│
  │◄─ [...appointments] ────────┤◄─ results ──────────────────┤
```

JWT payload: `{ sub: userId, email, roleId, roleName }`

### Role-based Access

| Endpoint | Provider | Patient |
|----------|----------|---------|
| `GET /providers` | ✅ | ✅ |
| `POST /appointments` | ❌ | ✅ |
| `GET /appointments` | own only | own only |
| `PATCH /appointments/:id/cancel` | own only | own only |
| `GET /users` | ✅ | ✅ |

---

## Frontend (`/frontend`)

### Page Map

```
app/
├── page.tsx                 → redirects to /dashboard or /login
├── login/page.tsx           → NextAuth sign-in form
├── dashboard/page.tsx       → renders ProviderDashboard or PatientDashboard
├── providers/
│   ├── page.tsx             → provider listing (patients only)
│   └── [id]/page.tsx        → provider detail + booking form
└── appointments/page.tsx    → full appointment list with status filter + cancel
```

### Auth Flow (Frontend)

NextAuth `CredentialsProvider` calls `POST /auth/login` on the backend, receives the JWT, and stores it in the Next.js session. The custom `lib/api.ts` Axios instance automatically attaches `Authorization: Bearer <token>` to every request via an interceptor.

```
NextAuth session
  └── user.accessToken  (JWT from backend)
        ↓
  lib/api.ts interceptor
        ↓
  axios.defaults.headers.Authorization = 'Bearer <token>'
```

---

## Data Model

```
Role (1) ──────────── (N) User
                            │
              ┌─────────────┼──────────────┐
              │             │              │
    ProviderProfile   PatientProfile   Appointment (N)
              │                            │
    AvailabilitySlot (N)          providerId / patientId → User
```

### Key relationships

- `User.roleId` → `Role.id` (provider | patient)
- `ProviderProfile.userId` → `User.id` (1-to-1)
- `PatientProfile.userId` → `User.id` (1-to-1)
- `AvailabilitySlot.providerId` → `ProviderProfile.id` (**not** User.id)
- `Appointment.providerId` → `User.id`
- `Appointment.patientId` → `User.id`

### AppointmentStatus enum

`SCHEDULED` → `COMPLETED` | `CANCELLED` | `NO_SHOW`

---

## API Documentation

Swagger UI is available at `/api` when the backend is running:

- Local: http://localhost:3001/api
- Production: https://health-scheduler-ts.onrender.com/api
