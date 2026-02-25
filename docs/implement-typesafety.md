### 🛠️ Fixes implemented on feature/NewPatientSignup

1.  **TypeScript Noise Reduction**: Added `vitest/globals` to [frontend/tsconfig.json](frontend/tsconfig.json) so `tsc` recognizes `expect`, `vi`, `it`, and `describe` in your test files.
2.  **Critical Typo**: Fixed a typo in [frontend/app/register/provider/page.tsx](frontend/app/register/provider/page.tsx) where `&&1 (` was breaking the build and logic.
3.  **Schema & Types**:
    *   Updated the `appointmentDuration` schema to use `z.preprocess`. This correctly converts empty input strings (`""`) to `undefined`, preventing validation failures on optional fields.
    *   Defined a manual `ProviderRegisterFormValues` interface to resolve complex type inference issues between Zod and React Hook Form.
    *   Removed `valueAsNumber: true` from the registration field to allow the Zod schema to handle the string-to-number conversion cleanly.
4.  **Test Stability**: Fixed a small type mismatch in [__tests__/app/login.test.tsx](frontend/__tests__/app/login.test.tsx) that was blocking the type check.
5.  **Clean up**: Removed a duplicate `lint` script from [frontend/package.json](frontend/package.json).

### ✅ Verification:
- **Type Check**: `npx tsc --noEmit` now passes with **0 errors**.
- **Tests**: `npx vitest run` passes with **52/52 tests successful**.

