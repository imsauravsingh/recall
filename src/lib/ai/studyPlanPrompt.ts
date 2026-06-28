import type {
  DaySession,
  InterviewStudyPlan,
  SubTopic,
  WizardInput,
} from "@/lib/contentService";

const TIMELINE_WEEKS: Record<string, number> = {
  "1 week": 1,
  "2 weeks": 2,
  "1 month": 4,
  "2 months": 8,
  "3 months": 12,
};

const MAX_TOKENS_BY_TIMELINE: Record<string, number> = {
  "1 week": 2000,
  "2 weeks": 3000,
  "1 month": 5000,
  "2 months": 6000,
  "3 months": 6000,
};

export function timelineToWeeks(timeline: string): number {
  return TIMELINE_WEEKS[timeline] ?? 4;
}

export function maxTokensForTimeline(timeline: string): number {
  return MAX_TOKENS_BY_TIMELINE[timeline] ?? 5000;
}

export function buildStudyPlanPrompt(input: WizardInput): string {
  const weeks = timelineToWeeks(input.targetTimeline);
  const isLongPlan = weeks > 4;
  const sessionsPerWeek = isLongPlan ? 4 : 5;

  return `You are an expert interview coach for senior software engineers at top tech companies.
Generate a highly targeted interview preparation roadmap as valid JSON.

TARGET CANDIDATE:
- Role: ${input.targetRole}
- Tech Stack: ${input.techStack.join(", ")}
- Years of Experience: ${input.yearsOfExperience}
- Timeline: ${input.targetTimeline} (${weeks} weeks)${input.targetCompany ? `\n- Target Company: ${input.targetCompany}` : ""}${
    input.jobDescription
      ? `\n- Job Description Context: ${input.jobDescription.slice(0, 600)}`
      : ""
  }

CRITICAL RULES:
1. This is NOT a learning roadmap. It is an INTERVIEW PREPARATION roadmap.
2. Skip all beginner and junior-level content. The candidate has ${input.yearsOfExperience}+ years.
3. Prioritize topics that appear most in interviews for ${input.targetRole}.
4. For senior+ roles: heavy system design, distributed systems, architecture.
5. For principal/staff/architect: add leadership, org design, cross-team coordination.
6. Include behavioral and resume deep-dives in every plan.
7. Mock interviews start from week 2 onwards.
8. Each week builds on the previous. Increase difficulty gradually.

Return ONLY a valid JSON object. NO markdown, NO code blocks, NO explanation text.

{
  "title": "descriptive plan title",
  "interviewAreas": [
    { "name": "DSA", "priority": "critical", "topics": ["Arrays & Strings", "Trees & Graphs", "Dynamic Programming"] }
  ],
  "weeks": [
    {
      "weekNumber": 1,
      "theme": "Week theme",
      "areas": ["DSA", "System Design"],
      "sessions": [
        { "id": "s1d1", "day": 1, "type": "dsa", "topic": "Topic name", "durationMinutes": 90, "notes": "Focus hint", "completed": false }
      ]
    }
  ],
  "mockInterviews": [
    { "id": "m1", "weekNumber": 2, "type": "dsa", "scheduledDay": 6, "durationMinutes": 60, "completed": false }
  ],
  "milestones": [
    { "weekNumber": ${Math.ceil(weeks / 2)}, "description": "Mid-point milestone", "checkpoints": ["Checkpoint 1", "Checkpoint 2"] },
    { "weekNumber": ${weeks}, "description": "Final milestone", "checkpoints": ["Ready check 1", "Ready check 2"] }
  ],
  "recallTemplates": [
    { "area": "DSA", "sections": ["Problem Pattern", "Approach", "Time & Space Complexity", "Common Pitfalls", "Interview Tips"] },
    { "area": "System Design", "sections": ["Requirements Clarification", "High-Level Architecture", "Component Deep-Dive", "Trade-offs", "Scaling Strategy"] }
  ]
}

REQUIREMENTS:
- Exactly ${weeks} weeks in the weeks array
- ${sessionsPerWeek} sessions per week on days 1-${sessionsPerWeek}
- Session types: dsa, system-design, behavioral, low-level-design, review, mock, resume
- interviewAreas: 5-8 areas with priority (critical/high/medium/low)
- mockInterviews: 1 mock per week starting week 2, on day 6 or 7
- recallTemplates: one per major interview area (3-5 templates)
- All ids must be unique strings
- Topics must be specific and actionable (not generic)`;
}

