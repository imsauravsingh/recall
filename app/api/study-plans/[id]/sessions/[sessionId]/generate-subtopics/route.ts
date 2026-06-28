import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/server/apiAuth";
import {
  getStudyPlanForUser,
  updateSessionSubTopicsForUser,
} from "@/lib/repositories/studyPlanRepository";
import { listAIProviderConfigRecords } from "@/lib/repositories/aiProviderRepository";
import { generateWithProvider } from "@/lib/ai/adapters";
import {
  buildSubTopicPrompt,
  parseSubTopicResponse,
} from "@/lib/ai/studyPlanPrompt";

type RouteContext = { params: Promise<{ id: string; sessionId: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const authUser = await requireApiUser();
  if (!authUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id, sessionId } = await context.params;
  const plan = await getStudyPlanForUser(authUser.userId, id);
  if (!plan) {
    return NextResponse.json({ message: "Study plan not found" }, { status: 404 });
  }

  const session = plan.weeks
    .flatMap((w) => w.sessions ?? [])
    .find((s) => s.id === sessionId);
  if (!session) {
    return NextResponse.json({ message: "Session not found" }, { status: 404 });
  }

  const providers = await listAIProviderConfigRecords(authUser.userId);
  const connected = providers.filter(
    (p) => p.enabled && p.status === "connected",
  );

  if (connected.length === 0) {
    return NextResponse.json(
      { message: "No connected AI provider. Configure one in Settings first." },
      { status: 400 },
    );
  }

  const prompt = buildSubTopicPrompt(session, {
    targetRole: plan.targetRole,
    techStack: plan.techStack ?? [],
    targetCompany: plan.targetCompany,
    yearsOfExperience: plan.yearsOfExperience,
  });

  const errors: string[] = [];
  for (const provider of connected) {
    try {
      const raw = await generateWithProvider(provider, {
        prompt,
        maxTokens: 3000,
        temperature: 0.2,
      });
      const subTopics = parseSubTopicResponse(raw);
      const updated = await updateSessionSubTopicsForUser(
        authUser.userId,
        id,
        sessionId,
        subTopics,
      );
      return NextResponse.json(updated);
    } catch (err) {
      errors.push(`${provider.label}: ${(err as Error).message}`);
    }
  }

  return NextResponse.json(
    { message: `AI generation failed:\n${errors.join("\n")}` },
    { status: 400 },
  );
}
