# Upgrade Log

## 2026-03-05

### 1. Open source project baseline

- Added `.github/` community and governance files to shift from personal archive to maintainable open source project.
- Added GitHub Actions CI workflow for `lint + test + build` on push/PR.
- Added dependency review workflow, CodeQL static security scan workflow, and Dependabot weekly dependency update config.
- Added issue templates (bug/feature) and pull request template for structured collaboration.
- Added `CODEOWNERS` for review ownership.
- Added `CONTRIBUTING.md` and `SECURITY.md` as contributor and security policy entry points.
- Updated `README.md` with open source collaboration and automation sections.

**Files**
- `.github/workflows/ci.yml`
- `.github/workflows/dependency-review.yml`
- `.github/workflows/codeql.yml`
- `.github/dependabot.yml`
- `.github/CODEOWNERS`
- `.github/ISSUE_TEMPLATE/bug_report.yml`
- `.github/ISSUE_TEMPLATE/feature_request.yml`
- `.github/ISSUE_TEMPLATE/config.yml`
- `.github/pull_request_template.md`
- `CONTRIBUTING.md`
- `SECURITY.md`
- `README.md`

### 2. CodeQL High alert fix (`js/xss-through-dom`)

- Fixed `DOM text reinterpreted as HTML` risk in admin image picker by preventing raw user input from flowing directly into image rendering.
- Added URL sanitizer (`getSafeImageUrl`) and restricted accepted protocols to `http`/`https` only.
- Updated direct-link flow to call `onSelect` only with validated URLs.
- Switched preview image source to sanitized URL and added an inline invalid URL message for rejected input.

**Files**
- `src/components/admin/ImagePicker.tsx`

### 3. Validation

- `pnpm -s lint`: passed with existing warnings only (`react-refresh/only-export-components`)

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