export function buildSubTopicPrompt(
  session: DaySession,
  plan: {
    targetRole: string;
    techStack: string[];
    targetCompany?: string;
    yearsOfExperience: number;
  },
): string {
  const typeGuidance: Record<string, string> = {
    dsa: "coding problems with LeetCode references, algorithm patterns, time/space complexity",
    "system-design":
      "system design scenarios, architecture decisions, scalability trade-offs",
    behavioral:
      "STAR-format behavioral questions, leadership scenarios, conflict resolution",
    "low-level-design":
      "class diagrams, design patterns, OOP principles, specific LLD questions",
    review: "key concepts to revise, common mistakes, quick recap items",
    mock: "full interview simulation items: coding, communication, edge-case handling",
    resume: "resume talking points, project deep-dives, impact quantification",
  };

  return `You are an expert interview coach for ${plan.targetRole} at top tech companies.
Generate a detailed, actionable preparation checklist for this study session.

SESSION:
- Topic: ${session.topic}
- Type: ${session.type}
- Duration: ${session.durationMinutes} minutes
- Focus: ${typeGuidance[session.type] ?? "general interview preparation"}

CANDIDATE:
- Role: ${plan.targetRole}
- Experience: ${plan.yearsOfExperience}+ years
- Tech Stack: ${plan.techStack.join(", ")}${plan.targetCompany ? `\n- Target Company: ${plan.targetCompany}` : ""}

Generate 6-10 specific, actionable preparation items for "${session.topic}".

Return ONLY a valid JSON array. NO markdown fences, NO explanation text:
[
  {
    "id": "unique_id_string",
    "type": "concept|coding-problem|design-problem|behavioral|know-cold",
    "title": "specific action or question title",
    "notes": "approach hint or key insight (1-2 sentences max)",
    "source": "LeetCode 297 or Book Name Ch.X or null",
    "difficulty": "easy|medium|hard or null",
    "completed": false
  }
]

TYPE RULES:
- coding-problem: specific algorithm/coding challenge, include LeetCode # when applicable
- concept: theory or pattern they must deeply understand
- know-cold: phrase as "Explain X without reference" — must answer in 60 sec
- design-problem: system/component design scenario question
- behavioral: exact STAR-format question like "Tell me about a time you..."

QUALITY RULES:
- Skip beginner/junior content (${plan.yearsOfExperience}+ years experience)
- Titles must be specific: "Implement LRU Cache using HashMap + DLL" NOT "LRU Cache"
- Notes should give approach hints or key insight, not restate the title
- For coding-problem: mention expected time/space complexity in notes
- For know-cold: include what a great answer should cover in notes`;
}

export function parseSubTopicResponse(raw: string): SubTopic[] {
  const arrayMatch = raw.match(/\[[\s\S]*\]/);
  if (!arrayMatch) {
    throw new Error("AI returned invalid sub-topic response.");
  }

  let parsed: Partial<SubTopic>[];
  try {
    parsed = JSON.parse(arrayMatch[0]) as Partial<SubTopic>[];
  } catch {
    throw new Error("Failed to parse sub-topic response as JSON.");
  }

  const validTypes = new Set([
    "concept",
    "coding-problem",
    "design-problem",
    "behavioral",
    "know-cold",
  ]);

  return parsed.map((item) => ({
    id: item.id ?? crypto.randomUUID(),
    title: item.title ?? "Untitled",
    type: validTypes.has(item.type ?? "")
      ? (item.type as SubTopic["type"])
      : "concept",
    notes: item.notes && item.notes !== "null" ? item.notes : undefined,
    source: item.source && item.source !== "null" ? item.source : undefined,
    difficulty: (["easy", "medium", "hard"] as const).includes(
      item.difficulty as "easy" | "medium" | "hard",
    )
      ? (item.difficulty as "easy" | "medium" | "hard")
      : undefined,
    completed: false,
  }));
}

function extractJson(raw: string): string {
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();

  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return raw.slice(firstBrace, lastBrace + 1);
  }

  return raw.trim();
}

export function parseStudyPlanResponse(
  raw: string,
  input: WizardInput,
  providerId?: string,
): Omit<InterviewStudyPlan, "id" | "createdAt" | "updatedAt"> {
  const jsonString = extractJson(raw);

  let parsed: Partial<InterviewStudyPlan>;
  try {
    parsed = JSON.parse(jsonString) as Partial<InterviewStudyPlan>;
  } catch {
    throw new Error(
      "AI returned invalid JSON. Please try again or choose a different provider.",
    );
  }

  if (
    !parsed.title ||
    !Array.isArray(parsed.weeks) ||
    parsed.weeks.length === 0
  ) {
    throw new Error("AI returned an incomplete plan. Please try again.");
  }

  return {
    title: parsed.title,
    status: "active",
    targetRole: input.targetRole,
    techStack: input.techStack,
    yearsOfExperience: input.yearsOfExperience,
    targetTimeline: input.targetTimeline,
    targetCompany: input.targetCompany,
    jobDescription: input.jobDescription,
    aiGenerated: true,
    sourcePrompt: buildStudyPlanPrompt(input),
    providerId,
    interviewAreas: parsed.interviewAreas ?? [],
    weeks: parsed.weeks ?? [],
    mockInterviews: parsed.mockInterviews ?? [],
    milestones: parsed.milestones ?? [],
    recallTemplates: parsed.recallTemplates ?? [],
  };
}
