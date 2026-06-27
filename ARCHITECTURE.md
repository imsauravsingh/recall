# Recall.dev Architecture

## Overview

Recall.dev will evolve into a two-part product:

1. A public landing page for discovery and product positioning.
2. A private, authenticated workspace for learning, planning, practice, resume prep, and AI-assisted interview support.

The application name remains Recall.dev.

## Product goals

- Keep the dashboard and sidebar experience familiar while shifting the entry experience to a polished landing page.
- Make learning domains the primary business model across the product.
- Support authenticated AI features, resume-based questions, editable study plans, and reusable templates.
- Keep the product usable offline where possible through IndexedDB caching.
- Build the MVP on a modern, free-tier-friendly stack with Vercel, Clerk, MongoDB Atlas, and Next.js.

## Target architecture

- Frontend: Next.js 15 + TypeScript
- UI: Tailwind CSS + shadcn/ui
- Authentication: Clerk
- Database: MongoDB Atlas
- File storage: MongoDB-compatible storage or object storage for resumes and attachments
- State management: Zustand
- Forms: React Hook Form + Zod
- Rich text editing: Tiptap
- Charts: Recharts
- Notifications: Sonner
- Icons: Lucide React
- Offline cache: IndexedDB with LRU-style eviction
- AI layer: BYOK provider integration with multiple providers
- Deployment: Vercel

## Core principles

1. Feature-first architecture
   - Each feature contains components, hooks, services, repository, validators, and types.

2. Clear service boundaries
   - UI → Service → Repository → Database

3. Learning domains as the foundation
   - Topics, study plans, templates, recall flows, AI prompts, analytics, and resume content all belong to a learning domain.

4. Authenticated-first AI access
   - AI features, resume upload, AI provider settings, and cloud sync are available only after login.

5. Optional local-first experience
   - IndexedDB provides offline convenience without compromising the server-backed experience.

## Application structure

The app will be organized as a Next.js application with:

- Public routes for the landing page and marketing experience
- Authenticated routes for the workspace
- Feature-based folders for each capability

Suggested structure:

- app/
  - (public)/page.tsx
  - (app)/dashboard/page.tsx
  - (app)/study-plan/page.tsx
  - (app)/practice/page.tsx
  - (app)/resume/page.tsx
  - (app)/templates/page.tsx
  - (app)/settings/page.tsx
- features/
  - auth/
  - dashboard/
  - study-plan/
  - recall/
  - resume/
  - templates/
  - settings/
  - search/
- lib/
  - services/
  - repositories/
  - validators/
  - types/
  - db/
  - ai/
  - cache/

### Recommended feature folder layout

Each major feature should follow a consistent internal structure. For example:

- features/study-plan/
  - components/
  - hooks/
  - services/
  - repository/
  - validators/
  - types/
- features/resume/
  - components/
  - hooks/
  - services/
  - repository/
  - validators/
  - types/
- features/topics/
  - components/
  - hooks/
  - services/
  - repository/
  - validators/
  - types/
- features/templates/
  - components/
  - hooks/
  - services/
  - repository/
  - validators/
  - types/

This keeps UI, domain logic, persistence, and validation clearly separated while preserving the same architecture across features.

## Learning domain model

Learning Domain is the primary categorization entity used throughout the application.

Example domains:

- Backend Engineering
- DSA
- System Design
- AI System Design
- Resume Preparation
- Behavioural HR
- Cloud
- Database
- Custom

A learning domain contains:

- name
- slug
- icon
- color
- enabled
- order
- owner or shared metadata

Every Study Plan, Topic, Template, Recall Session, AI Prompt, and Analytics entry should reference a Learning Domain instead of relying on hardcoded categories.

## Data model

### Core collections

- users
  - profile info, preferences, study hours, timezone, preferred domain
- learningDomains
  - configurable domain definitions
- studyPlans
  - plan versions, goals, tasks, domains, status, version history
- topics
  - topic details, linked domain, notes, queue state
- templates
  - reusable templates, domain-based organization
- resumes
  - uploaded resume metadata, version history, parsed content
