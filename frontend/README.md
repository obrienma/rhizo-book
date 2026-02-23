# Health Appointment Scheduler — Frontend

Next.js 16 frontend for the Health Appointment Scheduler. Patients can browse providers, book appointments, and manage their schedule. Providers can view and cancel upcoming appointments.

## Stack

- **Next.js 16** + TypeScript + App Router
- **Tailwind CSS** + shadcn/ui components
- **NextAuth v4** for session management (calls the NestJS backend for auth)
- **Axios** with automatic JWT injection
- **react-hook-form** + **zod** for form validation

## Getting Started

See [../docs/DEV_GETTING_STARTED.md](../docs/DEV_GETTING_STARTED.md) for full setup including environment variables.

## Page Map

| Route | Description | Access |
|-------|-------------|--------|
| `/` | Landing page (RhizoBook marketing) | Public |
| `/login` | Sign in | Public |
| `/dashboard` | Patient or provider dashboard | Authenticated |
| `/providers` | Browse all providers | Patient |
| `/providers/[id]` | Provider detail + time slot picker + booking | Patient |
| `/appointments` | Full appointment list with status filter + cancel | Authenticated |

## Project Structure

```
app/
├── (marketing)/
│   └── page.tsx         Landing page (responsive nav, hero, provider/patient CTAs)
├── (app)/
│   ├── layout.tsx        Shared layout with Navigation
│   ├── dashboard/        Renders PatientDashboard or ProviderDashboard by role
│   ├── providers/
│   │   ├── page.tsx      Provider listing
│   │   └── [id]/page.tsx Provider detail + time slot picker + booking
│   └── appointments/     Full appointment list, status filter, cancel dialog
├── api/
│   └── auth/[...nextauth]/  NextAuth route handler
├── login/               Sign-in page
├── icon.svg             App favicon (auto-loaded by Next.js)
├── globals.css
├── layout.tsx           Root layout (fonts, Providers wrapper)
└── providers.tsx        SessionProvider + ThemeProvider
components/
├── dashboards/
│   ├── patient-dashboard.tsx
│   └── provider-dashboard.tsx
├── navigation.tsx       Authenticated top nav (role-aware links, sign out)
└── ui/                  shadcn/ui components
lib/
├── api.ts               Axios instance with Bearer token interceptor
└── utils.ts
types/
└── next-auth.d.ts       Session type extensions (roleName, accessToken)
```
