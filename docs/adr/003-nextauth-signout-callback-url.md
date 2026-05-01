# ADR 003 — Use window.location.origin as NextAuth signOut callbackUrl

**Date:** 2026-04-30
**Status:** Accepted

## Context

`signOut({ callbackUrl: '/' })` caused post-signout redirects to `http://localhost:3000` regardless of the port the app was actually running on. NextAuth v4 resolves relative `callbackUrl` values against `NEXTAUTH_URL`. When `NEXTAUTH_URL` is not set (removed to reduce port coupling), NextAuth falls back to its internal default of port 3000.

`NEXTAUTH_URL` cannot be eliminated in the same way as `NEXT_PUBLIC_API_URL` — NextAuth requires it server-side to validate callback URLs as a CSRF/open-redirect protection. It must always match the actual running port.

## Decision

Use `window.location.origin` as the `callbackUrl`:

```ts
signOut({ callbackUrl: window.location.origin })
```

This resolves to the protocol + host + port the user's browser is actually on, which is always correct regardless of what port the frontend started on.

`NEXTAUTH_URL` is kept in `.env.local` set to `http://localhost:3000` (the default port). When running on a different port, it must be overridden inline: `NEXTAUTH_URL=http://localhost:3002 npm run dev -- -p 3002`.

## Consequences

- Signout redirects work correctly on any port without code changes.
- `NEXTAUTH_URL` remains a required env var — it cannot be made fully dynamic because NextAuth uses it server-side for security validation.
- In production (Vercel), `NEXTAUTH_URL` is set to the deployment URL and this is a non-issue.
