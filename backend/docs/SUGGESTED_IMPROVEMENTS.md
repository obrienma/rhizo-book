# Suggested Improvements

## 1. Security

- **Hardcoded JWT secret fallback** — `AuthModule` falls back to `'your-secret-key'` when `JWT_SECRET` is unset. This should throw on startup (like `JwtStrategy` already does) instead of silently using a hardcoded secret.
- **`@prisma/client` in devDependencies** — It's imported at runtime but listed under `devDependencies`. Move it to `dependencies`.

## 2. Appointment Scheduling Bugs

- **Incomplete overlap detection** — The conflict check in `AppointmentsService.create` misses appointments fully contained within an existing one (e.g. existing 9:00–10:00, new 9:15–9:45). Add a third `OR` clause:
  ```ts
  { startTime: { gte: new Date(dto.startTime) }, endTime: { lte: new Date(dto.endTime) } }
  ```
- **No time validation** — There's no check that `endTime > startTime` or that the appointment is in the future.

## 3. Authorization Gaps

- **Unrestricted list endpoints** — `ProvidersController.findAll` and `UsersController.findAll/findOne` have no role-based guards. Any authenticated user can list all users and providers. Consider adding role checks.
- **Symmetric cancel permissions** — `AppointmentsService.cancel` receives `userRole` but doesn't use it — both patients and providers can cancel equally. This may be intentional, but worth documenting.

## 4. Code Quality

- **Deprecated shutdown hook pattern** — `PrismaService.enableShutdownHooks` uses `this.$on('beforeExit' as never, …)`. NestJS 10+ recommends `app.enableShutdownHooks()` directly.
- **Loose return type** — `AuthService.register` returns `Omit<any, 'password'>` which collapses to `any`. Define a proper `AuthResponse` interface.
- **Empty DTOs** — `CreateProviderDto` and `CreateUserDto` are empty classes. Either populate them with validation rules or remove them.

## 5. Testing Infrastructure

- **Separate test scripts** — Add a `test:unit` script to `package.json`:
  ```json
  "test:unit": "jest --testPathIgnorePatterns=e2e"
  ```
- **Test database** — Set up a test database (e.g. Docker + Prisma migrate) for true integration/e2e tests hitting a real DB.
- **E2E module resolution** — `jest-e2e.json` `rootDir` should be configured with `moduleNameMapper` or `tsconfig-paths` to resolve `src/` imports correctly.

## 6. API Design

- **No pagination** — `findAll` endpoints (appointments, users, providers) return all records. Add cursor or offset-based pagination.
- **Missing mutation endpoints** — No `PATCH`/`PUT` for updating appointment notes, user profiles, or provider profiles.
- **Missing status transitions** — No endpoint to mark appointments as `COMPLETED` or `NO_SHOW`.
