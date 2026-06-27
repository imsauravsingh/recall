# Recall.dev API Specification

This file centralizes backend API details for Recall.dev. It is the single source of truth for endpoint definitions, request shapes, and response shapes.

## API Overview

- Base URL: `/api`
- Authentication: session-based via Clerk or a similar auth provider
- Protected routes require a valid authenticated session
- Endpoints should use RESTful conventions where possible
- Server-side routes should delegate to repository methods rather than access the database directly

## Auth

### `POST /api/auth/session`

- Purpose: return the authenticated user session and profile
- Request: none
- Response:
  - `userId`
  - `email`
  - `firstName`
  - `lastName`
  - `onboardingComplete`
  - `preferredDomainSlug`
  - `role`

### `POST /api/auth/logout`

- Purpose: log the user out
- Request: none
- Response: success status

## Onboarding

### `GET /api/onboarding/profile`

- Purpose: fetch the user onboarding profile
- Response:
  - `designation`
  - `yearsExperience`
  - `primaryTechnology`
  - `responsibilities`
  - `targetRole`
  - `targetCompanies`
  - `dailyStudyHours`
  - `preparationTimeline`
  - `recommendedDomains`

### `POST /api/onboarding/profile`

- Purpose: save or update the onboarding profile
- Request:
  - `designation`
  - `yearsExperience`
  - `primaryTechnology`
  - `responsibilities`
  - `targetRole`
  - `targetCompanies`
  - `dailyStudyHours`
  - `preparationTimeline`
  - `selectedDomainSlugs`
- Response:
  - `onboardingComplete`: boolean
  - `workspaceInitialized`: boolean

### `POST /api/onboarding/workspace`

- Purpose: initialize the user workspace after onboarding
- Request: none or optional overrides
- Response:
  - `studyPlanId`
  - `createdDomainSlugs`
  - `createdTemplateIds`
  - `createdGoals`

## Users

### `GET /api/users/me`

- Purpose: return the current user's full profile
- Response includes:
  - `id`
  - `email`
  - `name`
  - `role`
  - `preferences`
  - `onboardingProfile`
  - `studyPreferences`

### `PATCH /api/users/me`

- Purpose: update user profile or preferences
- Request body may include:
  - `name`
  - `preferredDomainSlug`
  - `dailyStudyHours`
  - `timezone`
  - `notificationPreferences`
- Response: updated user object

## Learning Domains

### `GET /api/domains`

- Purpose: fetch all available Learning Domains for the current user
- Response:
  - `slug`
  - `label`
  - `description`
  - `icon`
  - `color`
  - `enabled`
  - `optional`
  - `createdAt`
  - `updatedAt`

### `POST /api/domains`

- Purpose: create a custom Learning Domain
- Request:
  - `label`
  - `slug`
  - `description`
  - `icon`
  - `color`
  - `enabled`
- Response: created domain object

### `PATCH /api/domains/:slug`

- Purpose: update a Learning Domain
- Request: any editable domain fields
- Response: updated domain object

### `DELETE /api/domains/:slug`

- Purpose: delete or archive a Learning Domain
- Response: success status

## Study Plans

### `GET /api/study-plans`

- Purpose: list all study plans for the user
- Response: array of study plan summaries

### `GET /api/study-plans/:id`

- Purpose: fetch a single study plan detail
- Response: study plan object

### `POST /api/study-plans`

- Purpose: create a new study plan
- Request:
  - `title`
  - `description`
  - `domainSlugs`
  - `goals`
  - `weeklyCommitmentHours`
  - `startDate`
  - `endDate`
  - `status`
- Response: created study plan object

### `PATCH /api/study-plans/:id`

- Purpose: update a study plan
- Request: editable fields
- Response: updated study plan object

### `POST /api/study-plans/:id/duplicate`

- Purpose: duplicate a study plan for versioning or new work
- Response: duplicated plan object

### `POST /api/study-plans/:id/archive`

- Purpose: archive the plan
- Response: archived status

### `POST /api/study-plans/:id/restore`

- Purpose: restore an archived plan
- Response: restored plan object

## Topics

### `GET /api/topics`

- Purpose: fetch user topics
- Response: array of topic objects

### `GET /api/topics/:id`

- Purpose: fetch a single topic detail
- Response: topic object

### `POST /api/topics`

- Purpose: create a topic
- Request:
  - `title`
  - `description`
  - `domainSlug`
  - `category`
  - `subcategory`
  - `tags`
  - `notes`
- Response: created topic object

### `PATCH /api/topics/:id`

- Purpose: update a topic
- Request: editable fields
- Response: updated topic object

### `DELETE /api/topics/:id`

- Purpose: delete a topic
- Response: success status

## Templates

### `GET /api/templates`

- Purpose: list templates by domain and type
- Response: array of template objects

