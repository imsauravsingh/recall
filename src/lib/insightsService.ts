import type { Note, RecallSession, RevisionQueueItem, Topic } from "./types";

export interface RecallInsightSummary {
  recommendedTopicTitle?: string;
  recommendedTopicId?: string;
  focusArea: string;
  nextAction: string;
  averageScore: number;
}

export interface RecallHintContext {
  topic: Topic;
  promptIndex: number;
  note?: Note;
}

function toScoreMap(sessions: RecallSession[]) {
  const scoreByTopic = new Map<string, number[]>();
  for (const session of sessions) {
    const current = scoreByTopic.get(session.topicId) ?? [];
    current.push(session.score);
    scoreByTopic.set(session.topicId, current);
  }
  return scoreByTopic;
}

function getTopicAverageScore(
  scoreByTopic: Map<string, number[]>,
  topicId: string,
) {
  const scores = scoreByTopic.get(topicId);
  if (!scores || scores.length === 0) {
    return 68;
  }

  return scores.reduce((sum, value) => sum + value, 0) / scores.length;
}

export function getRecallInsights({
  topics,
  queueItems,
  sessions,
}: {
  topics: Topic[];
  queueItems: RevisionQueueItem[];
  sessions: RecallSession[];
}): RecallInsightSummary {
  const scoreByTopic = toScoreMap(sessions);
  const averageScore =
    sessions.length > 0
      ? Math.round(
          sessions.reduce((sum, item) => sum + item.score, 0) / sessions.length,
        )
      : 68;

  const orderedTopics = topics
    .filter((topic) => !topic.archived)
    .sort((left, right) => {
      const leftScore = getTopicAverageScore(scoreByTopic, left.id);
      const rightScore = getTopicAverageScore(scoreByTopic, right.id);
      return leftScore - rightScore;
    });

  const queuedTopic = orderedTopics.find((topic) =>
    queueItems.some((item) => item.topicId === topic.id),
  );
  const recommendedTopic = queuedTopic ?? orderedTopics[0];

  const weakTopics = orderedTopics.filter(
    (topic) => getTopicAverageScore(scoreByTopic, topic.id) < 60,
  );
  const focusCategory =
    recommendedTopic?.category ?? weakTopics[0]?.category ?? "Backend";

  return {
    recommendedTopicTitle: recommendedTopic?.title,
    recommendedTopicId: recommendedTopic?.id,
    focusArea: `${focusCategory} focus`,
    nextAction: recommendedTopic
      ? `Review ${recommendedTopic.title} before your next recall block.`
      : "Add a topic to start building momentum.",
    averageScore,
  };
}

export function buildRecallHint({
  topic,
  promptIndex,
  note,
}: RecallHintContext) {
  const promptHints = [
    "Lead with the core idea and explain why it matters in one sentence.",
    "Describe the flow step by step and mention the important handoffs.",
    "Call out the edge cases, boundary conditions, and common failure modes.",
  ];

  const topicCategoryHint =
    topic.category === "System Design"
      ? "Frame your answer around tradeoffs, bottlenecks, and scale constraints."
      : topic.category === "Backend"
        ? "Mention data flow, failure paths, and operational concerns."
        : "Tie your answer back to the practical pattern and the reason it is used.";

  const noteHint = note?.personalNotes
    ? `Use your note about ${note.personalNotes.toLowerCase()} as a reminder.`
    : "";

  return [
    promptHints[promptIndex] ?? promptHints[0],
    topicCategoryHint,
    noteHint,
  ]
    .filter(Boolean)
    .join(" ");
}
