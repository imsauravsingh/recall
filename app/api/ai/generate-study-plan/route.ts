import { NextResponse } from "next/server";
import { parseJsonBody, requireApiUser } from "@/lib/server/apiAuth";
import { generateStudyPlanWithProviders } from "@/lib/ai/gateway.server";
import { listAIProviderConfigRecords } from "@/lib/repositories/aiProviderRepository";
import type { WizardInput } from "@/lib/contentService";

export async function POST(request: Request) {
  const authUser = await requireApiUser();
  if (!authUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const input = await parseJsonBody<WizardInput>(request);

  if (
    !input.targetRole ||
    !input.techStack?.length ||
    !input.yearsOfExperience ||
    !input.targetTimeline
  ) {
    return NextResponse.json(
      { message: "targetRole, techStack, yearsOfExperience, and targetTimeline are required." },
      { status: 422 },
    );
  }

  const providers = await listAIProviderConfigRecords(authUser.userId);

  try {
    const plan = await generateStudyPlanWithProviders(providers, input);
    return NextResponse.json(plan);
  } catch (error) {
    const message = (error as Error).message;
    const status = message.includes("No connected AI provider") ? 422 : 400;
    return NextResponse.json({ message }, { status });
  }
}
