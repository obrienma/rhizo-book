# ADR 002 — Next.js rewrite proxy for backend API calls

**Date:** 2026-04-30
**Status:** Accepted

## Context

The frontend originally used `NEXT_PUBLIC_API_URL=http://localhost:3001` in all client-side API calls. Because `NEXT_PUBLIC_` variables are baked into the client bundle at build time, the backend port was embedded in every deployed frontend asset. This caused two problems:

1. Changing the backend port required a frontend redeploy.
2. Any port conflict in dev (another project on 3001) broke all API calls with no easy override.

## Decision

Add a rewrite rule in `next.config.ts`:

```ts
source: '/v1/:path*',
destination: `${process.env.BACKEND_URL}/v1/:path*`
```

Client components use relative `/v1/...` paths. The Next.js server (not the browser) resolves `BACKEND_URL` at request time and proxies the call. `BACKEND_URL` has no `NEXT_PUBLIC_` prefix so it is never included in the client bundle.

`lib/auth.ts` (server-side NextAuth handler) calls `BACKEND_URL` directly — it bypasses the rewrite because it is already running server-side.

## Consequences

- The browser never needs to know the backend's host or port.
- Switching the backend URL (e.g. staging vs production) requires only a single env var change, no code change.
- Local dev port conflicts affect only `BACKEND_URL` in `.env.local`, not any source file.
- An extra network hop is added for client-side API calls (browser → Next.js server → NestJS). Acceptable for this workload.
