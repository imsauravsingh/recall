import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/server/apiAuth";
import {
  getStudyPlanForUser,
  updateStudyPlanForUser,
} from "@/lib/repositories/studyPlanRepository";
import { listAIProviderConfigRecords } from "@/lib/repositories/aiProviderRepository";
import { generateStudyPlanWithProviders } from "@/lib/ai/gateway.server";
import { getWizardInputFromPlan } from "@/lib/repositories/studyPlanRepository";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const authUser = await requireApiUser();
  if (!authUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const existing = await getStudyPlanForUser(authUser.userId, id);
  if (!existing) {
    return NextResponse.json({ message: "Study plan not found" }, { status: 404 });
  }

  const providers = await listAIProviderConfigRecords(authUser.userId);
  const wizardInput = await getWizardInputFromPlan(existing);

  try {
    const generated = await generateStudyPlanWithProviders(providers, wizardInput);
    const updated = await updateStudyPlanForUser(authUser.userId, id, {
      interviewAreas: generated.interviewAreas,
      weeks: generated.weeks,
      mockInterviews: generated.mockInterviews,
      milestones: generated.milestones,
      recallTemplates: generated.recallTemplates,
      sourcePrompt: generated.sourcePrompt,
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 400 },
    );
  }
}
