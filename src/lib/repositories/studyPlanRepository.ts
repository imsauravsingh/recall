import "server-only";
import type {
  InterviewStudyPlan,
  PlanWeek,
  SubTopic,
  WizardInput,
} from "@/lib/contentService";
import { StudyPlanModel } from "@/lib/db/models";
import { connectMongoDB } from "@/lib/db/mongodb";

function cleanDocument(document: Record<string, unknown>): InterviewStudyPlan {
  const { _id, __v, ownerId, ...rest } = document;
  void _id;
  void __v;
  void ownerId;
  return rest as unknown as InterviewStudyPlan;
}

function withId(
  input: Partial<InterviewStudyPlan>,
): Partial<InterviewStudyPlan> & { id: string } {
  const now = new Date().toISOString();
  return {
    ...input,
    id: input.id ?? crypto.randomUUID(),
    createdAt: input.createdAt ?? now,
    updatedAt: now,
  };
}

export async function listStudyPlansForUser(
  ownerId: string,
): Promise<InterviewStudyPlan[]> {
  await connectMongoDB();
  const plans = await StudyPlanModel.find({ ownerId })
    .sort({ updatedAt: -1 })
    .lean()
    .exec();
  return plans.map((p) => cleanDocument(p as Record<string, unknown>));
}

export async function getStudyPlanForUser(
  ownerId: string,
  id: string,
): Promise<InterviewStudyPlan | null> {
  await connectMongoDB();
  const plan = await StudyPlanModel.findOne({ ownerId, id }).lean().exec();
  return plan ? cleanDocument(plan as Record<string, unknown>) : null;
}

export async function createStudyPlanForUser(
  ownerId: string,
  input: Omit<InterviewStudyPlan, "id" | "createdAt" | "updatedAt">,
): Promise<InterviewStudyPlan> {
  await connectMongoDB();
  const record = withId({ ...input, status: input.status ?? "active" });
  const saved = await StudyPlanModel.findOneAndUpdate(
    { ownerId, id: record.id },
    { $set: { ...record, ownerId } },
    { new: true, upsert: true },
  )
    .lean()
    .exec();
  return cleanDocument(saved as Record<string, unknown>);
}

export async function updateStudyPlanForUser(
  ownerId: string,
  id: string,
  patch: Partial<InterviewStudyPlan>,
): Promise<InterviewStudyPlan | null> {
  await connectMongoDB();
  const saved = await StudyPlanModel.findOneAndUpdate(
    { ownerId, id },
    { $set: { ...patch, updatedAt: new Date().toISOString() } },
    { new: true },
  )
    .lean()
    .exec();
  return saved ? cleanDocument(saved as Record<string, unknown>) : null;
}

export async function deleteStudyPlanForUser(
  ownerId: string,
  id: string,
): Promise<void> {
  await connectMongoDB();
  await StudyPlanModel.deleteOne({ ownerId, id }).exec();
}

export async function setStudyPlanStatusForUser(
  ownerId: string,
  id: string,
  status: "active" | "archived" | "completed",
): Promise<InterviewStudyPlan | null> {
  return updateStudyPlanForUser(ownerId, id, { status });
}

export async function duplicateStudyPlanForUser(
  ownerId: string,
  id: string,
): Promise<InterviewStudyPlan | null> {
  const original = await getStudyPlanForUser(ownerId, id);
  if (!original) return null;

  const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = original;
  void _id;
  void _c;
  void _u;

  return createStudyPlanForUser(ownerId, {
    ...rest,
    title: `${original.title} (Copy)`,
    status: "active",
    weeks: original.weeks.map((week) => ({
      ...week,
      sessions: week.sessions.map((s) => ({
        ...s,
        completed: false,
        completedAt: undefined,
      })),
    })),
    mockInterviews: original.mockInterviews.map((m) => ({
      ...m,
      completed: false,
    })),
  });
}

export async function markSessionCompleteForUser(
  ownerId: string,
  planId: string,
  weekNumber: number,
  sessionId: string,
  completed: boolean,
): Promise<InterviewStudyPlan | null> {
  const plan = await getStudyPlanForUser(ownerId, planId);
  if (!plan) return null;

  const now = new Date().toISOString();
  const updatedWeeks: PlanWeek[] = plan.weeks.map((week) => {
    if (week.weekNumber !== weekNumber) return week;
    return {
      ...week,
      sessions: week.sessions.map((session) => {
        if (session.id !== sessionId) return session;
        return {
          ...session,
          completed,
          completedAt: completed ? now : undefined,
        };
      }),
    };
  });

  return updateStudyPlanForUser(ownerId, planId, { weeks: updatedWeeks });
}

export async function replaceWeekForUser(
  ownerId: string,
  planId: string,
  weekNumber: number,
  newWeek: PlanWeek,
): Promise<InterviewStudyPlan | null> {
  const plan = await getStudyPlanForUser(ownerId, planId);
  if (!plan) return null;

  const updatedWeeks = plan.weeks.map((week) =>
    week.weekNumber === weekNumber ? newWeek : week,
  );

  return updateStudyPlanForUser(ownerId, planId, { weeks: updatedWeeks });
}

export async function updateSessionSubTopicsForUser(
  ownerId: string,
  planId: string,
  sessionId: string,
  subTopics: SubTopic[],
): Promise<InterviewStudyPlan | null> {
  const plan = await getStudyPlanForUser(ownerId, planId);
  if (!plan) return null;

  const updatedWeeks: PlanWeek[] = plan.weeks.map((week) => ({
    ...week,
    sessions: (week.sessions ?? []).map((session) =>
      session.id === sessionId ? { ...session, subTopics } : session,
    ),
  }));

  return updateStudyPlanForUser(ownerId, planId, { weeks: updatedWeeks });
}

export async function getWizardInputFromPlan(
  plan: InterviewStudyPlan,
): Promise<WizardInput> {
  return {
    targetRole: plan.targetRole,
    techStack: plan.techStack,
    yearsOfExperience: plan.yearsOfExperience,
    targetTimeline: plan.targetTimeline,
    targetCompany: plan.targetCompany,
    jobDescription: plan.jobDescription,
  };
}
