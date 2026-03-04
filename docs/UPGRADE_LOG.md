# Upgrade Log

## 2026-03-04

### 1. Admin session resilience after tab freeze/wake (Edge)

- Fixed admin session fallback logic to avoid unintended logout/redirect when the browser tab is frozen and later resumed.
- Updated auth state handling to preserve the last known authenticated/admin state on transient failures (timeouts/network hiccups), while still clearing session on explicit token/session invalidation.
- Added protection for `INITIAL_SESSION` / `TOKEN_REFRESHED` events when `session` is temporarily unavailable.

**Files**
- `src/contexts/AuthContext.tsx`

### 2. Lint error cleanup

- Fixed `prefer-const` lint error in store initialization data destructuring.

**Files**
- `src/contexts/StoreContext.tsx`

### 3. Validation

- `pnpm -s test -- --run`: passed (2/2)
- `pnpm -s lint`: no errors, warnings remain (`react-refresh/only-export-components`)
