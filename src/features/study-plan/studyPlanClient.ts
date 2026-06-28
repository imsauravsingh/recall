import type { InterviewStudyPlan, WizardInput } from "@/lib/contentService";
import { ApiRoutes, callApi } from "@/lib/api";

export async function fetchStudyPlans(): Promise<InterviewStudyPlan[]> {
  return callApi<InterviewStudyPlan[]>(ApiRoutes.studyPlans.list);
}

export async function fetchStudyPlan(id: string): Promise<InterviewStudyPlan> {
  return callApi<InterviewStudyPlan>(ApiRoutes.studyPlans.detail(id));
}

export async function createStudyPlan(
  plan: Omit<InterviewStudyPlan, "id" | "createdAt" | "updatedAt">,
): Promise<InterviewStudyPlan> {
  return callApi<InterviewStudyPlan>(ApiRoutes.studyPlans.list, "POST", plan);
}

export async function patchStudyPlan(
  id: string,
  patch: Partial<InterviewStudyPlan>,
): Promise<InterviewStudyPlan> {
  return callApi<InterviewStudyPlan>(
    ApiRoutes.studyPlans.update(id),
    "PATCH",
    patch,
  );
}

export async function deleteStudyPlan(id: string): Promise<void> {
  await callApi(ApiRoutes.studyPlans.delete(id), "DELETE");
}

export async function archiveStudyPlan(
  id: string,
): Promise<InterviewStudyPlan> {
  return callApi<InterviewStudyPlan>(
    ApiRoutes.studyPlans.archive(id),
    "POST",
  );
}

export async function restoreStudyPlan(
  id: string,
): Promise<InterviewStudyPlan> {
  return callApi<InterviewStudyPlan>(
    ApiRoutes.studyPlans.restore(id),
    "POST",
  );
}

export async function duplicateStudyPlan(
  id: string,
): Promise<InterviewStudyPlan> {
  return callApi<InterviewStudyPlan>(
    ApiRoutes.studyPlans.duplicate(id),
    "POST",
  );
}

export async function updateSessionProgress(
  planId: string,
  weekNumber: number,
  sessionId: string,
  completed: boolean,
): Promise<InterviewStudyPlan> {
  return callApi<InterviewStudyPlan>(
    ApiRoutes.studyPlans.progress(planId),
    "PATCH",
    { weekNumber, sessionId, completed },
  );
}

export async function generateStudyPlan(
  input: WizardInput,
): Promise<InterviewStudyPlan> {
  return callApi<InterviewStudyPlan>(
    ApiRoutes.ai.generateStudyPlan,
    "POST",
    input,
  );
}

export async function regeneratePlan(
  id: string,
): Promise<InterviewStudyPlan> {
  return callApi<InterviewStudyPlan>(
    ApiRoutes.studyPlans.regenerate(id),
    "POST",
  );
}

export async function regenerateWeek(
  id: string,
  weekNumber: number,
): Promise<InterviewStudyPlan> {
  return callApi<InterviewStudyPlan>(
    ApiRoutes.studyPlans.regenerateWeek(id),
    "POST",
    { weekNumber },
  );
}

export async function generateSessionSubTopics(
  planId: string,
  sessionId: string,
): Promise<InterviewStudyPlan> {
  return callApi<InterviewStudyPlan>(
    ApiRoutes.studyPlans.generateSubTopics(planId, sessionId),
    "POST",
  );
}
