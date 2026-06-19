# Learning Log

Patterns, anti-patterns, challenges, and decisions encountered during development of RhizoBook.

---

## 2026-06-01 — Post-Registration Provider Context Preservation

### Patterns

**Q:** How do you preserve a user's destination through a multi-step auth flow (browse → register → return)?
**A:** Thread a `callbackUrl` query param through every step. The provider detail page sets it on both the login and register links (`?callbackUrl=/providers/:id`). The register page reads it with `useSearchParams` and passes it to the shared `submitRegistration` helper, which uses it in the final redirect instead of a hardcoded `/dashboard`. The "Already have an account?" link also forwards the callbackUrl to `/login` so neither path loses context.

**Q:** What is the correct signature for a shared auth helper that needs to support optional redirect destinations?
**A:** Add `callbackUrl = '/dashboard'` as a defaulted parameter at the end of the function signature. This keeps all existing call sites working unchanged (they get the default) while allowing callers that have a destination to pass it explicitly. Never hardcode the redirect inside a shared helper.

---

### Anti-Patterns

**Q:** Why is hardcoding `router.push('/dashboard')` inside a shared registration helper a problem?
**A:** It makes the helper impossible to reuse for flows where context matters — any caller that wants a different destination has no way to express it. The correct approach is to accept the destination as a parameter with a sensible default, so the helper is reusable and callers stay in control of where the user lands.

---

### Challenges

**Q:** The login button on the provider detail page already passed `callbackUrl` correctly. Why didn't the register button?
**A:** The two buttons were added at different times — the login path was built first and the pattern was established there. The register button was added later without carrying the pattern over. The inconsistency was only caught when the use case (browse → register → return) was explicitly described. This is a good argument for writing the full user journey as a test or spec before implementing CTAs.

---

### Decisions

**Q:** Should the "Already have an account? Sign in" link on the register page also forward `callbackUrl`?
**A:** Yes. If a user arrives at `/register?callbackUrl=/providers/3` and then decides to sign in instead, the callbackUrl should not be dropped — they still want to end up at the provider page. The link conditionally appends the callbackUrl only when it differs from the default (`/dashboard`) to avoid cluttering the URL in the normal case.

---

## 2026-06-01 — Vercel Production Build Hardening

### Patterns

**Q:** Which Next.js / build-time packages must be in `dependencies` rather than `devDependencies` for a Vercel deployment?
**A:** Any package that is imported or resolved during `next build`: `tailwindcss`, `@tailwindcss/postcss`, `tw-animate-css`, `typescript`, all `@types/*` packages, `eslint`, and `eslint-config-next`. Vercel sets `NODE_ENV=production` and skips `devDependencies`, so anything the build toolchain touches at compile time must be in `dependencies`. Test-only packages (`vitest`, `@testing-library/*`, `jsdom`, `@vitejs/plugin-react`) are safe to leave in `devDependencies` because they are never imported during the build.

**Q:** How do you stop `vitest.config.ts` from breaking the Next.js TypeScript check while keeping local type safety for tests?
**A:** Add `vitest.config.ts` to the `exclude` array in `tsconfig.json` and remove `"types": ["vitest/globals"]` from `compilerOptions`. Create a separate `tsconfig.test.json` that extends the main one and re-adds the vitest globals type, covering `vitest.config.ts` and `__tests__/`. Vitest picks this up automatically because it searches for the nearest tsconfig.

**Q:** What is the required pattern for using `useSearchParams()` in a Next.js App Router page?
**A:** The hook must be called inside a component wrapped in `<Suspense>`. The exported page component should be a thin wrapper that renders `<Suspense><InnerComponent /></Suspense>`; all hook usage lives in the inner component. Without this, static generation (`next build`) throws and the build fails.

---

### Anti-Patterns

