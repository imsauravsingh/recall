import type { StudyPlan } from "@/lib/contentService";
import type {
  Note,
  RecallSession,
  RevisionQueueItem,
  Topic,
} from "@/lib/types";
import type { OnboardingProfile } from "@/features/onboarding/onboardingTypes";
import { connectMongoDB } from "@/lib/db/mongodb";
import {
  NoteModel,
  RecallSessionModel,
  RevisionQueueItemModel,
  StudyPlanModel,
  TopicModel,
  UserModel,
} from "@/lib/db/models";

type UserInput = {
  clerkUserId: string;
  email?: string;
  name?: string;
};

function cleanDocument<T extends Record<string, unknown>>(document: T): T {
  const { _id, __v, ownerId, ...rest } = document;
  void _id;
  void __v;
  void ownerId;
  return rest as T;
}

function withId<T extends { id?: string; createdAt?: string; updatedAt?: string }>(
  input: T,
): T & { id: string } {
  const now = new Date().toISOString();
  return {
    ...input,
    id: input.id ?? crypto.randomUUID(),
    createdAt: input.createdAt ?? now,
    updatedAt: now,
  };
}

export async function ensureUser(input: UserInput) {
  await connectMongoDB();

  const user = await UserModel.findOneAndUpdate(
    { clerkUserId: input.clerkUserId },
    {
      $setOnInsert: { clerkUserId: input.clerkUserId },
      $set: {
        ...(input.email ? { email: input.email } : {}),
        ...(input.name ? { name: input.name } : {}),
      },
    },
    { new: true, upsert: true },
  )
    .lean()
    .exec();

  return cleanDocument(user as Record<string, unknown>);
}

export async function getUserProfile(ownerId: string) {
  await connectMongoDB();
  const user = await UserModel.findOne({ clerkUserId: ownerId }).lean().exec();
  return user ? cleanDocument(user as Record<string, unknown>) : null;
}

export async function saveOnboardingProfileForUser(
  ownerId: string,
  profile: OnboardingProfile,
) {
  await connectMongoDB();
  const user = await UserModel.findOneAndUpdate(
    { clerkUserId: ownerId },
    {
      $setOnInsert: { clerkUserId: ownerId },
      $set: { onboardingProfile: profile },
    },
    { new: true, upsert: true },
  )
    .lean()
    .exec();

  const cleanUser = cleanDocument(user as unknown as Record<string, unknown>);
  return cleanUser.onboardingProfile as OnboardingProfile;
}

export async function getOnboardingProfile(ownerId: string) {
  await connectMongoDB();
  const user = await UserModel.findOne({ clerkUserId: ownerId }).lean().exec();
  const cleanUser = user
    ? cleanDocument(user as unknown as Record<string, unknown>)
    : null;
  return (cleanUser?.onboardingProfile ?? null) as OnboardingProfile | null;
}

export async function listStudyPlans(ownerId: string) {
  await connectMongoDB();
  const plans = await StudyPlanModel.find({ ownerId })
    .sort({ updatedAt: -1 })
    .lean()
    .exec();
  return plans.map((plan) => cleanDocument(plan as Record<string, unknown>));
}

export async function getStudyPlan(ownerId: string, id: string) {
  await connectMongoDB();
  const plan = await StudyPlanModel.findOne({ ownerId, id }).lean().exec();
  return plan ? cleanDocument(plan as Record<string, unknown>) : null;
}

export async function saveStudyPlanForUser(ownerId: string, plan: StudyPlan) {
  await connectMongoDB();
  const record = withId({ ...plan, status: plan.status ?? "active" });
  const saved = await StudyPlanModel.findOneAndUpdate(
    { ownerId, id: record.id },
    { $set: { ...record, ownerId } },
    { new: true, upsert: true },
  )
    .lean()
    .exec();
  return cleanDocument(saved as Record<string, unknown>);
}

