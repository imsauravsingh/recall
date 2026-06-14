# Recall.dev

Recall.dev is a local-first developer memory and interview preparation platform built with React, TypeScript, Vite, Zustand, Dexie, and Tailwind.

## Architecture

- **Frontend**: React + TypeScript + Vite
- **State**: Zustand for application state and topic management
- **Storage**: Dexie.js + IndexedDB for local-first persistence
- **UI**: Tailwind CSS with reusable design tokens and components
- **Routing**: React Router DOM
- **Testing**: Vitest + React Testing Library

## Folder structure

```
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

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