### `GET /api/templates/:id`

- Purpose: fetch template detail
- Response: template object

### `POST /api/templates`

- Purpose: create a template
- Request:
  - `title`
  - `domainSlug`
  - `content`
  - `type`
  - `metadata`
- Response: created template object

### `PATCH /api/templates/:id`

- Purpose: update a template
- Response: updated template object

### `DELETE /api/templates/:id`

- Purpose: remove a template
- Response: success status

## Recall and Revision Queue

### `GET /api/revision-queue`

- Purpose: fetch queued revision items
- Response: array of queue item objects

### `POST /api/revision-queue`

- Purpose: add a topic or item to the revision queue
- Request:
  - `topicId`
  - `dueDate`
  - `priority`
- Response: created queue item

### `PATCH /api/revision-queue/:id`

- Purpose: update queue item status, date, or priority
- Response: updated queue item

### `DELETE /api/revision-queue/:id`

- Purpose: remove the queue item
- Response: success status

### `POST /api/recall-sessions`

- Purpose: save a recall session result
- Request:
  - `topicId`
  - `score`
  - `confidence`
  - `weaknesses`
  - `strengths`
  - `notes`
  - `createdAt`
- Response: created session object

### `GET /api/recall-sessions`

- Purpose: list recall session history
- Response: array of recall session objects

### `GET /api/recall-sessions/:id`

- Purpose: fetch a single session detail
- Response: recall session object

## Resume

### `GET /api/resumes`

- Purpose: list uploaded resumes
- Response: array of resume metadata objects

### `GET /api/resumes/:id`

- Purpose: fetch resume detail or parsed data
- Response: resume object

### `POST /api/resumes`

- Purpose: upload a resume
- Request: multipart/form-data with file and optional metadata
- Response: created resume object

### `PATCH /api/resumes/:id`

- Purpose: update resume metadata or version
- Response: updated resume object

### `DELETE /api/resumes/:id`

- Purpose: remove a resume
- Response: success status

## AI and Prompt Management

### `GET /api/ai/prompts`

- Purpose: list saved or reusable prompts
- Response: array of prompt objects

### `POST /api/ai/prompts`

- Purpose: create a reusable prompt template
- Request:
  - `title`
  - `description`
  - `template`
  - `domainSlug`
- Response: created prompt object

### `PATCH /api/ai/prompts/:id`

- Purpose: update a prompt template
- Response: updated prompt object

### `DELETE /api/ai/prompts/:id`

- Purpose: remove a prompt template
- Response: success status

### `POST /api/ai/generate`

- Purpose: execute a prompt generation flow
- Request:
  - `promptTemplateId`
  - `input`
  - `providerId`
  - `options`
- Response:
  - `output`
  - `providerResponse`
  - `providerMeta`

## AI provider configuration

### `GET /api/ai/providers`

- Purpose: list configured AI providers for the user
- Response: array of provider config objects

### `POST /api/ai/providers`

- Purpose: add or update a provider configuration
- Request:
  - `providerId`
  - `name`
  - `apiKey`
  - `capabilities`
- Response: saved provider config object

### `DELETE /api/ai/providers/:providerId`

- Purpose: remove a provider config
- Response: success status

### `GET /api/ai/providers/:providerId/health`

- Purpose: check provider runtime health and capabilities
- Response:
  - `status`
  - `latency`
  - `capabilities`

## Notifications and reminders

### `GET /api/notifications`

- Purpose: list active reminders and system notifications
- Response: array of notification objects

### `POST /api/notifications`

- Purpose: create a reminder or notification
- Request:
  - `title`
  - `body`
  - `triggerDate`
  - `type`
- Response: created notification object

### `PATCH /api/notifications/:id`

- Purpose: mark a notification read or update it
- Response: updated notification object

### `DELETE /api/notifications/:id`

- Purpose: delete a reminder or notification
- Response: success status

## Sync queue

### `GET /api/sync-queue`

- Purpose: list local changes pending sync
- Response: array of sync queue item objects

### `POST /api/sync-queue`

- Purpose: add a pending sync operation
- Request:
  - `entityType`
  - `entityId`
  - `operation`
  - `payload`
- Response: created sync queue item

### `PATCH /api/sync-queue/:id`

- Purpose: update sync queue status
- Response: updated sync queue item

### `DELETE /api/sync-queue/:id`

- Purpose: remove a sync queue item
- Response: success status

## Error format

All API responses should use a consistent error schema:

```json
{
  "status": "error",
  "message": "Human readable message",
  "code": "INVALID_INPUT",
  "details": {
    "fieldName": "error detail"
  }
}
```

## Notes

- Keep this file as the single source of truth for backend route and payload definitions.
- Update this file whenever you add or change API routes.
- Use this document to scaffold future Next.js API routes and server actions.