- recallSessions
  - completed practice sessions and scores
- aiHistory
  - AI requests and responses
- activityLogs
  - user action history
- syncQueue
  - pending local-to-cloud sync items
- promptTemplates
  - reusable AI prompt definitions
- notifications
  - reminders and system notifications
- aiProviderConfigs
  - user-managed provider settings and health state

## Service and repository layers

The application will use a layered design:

- UI layer
  - components, hooks, forms, page-level orchestration
- Service layer
  - domain logic, validation, orchestration
- Repository layer
  - persistence access to MongoDB
- Database layer
  - MongoDB Atlas collections

Important rule:

- API routes and server actions must never access MongoDB directly.
- All persistence must happen through repositories or services.

## Authentication and authorization

- Clerk handles authentication and SSO.
- Each user gets a user document in MongoDB.
- AI features, resume upload, AI provider settings, and sync are restricted to authenticated users.
- Protected routes and server API calls enforce this at the server layer.

## Resume and interview support

- Resume upload is optional.
- When a resume exists, the system can generate resume-based questions and answer drafts.
- Resume changes trigger versioning and regeneration of related questions.
- Resume actions are tracked in activity logs.

## Study plan system

Study plans are versioned and support:

- create
- duplicate
- archive
- restore
- update
- AI generation

AI-generated plans include:

- daily tasks
- weekly goals
- revision schedule
- estimated hours
- difficulty level

Each study plan references one or more learning domains.

## AI system

The AI layer is configurable and user-driven:

- reusable prompt templates
- multiple AI profiles such as Fast, Reasoning, High Quality, Free, Offline
- multiple provider support with user-provided API keys
- provider capability matrix such as vision, streaming, JSON output, reasoning, and embeddings
- provider health checks
- encrypted storage of API keys

## Offline and sync behavior

- IndexedDB is used for optional local caching.
- A sync queue handles pending uploads and updates.
- Cache settings can be configured by the user.
- API keys and authentication tokens are never cached locally.

## Deployment and operations

- Vercel hosts the application.
- GitHub handles source control and CI/CD.
- Environment variables validate on startup.
- Health checks expose application readiness.
- Feature flags allow staged rollout of new capabilities.

## Phase-wise implementation plan

> Update the phase status after completing each phase to keep the roadmap aligned with actual progress.

### Phase 1 — Foundation and landing page (Complete)

- Status: Completed
- Create the Next.js app shell and public landing page.
- Build a marketing-oriented homepage with benefit statements, key workflows, and trust messaging.
- Add the first version of the authenticated workspace shell, navigation, and protected route scaffold.
- Introduce Learning Domains as a core model and replace hardcoded categories with domain definitions.
- Create the initial feature-first folder structure for study-plan, resume, topics, templates, and shared library code.
- Add an onboarding route and placeholder workflow for first-login setup.
- Centralize all API route details and contract definitions in `API.md`.

### Phase 2 — Authentication and user model (Planned)

- Status: Planned
- Integrate Clerk for authentication and session management.
- Create user documents and editable preferences in MongoDB.
- Add authenticated user context and profile state management.
- Protect workspace pages, API routes, and server actions behind authentication.
- Add profile and settings screens for updating onboarding answers and preferences.

### Phase 3 — Core data layer (Planned)

- Status: Planned
- Create repository abstractions for users, learningDomains, studyPlans, topics, templates, resumes, recallSessions, aiHistory, activityLogs, syncQueue, promptTemplates, notifications, and aiProviderConfigs.
- Implement server-side API routes that delegate to repository methods.
- Add shared validation layers and type-safe DTOs.
- Add optional IndexedDB caching for workspace data and a first-pass sync strategy.

### Phase 4 — Learning Domains, onboarding, and workspace initialization (Complete)

- Status: Complete
- Build the onboarding flow to collect designation, experience, technology, responsibilities, target role, target companies, daily study hours, and preparation timeline.
- Add simple business rules (no AI) to recommend Learning Domains from onboarding input.
- Automatically create an initial study plan, default templates, weekly goals, and a revision schedule after onboarding.
- Save onboarding preferences to the user profile and allow later edits in Settings.

