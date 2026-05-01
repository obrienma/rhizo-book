# ADR 001 — Explicit field selection on public provider endpoints

**Date:** 2026-04-30
**Status:** Accepted

## Context

`GET /v1/providers` and `GET /v1/providers/:id` are public endpoints (no auth required). The initial implementation used `providerProfile: true` and `include` for availability slots, which returned every column Prisma knows about — including `email`, `licenseNumber`, `userId`, `isActive`, `createdAt`, `updatedAt`.

## Decision

Use explicit `select` at every level of both queries. The public response is limited to:

- User: `id`, `name` (no `email`)
- ProviderProfile: `specialty`, `bio`, `appointmentDuration` (no `licenseNumber`, `userId`, timestamps)
- AvailabilitySlot: `id`, `dayOfWeek`, `startTime`, `endTime` (no `providerId`, `isActive`, timestamps)

## Consequences

- Sensitive fields (`email`, `licenseNumber`) are structurally impossible to leak — they are never fetched from the database, not just filtered in application code.
- Adding a new column to a table does not automatically expose it; it must be explicitly opted in.
- Tests assert the exact select shape so regressions are caught at the query level, not by inspecting HTTP responses.
