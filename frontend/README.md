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

## Development

### Important Commands

- `npm run dev` - Start development server (using Turbopack)
- `npm run typecheck` - Run TypeScript compiler check (`tsc --noEmit`)
- `npm run test` - Run interactive Vitest suite
- `npm run test:run` - Run all tests once
- `npm run check` - Run types and linting in sequence

### Architecture & Patterns

- **Form Validation**: All forms use `react-hook-form` + `zod` with shared schemas in `lib/schemas/`.
- **Hydration Safety**: Auth inputs and buttons use `suppressHydrationWarning` to handle password manager attribute injection (`fdprocessedid`).
- **Shared Components**: High-use components like `Logo` are extracted to `components/auth/` for consistency across splash/auth pages.
- **Testing**: We use Vitest + React Testing Library with `@/` alias support. Mocked services (`api`, `signIn`, `useRouter`) are standardized across test suites.

## Page Map

| Route | Description | Access |
|-------|-------------|--------|
| `/` | Landing page (RhizoBook marketing) | Public |
| `/login` | Sign in with branded RhizoBook theme | Public |
| `/register` | Patient account creation | Public |
| `/register/provider` | Provider registration with clinic profile details | Public |
| `/dashboard` | Patient or provider dashboard | Authenticated |
| `/providers` | Browse all providers | Patient |
| `/providers/[id]` | Provider detail + time slot picker + booking | Patient |
| `/appointments` | Full appointment list with status filter + cancel | Authenticated |

## Project Structure

```
app/
├── (marketing)/
│   └── page.tsx         Landing page (interactive card links to signup)
├── (app)/
│   ├── layout.tsx        Shared layout with Navigation
│   ├── dashboard/        Renders PatientDashboard or ProviderDashboard by role
│   ├── providers/
│   │   ├── page.tsx      Provider listing
│   │   └── [id]/page.tsx Provider detail + time slot picker + booking
│   └── appointments/     Full appointment list, status filter, cancel dialog
├── api/
│   └── auth/[...nextauth]/  NextAuth route handler
├── login/               Sign-in page (branded with RhizoBook styles)
├── register/
│   ├── page.tsx          Patient registration
│   └── provider/page.tsx Provider registration (extended fields)
├── icon.svg             App favicon
├── globals.css
├── layout.tsx           Root layout (fonts, Providers wrapper)
└── providers.tsx        SessionProvider + ThemeProvider
components/
├── auth/
│   └── logo.tsx         Shared RhizoBook SVG logo
├── dashboards/
│   ├── patient-dashboard.tsx
│   └── provider-dashboard.tsx
├── navigation.tsx       Authenticated top nav (role-aware links, sign out)
└── ui/                  shadcn/ui components
lib/
├── api.ts               Axios instance with Bearer token interceptor
├── register.ts          Shared registration submission logic
├── schemas/
│   └── auth.ts          Shared Zod schemas for login/registration
└── utils.ts
```
