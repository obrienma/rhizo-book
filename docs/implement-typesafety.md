# Implementation Log & Decisions

## 📅 2026-02-24 (Yesterday)

### 🛠️ UI Styling & Auth Refactoring
1.  **RhizoBook Branding**: Overhauled the authenticated `(app)` pages with the "RhizoBook" design language.
    *   **Palette**: Teal (`#164E63`) primary and Mint (`#F0FDF4`) background.
    *   **Geometry**: Standardized `rounded-[2.5rem]` for all main cards.
2.  **Navigation**: Redesigned `components/navigation.tsx` with a sticky glass-morphism header and centralized branding.
3.  **Authentication Fix**:
    *   **Decision**: Centralized `NextAuthOptions` in `frontend/lib/auth.ts`.
    *   **Reason**: Previously, `getServerSession()` without options was failing to parse custom properties like `roleName` in Server Components. Centralization prevents circular dependencies and ensures session parity across client/server.
4.  **UX Enhancement**: Updated the Appointments page to filter by "SCHEDULED" by default instead of "ALL".

### 🛠️ Fixes implemented on feature/NewPatientSignup (Prior to UI)
*(Existing items moved here)*
1.  **TypeScript Noise Reduction**: Added `vitest/globals` to [frontend/tsconfig.json](frontend/tsconfig.json) so `tsc` recognizes `expect`, `vi`, `it`, and `describe` in your test files.
2.  **Critical Typo**: Fixed a typo in [frontend/app/register/provider/page.tsx](frontend/app/register/provider/page.tsx) where `&&1 (` was breaking the build and logic.
3.  **Schema & Types**:
    *   Updated the `appointmentDuration` schema to use `z.preprocess`.
    *   Defined a manual `ProviderRegisterFormValues` interface to resolve complex type inference issues.
    *   Removed `valueAsNumber: true` from the registration field.
4.  **Test Stability**: Fixed type mismatch in [__tests__/app/login.test.tsx](frontend/__tests__/app/login.test.tsx).

---

## 📅 2026-02-25 (Today)

### 🛠️ Seed Data Expansion (5x)
1.  **Data Multiplier**: Expanded `backend/prisma/seed.ts` from ~15 records to **73 appointments**, **27 providers**, and **28 patients**.
2.  **Diversity & Character Sets**:
    *   **French Canadian**: Added blocks of names and clinical notes in French (e.g., *S. Côté*, *M.E. Gagnon*) to reflect regional diversity.
    *   **Cinematic Icons**: Added characters from Marvel and Cinema (Stark, Wayne, Wick) to make testing data distinct and recognizable.
3.  **Workflow Improvement**: Configured `backend/refresh-db.sh` for one-command reset and re-seed.

### 🛠️ Documentation & Sync
1.  **Architecture Update**: Updated `docs/ARCHITECTURE.md` to document the new centralized auth logic and shared layout structures.
2.  **Getting Started**: Updated `docs/DEV_GETTING_STARTED.md` with new test credentials and the recommended `./refresh-db.sh` workflow.

### 💡 Important Things to Know
- **Auth Parity**: Always import `authOptions` from `@/lib/auth` when using `getServerSession` on the server.
- **Styling Tokens**: Use `text-[#164E63]` for primary branding text and `bg-[#F0FDF4]` for main app backgrounds.
- **Seed Persistence**: The `seed.ts` file now use `upsert` and `createMany` after a `deleteMany` to ensure it is 100% idempotent and won't duplicate data on multiple runs.

