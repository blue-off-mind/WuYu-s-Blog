![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![CI](https://github.com/Sherlock/digital-editorial-journal/actions/workflows/ci.yml/badge.svg)
 # Digital Editorial Journal

A React + Vite + Supabase digital editorial project with public reading, comments, admin CMS, moderation logs, and realtime sync.

## Features

- Public article browsing and detail pages
- Comment posting
- Admin login and CMS (create/update/delete articles)
- Comment moderation with audit logs (`moderation_logs`)
- Supabase Realtime sync for articles, comments, and moderation logs

## Tech Stack

- React 19
- TypeScript 5
- Vite 7
- Tailwind CSS 4
- Supabase JS 2
- Wouter (hash routing)
- Vitest + ESLint

## Quick Start

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

Create `.env` in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run locally

```bash
pnpm dev
```

### 4. Build

```bash
pnpm build
```

## Database Setup (Supabase)

Run SQL scripts in this order inside Supabase SQL Editor:

1. `supabase_schema.sql`
2. `update_schema_moderation.sql`

This creates:

- Tables: `articles`, `comments`, `admin_users`, `moderation_logs`
- Functions: `is_admin()`, `increment_article_likes()`, `delete_comment_with_log()`
- RLS policies
- Realtime publication config

## Admin Setup

Grant admin role by inserting user id into `admin_users`:

```sql
insert into public.admin_users (user_id)
values ('<auth.users.id>');
```

## Scripts

```bash
pnpm dev
pnpm build
pnpm preview
pnpm lint
pnpm test
```

## Open Source Collaboration

- Contribution guide: `CONTRIBUTING.md`
- Security policy: `SECURITY.md`
- Code ownership: `.github/CODEOWNERS`
- Issue templates: `.github/ISSUE_TEMPLATE/`
- Pull request template: `.github/pull_request_template.md`

## CI and Automation

- CI pipeline (`.github/workflows/ci.yml`) runs lint, tests, and build on push/PR.
- Dependency review (`.github/workflows/dependency-review.yml`) checks dependency risk on PRs.
- CodeQL (`.github/workflows/codeql.yml`) runs static analysis for JS/TS.
- Dependabot (`.github/dependabot.yml`) opens weekly dependency update PRs.

## Architecture (Code Structure)

```mermaid
flowchart TD
  A[src/App.tsx] --> B[contexts/AuthContext.tsx]
  A --> C[contexts/StoreContext.tsx]
  A --> D[contexts/LanguageContext.tsx]
  A --> E[pages/Home.tsx]
  A --> F[pages/ArticleDetail.tsx]
  A --> G[pages/admin/Dashboard.tsx]
  A --> H[pages/admin/Editor.tsx]
  A --> I[pages/admin/Comments.tsx]

  C --> J[lib/supabase.ts]
  C --> K[lib/types.ts]
  C --> L[(Supabase Postgres)]
  L --> M[(articles)]
  L --> N[(comments)]
  L --> O[(moderation_logs)]
```

## AI-Native Workflow

This project follows the workflow below for iterative delivery and quality control.

```mermaid
flowchart LR
  U[User Intent] --> P[Prompt Engineering]
  P --> X[Executor Agent: Codex]
  X --> R[Reviewer Agent: Audit]
  R --> C{Pass Review?}
  C -- No --> P
  C -- Yes --> G[CI/CD: GitHub]
  G --> V[Deployment: Vercel]
```

## Notes

- The app uses hash routing (`/#/...`) for static hosting compatibility.
- Frontend must only use `VITE_SUPABASE_ANON_KEY`.
- Authorization is enforced by Supabase RLS, not by UI visibility alone.
