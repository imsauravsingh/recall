import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/server/apiAuth";
import { listStudyPlans, saveStudyPlanForUser } from "@/lib/repositories/workspaceRepository";
import type { StudyPlan } from "@/lib/contentService";

const defaultStudyPlan: StudyPlan = {
  title: "Interview Readiness Plan",
  description: "Personalized study plan created during onboarding.",
  status: "active",
  dailySchedule: [],
  weeks: [],
  monthlyGoals: [],
  recallNoteSections: [
    "Mental model",
    "Execution flow",
    "Edge cases",
    "Trade-offs",
    "Common mistakes",
  ],
};

export async function POST() {
  const authUser = await requireApiUser();
  if (!authUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const existingPlans = await listStudyPlans(authUser.userId);
  const activePlan = existingPlans.find((plan) => plan.status !== "archived");
  if (activePlan?.id) {
    return NextResponse.json({ studyPlanId: activePlan.id });
  }

  const plan = await saveStudyPlanForUser(authUser.userId, defaultStudyPlan);
  return NextResponse.json({ studyPlanId: plan.id });
}
