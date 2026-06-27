# Recall.dev Usage Guide

This document explains how to use the Recall application from the user perspective.

## What you can do

- Create and manage interview topics
- Add topics to a revision queue for scheduled recall practice
- Run recall sessions for a selected topic
- Save recall session outcomes and confidence scores
- Keep private notes per topic
- View dashboard insights, queue status, and study plan guidance
- Use locally cached content from `recall-content/`
- In the future, complete onboarding after login to receive recommended Learning Domains, an initial study plan, templates, weekly goals, and a revision schedule

## Main app sections

### Dashboard

The dashboard is the home screen. It shows:

- Total topics and active topic count
- Recall queue size and due items
- Progress and recall readiness metrics
- AI-guided insight for your next topic focus
- Quick links to the study plan and recall session

### Topics

Use the Topics page to:

- Add a new topic
- Edit existing topic title, category, subcategory, description, and tags
- Archive old topics
- Delete topics you no longer need
- Add or remove topics from the revision queue
- Open topic-specific notes and save confidence notes

### Revision queue

The Revision Queue page helps you manage scheduled recall practice.

For each queued topic, you can:

- Mark the topic as completed
- Reschedule it for later review
- Skip it temporarily
- Jump directly into a recall session

### Recall

The Recall page is the practice flow.

It includes:

- Topic selection from your saved topics
- A set of memory prompts for each topic
- Reveal answers after you recall them yourself
- Confidence ratings (Forgot, Hard, Medium, Easy)
- Save the session locally as recall history
- AI-style hints generated from topic metadata and note context

### Study plan

The Study Plan page is driven by JSON content and shows:

- Weekly goals and schedule items
- Monthly milestones and targets
- Section summaries for the current study week

## How to start

1. Run the app locally:

```bash
npm install
npm run dev
```

2. Open the app in your browser at `http://localhost:5173`

3. Navigate to `Topics` and create a few topics.

4. Add at least one topic to the revision queue.

5. Go to `Recall` and select a topic to practice.

## Planned onboarding experience

In the future, Recall.dev will include first-login onboarding to collect:

- Current designation
- Years of experience
- Primary technology
- Current responsibilities
- Target role
- Target companies (optional)
- Daily study hours
- Preparation timeline

Based on those answers, the app will recommend Learning Domains and create an initial workspace with an initial study plan, domains, default templates, weekly goals, and a revision schedule.

## Recording progress

- Save each recall session to track your confidence over time.
- Use the dashboard metrics to see overall readiness.
- Review topic notes to improve recall accuracy.

## Content updates

The app currently loads content from the local `recall-content/` folder.

To update content:

- Edit or add JSON files under `recall-content/`
- Update the manifest if you add new modules
- The app reads the manifest and loads new content when available

## Offline behavior

Recall.dev stores data locally in your browser using IndexedDB.

That means:

- Topics, notes, sessions, and queue items stay available offline
- Your study progress remains local to your machine

## When to use Recall.dev

Best use cases:

- Interview prep review cycles
- Practicing core concepts with active recall
- Tracking topic confidence across multiple sessions
- Capturing notes and mental models for later review

## Troubleshooting

- If the app does not start, confirm dependencies are installed with `npm install`
- If IndexedDB is unavailable, make sure your browser supports local storage and privacy settings allow it
- If content does not appear, verify the `recall-content/manifest.json` file and module files are present
