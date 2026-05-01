# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

RhizoBook is a full-stack healthcare appointment scheduling app. Patients browse providers, book appointments, and manage their schedule. Providers view and cancel appointments. Backend is NestJS on Railway; frontend is Next.js on Vercel; database is PostgreSQL on Neon.

## Commands

### Backend (`/backend`)
```bash
npm run start:dev       # watch mode (port 3001)
npm run build           # compile to dist/
npm run lint            # ESLint with autofix
npm test                # Jest unit tests
npx jest SomeName       # run a single test file by name pattern
npm run test:cov        # coverage report
npx prisma studio       # visual DB browser
npx prisma migrate dev  # apply new migrations in dev
npx prisma db seed      # re-seed sample data
npx prisma generate     # regenerate client after schema changes
```

### Frontend (`/frontend`)
```bash
NEXTAUTH_URL=http://localhost:3002 npm run dev -- -p 3002   # if port 3000 is taken
npm run dev             # dev server on port 3000 (normal case)
npm run typecheck       # tsc --noEmit
npm run lint            # ESLint
npx vitest run          # run all tests once
npx vitest run __tests__/components/navigation.test.tsx     # run a single test file
```

## Environment variables

### `frontend/.env.local`
```
BACKEND_URL=http://localhost:3001      # server-side only — used by Next.js rewrites and auth handler
NEXTAUTH_URL=http://localhost:3000     # must match the actual port the frontend is running on
NEXTAUTH_SECRET=...
```

### `backend/.env`
```
DATABASE_URL=...
JWT_SECRET=...
JWT_EXPIRATION=7d
PORT=3001
FRONTEND_URL=http://localhost:3000     # used for CORS
```

## Architecture

### Backend — NestJS (src/)
One module per domain: `auth`, `users`, `providers`, `appointments`. Each follows the NestJS pattern: `module → controller → service → Prisma`.

**Auth:** `JwtAuthGuard` (`auth/jwt-auth.guard.ts`) is applied **per controller** (not globally). Public endpoints — `GET /v1/providers` and `GET /v1/providers/:id` — have no guard. All appointment routes use `@UseGuards(JwtAuthGuard)` at the controller level.

**Prisma:** Injected via `PrismaService` (singleton in `PrismaModule`). In unit tests, use `mockPrismaService()` from `src/test-utils/prisma.mock.ts` — never instantiate PrismaService directly in tests.

**Public provider API:** Only returns `id`, `name`, and explicit `providerProfile` fields (`specialty`, `bio`, `appointmentDuration`). Email and `licenseNumber` are intentionally excluded. Availability slots return only `id`, `dayOfWeek`, `startTime`, `endTime`.

**Provider search:** `GET /v1/providers?specialty=` is the only supported filter. Location search is on the roadmap but not implemented — `ProviderProfile` has no location column. The marketing page search bar intentionally has only the specialty field; the location input was removed to avoid presenting a non-functional UI.

### Frontend — Next.js (app/)
Two route groups share the same layout (`(app)/layout.tsx` with `<Navigation>`):
- `(app)/` — authenticated + unauthenticated routes alike (dashboard, appointments, providers list, provider detail). No middleware blocks unauthenticated access; individual pages handle it.
- `(marketing)/` — public landing page.

**API calls:** Browser-side code uses relative `/v1/...` paths, which `next.config.ts` rewrites to `BACKEND_URL`. Never hardcode `localhost:3001` in component code.

**Two axios instances:**
- `lib/api.ts` — authenticated client (`baseURL: '/v1'`, attaches JWT from session via interceptor). Use for all patient/provider actions requiring login.
- Plain `axios.get('/v1/...')` — unauthenticated calls (provider search/detail pages).

**Auth:** NextAuth v4 with JWT strategy. `lib/auth.ts` calls `BACKEND_URL` directly (server-to-server). The `callbackUrl` on `signOut` must use `window.location.origin` so it resolves to the actual running port rather than NextAuth's default.

## TypeScript conventions
- Strict mode throughout
- Prefer `const` over `let`
- Add `suppressHydrationWarning` to `<Input>` and submit `<Button>` in auth forms (password manager attribute injection)

## Frontend styling conventions
- Branding and colour palette follow `app/(marketing)/page.tsx` and `app/register/`
- Login and register pages must include: Logo wrapped in `<Link href="/">` and an explicit `← Back to home` link
- Navigation cards that route elsewhere must be `<Link>` wrappers (not `<div>` with nested `<a>`)

## Testing patterns

**Backend (Jest):** Controller tests mock the service with `jest.fn()` stubs. Service tests use `mockPrismaService()`. Run a single file: `npx jest providers`.

**Frontend (Vitest + Testing Library):** Tests live in `__tests__/`. Mock `next-auth/react`, `next/link`, and `next/navigation` as needed. Run a single file by passing its path to `npx vitest run`.

- **Maintain `LEARNING_LOG.md`**: After each phase, append new entries for every pattern used, anti-pattern avoided, challenge encountered, or design decision made. Use the established entry format (Pattern / Anti-Pattern / Challenge / Decision sections with **Q:**/**A:** flashcard blocks). User calls this "ll".
## ADR files
Create decision logs according to https://martinfowler.com/bliki/ArchitectureDecisionRecord.html