**Q:** Why can't you rely on `devDependencies` for build-time tooling on Vercel?
**A:** Vercel's production build environment runs `npm install --omit=dev` (equivalent), so devDependencies are never installed. Packages that work fine locally — where all deps are always present — will cause module-not-found errors at build time on Vercel.

---

### Challenges

**Q:** The `@tailwindcss/postcss` error was the first to surface, but it wasn't the only misplaced package. How were the others found?
**A:** Each Vercel build revealed the next missing package in sequence: first `@tailwindcss/postcss`, then `typescript`/`@types/*` (TypeScript check stage), then `eslint`/`eslint-config-next` (lint stage), then `vitest` (picked up via `vitest.config.ts` during TS compilation). The fix was to move all build-time packages in one pass rather than waiting for each redeploy.

**Q:** Removing `"types": ["vitest/globals"]` from `tsconfig.json` broke test file type checking — `describe`, `it`, `expect` lost their types. How was it resolved?
**A:** A separate `tsconfig.test.json` extending the main config was created with `"types": ["vitest/globals"]` scoped only to test files. This keeps the main tsconfig clean for the Next.js build while restoring types in `__tests__/`.

---

### Decisions

**Q:** Should `vitest` be moved to `dependencies` to fix the `vitest/config` type error, or should the tsconfig be fixed instead?
**A:** Fix the tsconfig. Moving a test runner to `dependencies` ships unnecessary code to production and is the wrong layer to solve a build-configuration problem. The correct fix is to exclude `vitest.config.ts` from the Next.js compilation scope.

---

## 2026-05-29 — In-App Calendar View

### Patterns

**Q:** How do you wire up `react-big-calendar` with a `date-fns` localizer in a Next.js app?
**A:** Import `dateFnsLocalizer` from `'react-big-calendar/lib/localizers/date-fns'` (not the top-level package), pass it `format`, `parse`, `startOfWeek`, `getDay`, and a locales map. Import the CSS from `'react-big-calendar/lib/css/react-big-calendar.css'` inside the `'use client'` component — Next.js handles it as a CSS module at runtime.

**Q:** How do you color calendar events by a data property?
**A:** Use `eventPropGetter` — a callback that receives each event object and returns `{ style: { backgroundColor, color, ... } }`. Map your status enum to a color palette at the component top level so the getter is a pure lookup.

**Q:** Where should a shared TypeScript interface live when it's used across 3+ files?
**A:** `lib/types.ts` — a plain export file with no framework dependencies. Import from it everywhere. Avoids the problem of drift between locally-redeclared interfaces that should be identical.

---

### Anti-Patterns

**Q:** Why shouldn't you import `react-big-calendar` CSS globally in `layout.tsx`?
**A:** It pollutes the global stylesheet with `.rbc-*` rules on every page. Importing it inside the component file that actually uses the library keeps the dependency co-located and avoids confusion about where the styles come from.

---

### Challenges

**Q:** The `SlotInfo` type from `react-big-calendar` wasn't exported from the top-level package — how was it resolved?
**A:** Import it directly: `import { ..., SlotInfo } from 'react-big-calendar'`. It is exported from the top-level index in v1.x — the apparent confusion was a red herring from an old docs example. Typecheck confirmed it worked cleanly.

---

### Decisions

**Q:** Calendar as a new `/calendar` route vs. a toggle on `/appointments` — which is better?
**A:** Toggle on `/appointments`. Same data, two presentations. Avoids duplicating fetch logic and nav entries. The toggle pattern (List / Calendar) is a well-understood UX convention (used by Gmail, Linear, etc.) and communicates that these are views of the same data, not separate features.

**Q:** `react-big-calendar` vs. building a custom calendar grid?
**A:** `react-big-calendar` — it's what a real engineer would reach for, it's highly configurable, and the skill is in integration and customization (color coding, event rendering, CSS overrides to match brand), not in grid math. A poorly built custom grid would look worse than a well-integrated library.

---

## 2026-05-29 — Location-Based Provider Search

### Patterns

