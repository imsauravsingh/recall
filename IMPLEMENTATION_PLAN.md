# Recall.dev Implementation Plan

Last updated: 2026-06-28

## Current Status

Recall.dev has been migrated from Vite to Next.js 15 App Router and is moving through the backend integration phase.

| Phase | Status | Notes |
| --- | --- | --- |
| 1. App shell, routing, local IndexedDB | Complete | Existing workspace pages and local-first services are in place. |
| 2. Clerk authentication | Complete | Clerk provider, middleware protection, and authenticated app layout are implemented. |
| 3. MongoDB data layer | In progress | Mongoose connection, models, repositories, and first API routes are implemented. UI services are partially wired. |
| 4. Onboarding and recommendations | Mostly complete | Local recommendation logic exists. Profile and initial plan now prefer API persistence with local fallback. |
| 5. Study plan workflows | In progress | Edit/save/duplicate/archive/restore exist. Version history is pending. |
| 6. Recall and revision workflows | In progress | Local services work. API routes exist; UI service wiring is pending. |
| 7. Templates and search | Pending | Current page is static. CRUD and search need implementation. |
| 8. Resume workflows | Pending | Placeholder page exists. Upload, parsing, versioning, and question generation are pending. |
| 9. AI providers and prompts | Pending | Provider abstractions exist as stubs. Settings and encrypted provider config need implementation. |
| 10. Production readiness | Pending | Env validation, observability, error handling, CI, and Vercel deployment checks are pending. |

## Implementation Strategy

The product should move from a local-first prototype to a server-backed workspace without breaking the existing UI. Each feature should keep the same path:

UI component -> feature service -> API route -> repository -> MongoDB model

IndexedDB/localStorage should remain as a fallback cache during the transition, but MongoDB should become the default persistence path for authenticated users.

## Immediate Priorities

1. Finish Phase 3 service wiring
   - Topics UI should use `/api/topics`.
   - Notes should use `/api/topics/:id/note`.
   - Revision queue should use `/api/revision-queue`.
   - Recall sessions should use `/api/recall-sessions`.
   - Keep local IndexedDB fallback where useful.

2. Stabilize study plan behavior
   - Default study plan must render even if MongoDB is unavailable.
   - Backend API calls must timeout quickly and fall back locally.
   - Add version history for plan edits.

3. Improve workspace shell polish
   - Use a full-width app shell instead of a centered max-width shell.
   - Keep navigation visually quiet and professional.
   - Avoid decorative logo blocks in the sidebar.
   - Reserve cards for actual content, not page layout wrappers.

4. Add API validation and error shape consistency
   - Add request validators for onboarding, topics, plans, queue items, and recall sessions.
   - Standardize `{ message }` errors and not-found responses.
   - Add repository tests for scoped user data.

## Known Issues

- The MongoDB URI currently uses the existing `.env` key `mongodb_connection`; `MONGODB_URI` is also supported and should become the preferred production name.
- Study-plan API calls can be slow if MongoDB is unreachable. Client-side timeout fallback is now used for onboarding/study-plan reads and writes.
- Existing Topics, Revision Queue, and Recall UI services still primarily use IndexedDB.
- Template CRUD/search is not implemented.
- Resume upload and AI flows are placeholders.

## Verification Checklist

Run before handing off a phase:

```bash
npx tsc --noEmit
npm run build
npx vitest run
```

Manual checks:

- `/` renders public landing page.
- Signed-in user can access `/dashboard`.
- `/plan` renders a default plan quickly.
- Study plan save, duplicate, archive, and restore work.
- Sidebar navigation uses the full browser width with no large empty side gutters.
