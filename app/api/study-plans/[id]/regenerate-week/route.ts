import { NextResponse } from "next/server";
import { parseJsonBody, requireApiUser } from "@/lib/server/apiAuth";
import {
  getStudyPlanForUser,
  replaceWeekForUser,
} from "@/lib/repositories/studyPlanRepository";
import { listAIProviderConfigRecords } from "@/lib/repositories/aiProviderRepository";
import { generateStudyPlanWithProviders } from "@/lib/ai/gateway.server";
import { getWizardInputFromPlan } from "@/lib/repositories/studyPlanRepository";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const authUser = await requireApiUser();
  if (!authUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const { weekNumber } = await parseJsonBody<{ weekNumber: number }>(request);
  const existing = await getStudyPlanForUser(authUser.userId, id);
  if (!existing) {
    return NextResponse.json({ message: "Study plan not found" }, { status: 404 });
  }

  const providers = await listAIProviderConfigRecords(authUser.userId);
  const wizardInput = await getWizardInputFromPlan(existing);

  try {
    const generated = await generateStudyPlanWithProviders(providers, wizardInput);
    const newWeek = generated.weeks.find((w) => w.weekNumber === weekNumber);
    if (!newWeek) {
      return NextResponse.json(
        { message: `Week ${weekNumber} not found in generated plan.` },
        { status: 400 },
      );
    }

    const updated = await replaceWeekForUser(
      authUser.userId,
      id,
      weekNumber,
      newWeek,
    );
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 400 },
    );
  }
}