**Q:** How do you extend a Prisma `findMany` to support multiple optional filters while keeping all conditions as an AND?
**A:** Merge all field-level conditions into a single `providerProfile: { ...spread }` object using conditional spreads. Separate `providerProfile` keys at the same level create a TypeScript duplicate-key error and only the last one applies. One object, multiple conditional spreads inside it.

**Q:** How should the `upsert` seed pattern handle new columns added by a migration?
**A:** Populate `update: { city, province }` as well as `create`. With `update: {}`, re-running the seed against an existing database leaves new columns as NULL for rows that already exist, making the test data unreliable. The `update` block should include any backfillable fields.

**Q:** What's the right way to sync multiple URL search params with multiple React state variables?
**A:** In a single `useEffect` keyed on `searchParams`, read all params at once and call all `setState` calls and the fetch together. This avoids multiple renders and keeps state in sync with the URL in one pass.

---

### Anti-Patterns

**Q:** Why shouldn't you split a multi-field Prisma filter into separate `providerProfile` spread keys?
**A:** TypeScript will complain about duplicate object keys, and even in plain JS, only the last key wins — earlier conditions are silently ignored. Always merge into one `providerProfile: { ...spread1, ...spread2 }` object.

---

### Challenges

**Q:** The existing clear-search button called `router.push('/providers')` inline — should the new city/province clear buttons do the same?
**A:** No. Each clear button sets only its own input to `''` via `setState`, letting the user clear one field at a time and re-submit. A single "Clear all" link still calls `router.push('/providers')` to reset everything at once.

---

### Decisions

**Q:** Two separate query params (`city`, `province`) vs. one combined `location` param — which is better?
**A:** Separate. A single `location` string mixes two semantically distinct fields, making partial filtering (e.g., "all providers in ON regardless of city") impossible. Separate params match the existing `specialty` pattern and are more composable.

**Q:** Should `ProviderProfile` use `city`/`province` free-text or a select/enum for province?
**A:** Free text, matching the `specialty` pattern. An enum or dropdown adds friction for a demo app and is premature — the backend uses case-insensitive `contains`, so "on", "ON", and "Ontario" all work. A stricter type could be added later if needed.

---

## 2026-06-18 — Test Coverage for Provider Search Expansion

### Patterns

**Q:** When a component makes multiple `axios.get` calls on mount (e.g., one for options, one for data), how should tests mock them?
**A:** Use `mockImplementation` with URL-based routing rather than `mockResolvedValue` or ordered `mockResolvedValueOnce`. URL routing is explicit, order-independent, and survives refactors that change call sequence. Pattern: `vi.mocked(axios.get).mockImplementation((url) => url === '/v1/endpoint' ? Promise.resolve({ data: X }) : Promise.resolve({ data: Y }))`.

**Q:** When a service method calls the same Prisma method three times in parallel via `Promise.all`, how do you mock each call independently?
**A:** Chain `mockResolvedValueOnce` — the mock queue is consumed FIFO in the order calls are dispatched. Since `Promise.all([a, b, c])` dispatches all three calls synchronously before any `await`, the dispatch order matches the source order. Chain: `.mockResolvedValueOnce(specialties).mockResolvedValueOnce(cities).mockResolvedValueOnce(provinces)`.

**Q:** How do you write a test that asserts filter chip rendering based on URL search params?
**A:** Mock `useSearchParams` as a `vi.fn()` and call `vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('specialty=Cardiology') as any)` per test. This makes the hook return whatever params the test needs without touching the router.

---

### Anti-Patterns

**Q:** Why does `mockResolvedValue(providers)` break once a component gains a second `axios.get` call?
**A:** `mockResolvedValue` sets a default for all calls. If the options call expects `{ specialties, cities, provinces }` but gets a providers array, `setSearchOptions` is called with an array — then `searchOptions.specialties.filter(...)` throws (or renders nothing). Always use URL-based routing when a component makes multiple distinct API calls.

---

