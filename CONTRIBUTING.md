# Contributing Guide

Thank you for contributing to Digital Editorial Journal.

## Development setup

1. Install dependencies:

```bash
pnpm install
```

2. Configure environment variables:

```bash
cp .env.example .env
```

3. Start local dev server:

```bash
pnpm dev
```

## Branch and pull request rules

1. Create a feature branch from `main`.
2. Keep commits focused and descriptive.
3. Open a PR with:
   - clear summary
   - testing evidence
   - migration notes (if schema/data changed)

## Quality gates

Before opening a PR, run:

```bash
pnpm -s lint
pnpm -s test -- --run
pnpm -s build
```

## Database changes

- Any change to schema/RLS/functions must include:
  - SQL migration script
  - rollback strategy
  - docs update in `SUPABASE_SETUP.md` and `docs/UPGRADE_LOG.md`

## Security

- Do not commit secrets.
- Use `.env` for local values and keep `.env.example` in sync.
- Report vulnerabilities privately (see `SECURITY.md`).
