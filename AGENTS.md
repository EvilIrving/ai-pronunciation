# Repository Guidelines

## Project Structure & Modules
- Next.js App Router in app/.
  - Pages: app/page.tsx, layout in app/layout.tsx.
  - API routes: app/api/words/[word]/route.ts, app/api/words/admin/add/route.ts.
  - Libraries: app/lib/{supabase,r2,tts,dictionary}.ts.
  - Types: app/types/word.ts.
  - DB schema: app/supabase/schema.sql.
- Public assets in public/.
- Global styles in app/globals.css.

## Build, Test, and Development
- Install: pnpm i (use pnpm; lockfile present).
- Dev server: pnpm dev (Next dev on localhost:3000).
- Build: pnpm build (Next production build).
- Start: pnpm start (serve production build).
- Lint: pnpm lint (Biome check).
- Format: pnpm format (Biome write).

## Coding Style & Naming
- Language: TypeScript + React Server Components (Next 15).
- Formatting and linting via Biome (biome.json). Keep imports ordered; prefer 2-space indent; semicolons consistent with formatter.
- Filenames: lowercased kebab/file names in app/lib, Next conventions page.tsx, layout.tsx, and route.ts inside route folders.
- Env: store secrets in .env.local (git-ignored). Example keys: NEXT_PUBLIC_SUPABASE_URL, R2_*, GCLOUD_TTS_*.

## Testing Guidelines
- No test suite is configured yet. If adding tests:
  - Unit: prefer Vitest for TS, files *.test.ts adjacent to source.
  - API routes: add integration tests under app/api/**/__tests__ or tests/api/.
  - Aim for critical-path coverage (parsing, storage, TTS flow).

## Commit & Pull Requests
- Commits: concise, imperative subject (max ~72 chars). Example: Add R2 upload helper and audio key util.
- Include scope when helpful, e.g., api/words: cache dictionary lookups.
- PRs: provide summary, context, and screenshots for UI; link issues; list env or migration changes (app/supabase/schema.sql). Ensure pnpm lint and pnpm build pass.

## Security & Configuration
- Do not commit credentials. Use .env.local; document any new vars in README.md.
- Least-privilege: use Supabase service role only in server routes.
- Validate inputs with zod in API handlers; prefer server-side secrets access only.