### Challenges

**Q:** The existing frontend providers test used `mockResolvedValue(providers)` and presumably passed before. Why didn't it break earlier?
**A:** The options endpoint (`/v1/providers/options`) and the second `axios.get` call were added as part of the same uncommitted changeset — the tests predated the feature. The old tests would have started failing as soon as the component was updated, but no test run had caught it yet. This is the scenario "tests for uncommitted files" is designed to surface.

---

### Decisions

**Q:** For the `findSearchOptions` service tests, should you assert all three `providerProfile.findMany` calls in one test or one test per field?
**A:** One test per field. Each assertion is about a distinct Prisma query shape (specialty vs. city vs. province), so splitting them gives cleaner failure messages and makes it obvious which query regressed. The cost is three near-identical `beforeEach`-style setups, but that's acceptable for the diagnostic clarity.

---

## 2026-04-30 — Unauthenticated Provider Search & Config Hardening

### Patterns

**Q:** How do you expose a public NestJS endpoint in a codebase that uses per-controller `JwtAuthGuard`?
**A:** Simply omit `@UseGuards(JwtAuthGuard)` from the controller. Because the guard is not global, absence of the decorator means no auth required. Document this explicitly — the asymmetry (some controllers guarded, some not) is easy to misread as an oversight.

**Q:** How do you prevent a Prisma `include` from leaking sensitive columns to a public API?
**A:** Replace `include` / `model: true` with an explicit `select` at every level of the query. This makes exposure opt-in rather than opt-out — new columns added to the schema are never automatically returned.

**Q:** How do you make client-side API calls port-agnostic in Next.js?
**A:** Use Next.js `rewrites` in `next.config.ts` to proxy `/v1/:path*` to `BACKEND_URL`. Client components use relative paths (`/v1/providers`); only the Next.js server knows the backend host. Remove the `NEXT_PUBLIC_` prefix from the backend URL so it is never baked into client bundles.

**Q:** What `callbackUrl` should you pass to NextAuth's `signOut`?
**A:** `window.location.origin` — it resolves to the actual protocol + host + port the browser is on, regardless of what port the server started on. A relative `'/'` is resolved against `NEXTAUTH_URL` server-side, which may not match the running port.

---

### Anti-Patterns

**Q:** What's wrong with `providerProfile: true` on a public Prisma query?
**A:** It returns every column including sensitive fields (`licenseNumber`, `userId`, timestamps). Any new column added later is also automatically exposed. Use an explicit `select` instead.

**Q:** Why shouldn't you use `NEXT_PUBLIC_` for the backend API URL?
**A:** `NEXT_PUBLIC_` variables are embedded in the client bundle at build time. The backend port/host is then hardcoded in every deployed asset — changing it requires a redeploy. It also exposes internal infrastructure details to anyone who reads the JS bundle.

---

### Challenges

**Q:** Port 3000 was taken by another project. The frontend fell back to 3001, which was the backend's port. How was it resolved?
**A:** Kill the misfired frontend process, start the backend first (claims 3001), then start the frontend on an explicit port (`npm run dev -- -p 3002`) with `NEXTAUTH_URL` overridden inline to match. Root cause: `NEXTAUTH_URL` must always match the actual running port — it cannot be made fully dynamic because NextAuth validates callback URLs against it server-side.

---

### Decisions

**Q:** Should `NEXTAUTH_URL` be removed from `.env.local` to reduce port coupling?
**A:** No. NextAuth v4 requires it server-side for callback URL validation (CSRF/open-redirect protection). It was removed, caused signout to redirect to the wrong port, and was restored. The correct approach: keep it in `.env.local` as `http://localhost:3000` and override it inline when running on a different port. See ADR 003.

**Q:** Where should test coverage for a security-sensitive field exclusion live?
**A:** In the service test, asserting the exact `select` shape passed to Prisma — not by inspecting the HTTP response. This catches regressions at the query level before they reach the wire.
