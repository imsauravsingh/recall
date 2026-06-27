# Recall.dev

Recall.dev is a local-first developer memory and interview preparation platform built with React, TypeScript, Vite, Zustand, Dexie, and Tailwind.

The current repo implements the initial Vite-based MVP, while the long-term product direction is onboarding-first with a landing page, authenticated workspace, Learning Domain recommendations, and a phased migration toward Next.js, Clerk, and MongoDB Atlas.

API details and backend contract definitions are centralized in `API.md`.

## Architecture

- **Frontend**: React + TypeScript + Vite
- **State**: Zustand for application state and topic management
- **Storage**: Dexie.js + IndexedDB for local-first persistence
- **UI**: Tailwind CSS with reusable design tokens and components
- **Routing**: React Router DOM
- **Content delivery**: Separate `recall-content` GitHub repo served through `jsDelivr`
- **Testing**: Vitest + React Testing Library

## Content architecture

- Content is decoupled from the app and stored in the `recall-content/` folder in this workspace.
- The app can load content via `src/lib/contentService.ts` and can later switch to remote CDN delivery.
- The app can retrieve `manifest.json` from a CDN endpoint like `https://cdn.jsdelivr.net/gh/<username>/recall-content@<branch>/manifest.json`.
- `manifest.json` contains `version`, `lastUpdated`, and the list of available modules.
- Module files live under named folders such as `system-design/`, `dsa/`, `backend/`, `databases/`, `cloud/`, and `ai/`.
- The app compares the remote manifest version to the locally cached version and downloads updated module JSON files when needed.
- Downloaded JSON is cached locally so the app remains offline-capable and can continue using previously fetched content.

## Folder structure

```
/recall-content
  manifest.json
  /system-design
    beginner.json
    intermediate.json
    advanced.json
  /dsa
    arrays.json
    trees.json
    graphs.json
  /backend
    nodejs.json
    nestjs.json
    express.json
  /databases
    mysql.json
    mongodb.json
  /cloud
    aws.json
  /ai
    llm.json
    rag.json
/src
  /features
    /dashboard
      DashboardPage.tsx
    /topics
      TopicCard.tsx
      TopicForm.tsx
      TopicsPage.tsx
      topicService.ts
      topicStore.ts
    /shell
      AppShell.tsx
      PlaceholderPage.tsx
    /ui
      Badge.tsx
      Panel.tsx
  /lib
    aiGateway.ts
    aiProvider.ts
    contentService.ts
    db.ts
    types.ts
  /styles
    global.css
  App.tsx
  App.test.tsx
  main.tsx
  vitest.setup.ts
```

## Database schema (Dexie)

- `topics`
  - id, title, category, subcategory, description, tags, archived, createdAt, updatedAt
- `notes`
  - id, topicId, mentalModel, executionFlow, edgeCases, tradeOffs, commonMistakes, interviewQuestions, examples, personalNotes, confidence, createdAt, updatedAt
- `recallSessions`
  - id, topicId, score, weaknesses, strengths, createdAt
- `milestones`
  - id, role, title, progress, completed
- `aiConversations`
  - id, topicId, provider, prompt, response, createdAt
- `revisionQueue`
  - id, topicId, priority, dueDate, status

## TypeScript interfaces

Defined in `src/lib/types.ts`:

- `Topic`
- `Note`
- `RecallSession`
- `Milestone`
- `AIConversation`
- `RevisionQueueItem`

AI provider abstraction in `src/lib/aiProvider.ts`:

- `AIProvider`
- `AIProviderConfig`
- `AIProviderKey`

Gateway scaffolding in `src/lib/aiGateway.ts`:

- `AIGateway`
- `defaultAIProviderConfigs`

## Component and feature hierarchy

- `App.tsx`
  - `AppShell.tsx`
    - `DashboardPage.tsx`
    - `TopicsPage.tsx`
    - `PlaceholderPage.tsx`
- `TopicForm.tsx`
- `TopicCard.tsx`
- `Panel.tsx`
- `Badge.tsx`

## Zustand stores

`src/features/topics/topicStore.ts` manages:

- topics list
- loading state
- topic creation
- topic update
- deletion
- archiving
- active topic selection

## Dexie implementation

`src/lib/db.ts` creates `RecallDatabase` with tables and indexes. Topics are persisted locally in IndexedDB so the app is offline-first and zero-server.

## Phase 1 implementation

Completed Phase 1 features:

1. Application shell and navigation
2. Local-first IndexedDB integration
3. Topic CRUD
4. Dashboard metrics
5. Placeholder routes for future features

The next product direction is onboarding-first: after login, users should complete a short profile survey and receive recommended Learning Domains and an initialized workspace rather than seeing an empty shell.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## How to use Recall.dev

Read the full usage guide in [USAGE.md](USAGE.md).
