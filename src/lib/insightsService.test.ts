import { describe, expect, it } from "vitest";
import type { Note, RecallSession, RevisionQueueItem, Topic } from "./types";
import { buildRecallHint, getRecallInsights } from "./insightsService";

const topics: Topic[] = [
  {
    id: "topic-1",
    title: "Redis rate limiting",
    category: "Backend",
    subcategory: "Caching",
    description: "Understand how to protect APIs with rate limits.",
    tags: ["redis", "caching"],
    archived: false,
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
  {
    id: "topic-2",
    title: "Load balancer tradeoffs",
    category: "System Design",
    subcategory: "Scalability",
    description: "Compare routing strategies and common bottlenecks.",
    tags: ["scaling"],
    archived: false,
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
];

const sessions: RecallSession[] = [
  {
    id: "s1",
    topicId: "topic-2",
    score: 42,
    weaknesses: "",
    strengths: "",
    createdAt: "2026-06-01",
  },
  {
    id: "s2",
    topicId: "topic-2",
    score: 50,
    weaknesses: "",
    strengths: "",
    createdAt: "2026-06-02",
  },
];

const queueItems: RevisionQueueItem[] = [
  {
    id: "q1",
    topicId: "topic-1",
    priority: "High",
    dueDate: "2026-06-27",
    status: "Pending",
  },
];

const note: Note = {
  id: "n1",
  topicId: "topic-2",
  mentalModel: "",
  executionFlow: "",
  edgeCases: "",
  tradeOffs: "",
  commonMistakes: "",
  interviewQuestions: "",
  examples: "",
  personalNotes: "Mention bottlenecks and failover.",
  confidence: 58,
  createdAt: "2026-06-01",
  updatedAt: "2026-06-01",
};

describe("insightsService", () => {
  it("recommends the lowest-confidence topic from the queue and recent sessions", () => {
    const insights = getRecallInsights({ topics, queueItems, sessions });

    expect(insights.recommendedTopicTitle).toBe("Redis rate limiting");
    expect(insights.focusArea).toContain("Backend");
  });

  it("builds a contextual recall hint from topic and note context", () => {
    const hint = buildRecallHint({ topic: topics[1], promptIndex: 2, note });

    expect(hint).toContain("bottlenecks");
    expect(hint).toContain("failover");
  });
});
