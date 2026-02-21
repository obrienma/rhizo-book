# Health Appointment Scheduler — Frontend

Next.js 15 frontend for the Health Appointment Scheduler. Patients can browse providers, book appointments, and manage their schedule. Providers can view and cancel upcoming appointments.

## Stack

- **Next.js 15** + TypeScript + App Router
- **Tailwind CSS** + shadcn/ui components
- **NextAuth** for session management (calls the NestJS backend for auth)
- **Axios** with automatic JWT injection

## Getting Started

See [../docs/DEV_GETTING_STARTED.md](../docs/DEV_GETTING_STARTED.md) for full setup including environment variables.

```bash
npm install
npm run dev          # http://localhost:3000
```

## Scripts

```bash
npm run dev          # development server with hot reload
npm run build        # production build
npm run start        # run production build
npm run lint         # ESLint
```

## Environment Variables

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
```

## Page Map

| Route | Description | Access |
|-------|-------------|--------|
| `/login` | Sign in | Public |
| `/dashboard` | Patient or provider dashboard | Authenticated |
| `/providers` | Browse all providers | Patient |
| `/providers/[id]` | Provider detail + booking form | Patient |
| `/appointments` | All appointments with filter + cancel | Authenticated |

## Project Structure

```
app/
├── login/               Sign-in page (NextAuth)
├── dashboard/           Renders PatientDashboard or ProviderDashboard
├── providers/
│   ├── page.tsx         Provider listing
│   └── [id]/page.tsx    Provider detail + time slot picker + booking
└── appointments/        Full appointment list, status filter, cancel dialog
components/
├── dashboards/
│   ├── patient-dashboard.tsx
│   └── provider-dashboard.tsx
├── navigation.tsx
└── ui/                  shadcn/ui components
lib/
├── api.ts               Axios instance with Bearer token interceptor
└── utils.ts
types/
└── next-auth.d.ts       Session type extensions
```


## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```
