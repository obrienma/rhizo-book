# Learning Log

Patterns, anti-patterns, challenges, and decisions encountered during development of RhizoBook.

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
