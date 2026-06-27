import { getLocalStudyPlan } from "../../lib/contentService";
import {
  fetchInitialStudyPlan,
  saveInitialStudyPlan,
} from "../onboarding/onboardingApi";
import type { StudyPlan } from "../../lib/contentService";

export async function loadStudyPlan(): Promise<StudyPlan> {
  const savedPlan = await fetchInitialStudyPlan();
  return savedPlan ?? getLocalStudyPlan();
}

export async function saveStudyPlan(plan: StudyPlan): Promise<StudyPlan> {
  const now = new Date().toISOString();
  const saved = {
    ...plan,
    id: plan.id ?? crypto.randomUUID(),
    status: plan.status ?? "active",
    createdAt: plan.createdAt ?? now,
    updatedAt: now,
  };
  await saveInitialStudyPlan(saved);
  return saved;
}

export async function duplicateStudyPlan(plan: StudyPlan): Promise<StudyPlan> {
  const duplicated = {
    ...plan,
    id: crypto.randomUUID(),
    title: `${plan.title} (Copy)`,
    status: "active" as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await saveInitialStudyPlan(duplicated);
  return duplicated;
}

export async function archiveStudyPlan(plan: StudyPlan): Promise<StudyPlan> {
  const archived = {
    ...plan,
    status:
      plan.status === "archived" ? ("active" as const) : ("archived" as const),
    updatedAt: new Date().toISOString(),
  };
  await saveInitialStudyPlan(archived);
  return archived;
}