export async function duplicateStudyPlanForUser(ownerId: string, id: string) {
  const plan = (await getStudyPlan(ownerId, id)) as StudyPlan | null;
  if (!plan) {
    return null;
  }

  return saveStudyPlanForUser(ownerId, {
    ...plan,
    id: crypto.randomUUID(),
    title: `${plan.title} (Copy)`,
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

export async function setStudyPlanStatus(
  ownerId: string,
  id: string,
  status: "active" | "archived",
) {
  await connectMongoDB();
  const plan = await StudyPlanModel.findOneAndUpdate(
    { ownerId, id },
    { $set: { status, updatedAt: new Date() } },
    { new: true },
  )
    .lean()
    .exec();
  return plan ? cleanDocument(plan as Record<string, unknown>) : null;
}

export async function listTopics(ownerId: string) {
  await connectMongoDB();
  const topics = await TopicModel.find({ ownerId })
    .sort({ updatedAt: -1 })
    .lean()
    .exec();
  return topics.map((topic) => cleanDocument(topic as Record<string, unknown>));
}

export async function getTopic(ownerId: string, id: string) {
  await connectMongoDB();
  const topic = await TopicModel.findOne({ ownerId, id }).lean().exec();
  return topic ? cleanDocument(topic as Record<string, unknown>) : null;
}

export async function saveTopicForUser(ownerId: string, topic: Topic) {
  await connectMongoDB();
  const record = withId(topic);
  const saved = await TopicModel.findOneAndUpdate(
    { ownerId, id: record.id },
    { $set: { ...record, ownerId } },
    { new: true, upsert: true },
  )
    .lean()
    .exec();
  return cleanDocument(saved as Record<string, unknown>);
}

export async function deleteTopicForUser(ownerId: string, id: string) {
  await connectMongoDB();
  await TopicModel.deleteOne({ ownerId, id }).exec();
  await NoteModel.deleteOne({ ownerId, topicId: id }).exec();
  await RevisionQueueItemModel.deleteMany({ ownerId, topicId: id }).exec();
}

export async function getNote(ownerId: string, topicId: string) {
  await connectMongoDB();
  const note = await NoteModel.findOne({ ownerId, topicId }).lean().exec();
  return note ? cleanDocument(note as Record<string, unknown>) : null;
}

export async function saveNoteForUser(
  ownerId: string,
  topicId: string,
  updates: Partial<Note>,
) {
  await connectMongoDB();
  const now = new Date().toISOString();
  const saved = await NoteModel.findOneAndUpdate(
    { ownerId, topicId },
    {
      $setOnInsert: {
        id: topicId,
        topicId,
        createdAt: now,
      },
      $set: {
        ...updates,
        ownerId,
        topicId,
        updatedAt: now,
      },
    },
    { new: true, upsert: true },
  )
    .lean()
    .exec();
  return cleanDocument(saved as Record<string, unknown>);
}

export async function listRevisionQueue(ownerId: string) {
  await connectMongoDB();
  const items = await RevisionQueueItemModel.find({ ownerId })
    .sort({ dueDate: 1 })
    .lean()
    .exec();
  return items.map((item) => cleanDocument(item as Record<string, unknown>));
}

export async function saveRevisionQueueItemForUser(
  ownerId: string,
  item: RevisionQueueItem,
) {
  await connectMongoDB();
  const record = withId(item);
  const saved = await RevisionQueueItemModel.findOneAndUpdate(
    { ownerId, id: record.id },
    { $set: { ...record, ownerId } },
    { new: true, upsert: true },
  )
    .lean()
    .exec();
  return cleanDocument(saved as Record<string, unknown>);
}

export async function deleteRevisionQueueItem(ownerId: string, id: string) {
  await connectMongoDB();
  await RevisionQueueItemModel.deleteOne({ ownerId, id }).exec();
}

export async function listRecallSessions(ownerId: string, topicId?: string) {
  await connectMongoDB();
  const sessions = await RecallSessionModel.find({
    ownerId,
    ...(topicId ? { topicId } : {}),
  })
    .sort({ createdAt: -1 })
    .lean()
    .exec();
  return sessions.map((session) =>
    cleanDocument(session as Record<string, unknown>),
  );
}

export async function saveRecallSessionForUser(
  ownerId: string,
  session: Omit<RecallSession, "id" | "createdAt"> & Partial<RecallSession>,
) {
  await connectMongoDB();
  const record = withId(session);
  const saved = await RecallSessionModel.findOneAndUpdate(
    { ownerId, id: record.id },
    { $set: { ...record, ownerId } },
    { new: true, upsert: true },
  )
    .lean()
    .exec();
  return cleanDocument(saved as Record<string, unknown>);
}