### Phase 5 — Study plan workflows (In progress)

- Status: Planned
- Add study plan creation, editing, duplication, archiving, restore, and version history.
- Add support for domains, goals, milestones, tasks, and estimated commitment.
- Add plan progress tracking, status updates, and plan health indicators.
- Build study plan detail pages and dashboard entry points.

### Phase 6 — Recall and queue workflows (Planned)

- Status: Planned
- Implement topic CRUD with Learning Domain tagging, note linking, and queue integration.
- Build rich revision queue management with reschedule, skip, complete, and priority controls.
- Add recall sessions, confidence capture, session history, and domain analytics.
- Connect recall practice to study plans and domain readiness signals.

### Phase 7 — Templates and search (Planned)

- Status: Planned
- Add reusable templates with domain classification.
- Build template import, export, and AI-assisted generation.
- Add workspace search across topics, plans, templates, and notes.
- Provide recommendations and guided template selection when creating plans.

### Phase 8 — AI generation and prompt management (Planned)

- Status: Planned
- Add reusable prompt templates and a prompt library UI.
- Add AI profiles and provider-aware prompt routing.
- Generate study plans, interview questions, answer drafts, and revision prompts using AI.
- Persist AI requests, responses, provider metadata, and quality feedback.

### Phase 9 — Provider configuration and health (Planned)

- Status: Planned
- Add per-user AI provider configuration and secure encrypted key storage.
- Support provider capability discovery and health checks.
- Add provider status UI, fallback rules, and manual provider selection.
- Track provider errors, throttling, and usage.

### Phase 10 — Offline sync, cache, and reliability (Planned)

- Status: Planned
- Add IndexedDB workspace caching with configurable eviction and cache controls.
- Add a local sync queue for offline edits and cloud reconciliation.
- Add export/import and backup restore workflows.
- Harden the app for intermittent network and offline recovery.

### Phase 11 — Production readiness and launch (Planned)

- Status: Planned
- Add feature flags and staged rollout controls.
- Validate environment variables and runtime configuration on startup.
- Add monitoring, health endpoints, and launch readiness checks.
- Complete security, privacy, and launch documentation.
- Launch with landing page, onboarding, workspace, and AI-assisted plan workflows.

### Phase 12 — Resume and interview workflows (Planned)

- Status: Planned
- Add optional resume upload, parsing, and version history.
- Build resume-driven interview question generation.
- Connect resume content to study plans, Learning Domains, and AI answer drafting.
- Track resume edits in activity logs and interview readiness metrics.

## Additional recommendations

1. First Login Onboarding (High Priority)

After authentication, guide the user through a simple onboarding instead of opening an empty workspace.

Collect:

- Current Designation
- Years of Experience
- Primary Technology
- Current Responsibilities
- Target Role
- Target Companies (Optional)
- Daily Study Hours
- Preparation Timeline

The application should use simple business rules (not AI) to recommend Learning Domains and create the initial Study Plan.

Users can edit these preferences later from Settings.

2. Learning Domains Recommendation

Instead of asking users to manually select DSA, System Design, Backend, etc., recommend them automatically based on the onboarding profile.

Example:

Current Role:
Principal Architect

Experience:
15 Years

Technology:
Node.js

Target Role:
Senior Staff Engineer

Recommended Domains:

- Backend Engineering
- System Design
- AI System Design
- Leadership
- Behavioural

Optional:

- DSA

Users can modify these recommendations before continuing.

3. Workspace Initialization

Immediately after onboarding, automatically create:

- Initial Study Plan
- Learning Domains
- Default Templates
- Weekly Goals
- Revision Schedule

This avoids an empty workspace.

## Tools and technology

- Next.js 15
- TypeScript
- Tailwind CSS
- shadcn/ui
- Clerk
- MongoDB Atlas
- Zustand
- React Hook Form
- Zod
- Tiptap
- Recharts
- Lucide React
- Sonner
- date-fns
- react-markdown
- pdf.js
- mammoth.js
- Vercel
- GitHub
