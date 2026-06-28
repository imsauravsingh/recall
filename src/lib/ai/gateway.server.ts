import "server-only";
import type { AIProviderConfigRecord } from "@/lib/ai/types";
import type { InterviewStudyPlan, WizardInput } from "@/lib/contentService";
import { generateWithProvider } from "@/lib/ai/adapters";
import {
  buildStudyPlanPrompt,
  maxTokensForTimeline,
  parseStudyPlanResponse,
} from "@/lib/ai/studyPlanPrompt";

function sortProviders(providers: AIProviderConfigRecord[]) {
  return providers
    .filter((p) => p.enabled && p.status === "connected")
    .sort((a, b) => {
      const costOrder = { cheap: 0, balanced: 1, quality: 2 };
      return (
        costOrder[a.costMode] - costOrder[b.costMode] || a.priority - b.priority
      );
    });
}

export async function generateStudyPlanWithProviders(
  providers: AIProviderConfigRecord[],
  input: WizardInput,
): Promise<Omit<InterviewStudyPlan, "id" | "createdAt" | "updatedAt">> {
  const sorted = sortProviders(providers);

  if (sorted.length === 0) {
    throw new Error(
      "No connected AI provider found. Go to Settings and test your AI provider first.",
    );
  }

  const prompt = buildStudyPlanPrompt(input);
  const maxTokens = maxTokensForTimeline(input.targetTimeline);
  const errors: string[] = [];

  for (const provider of sorted) {
    try {
      const raw = await generateWithProvider(provider, {
        prompt,
        maxTokens,
        temperature: 0.15,
      });
      return parseStudyPlanResponse(raw, input, provider.id);
    } catch (error) {
      errors.push(`${provider.label}: ${(error as Error).message}`);
    }
  }

  throw new Error(`All AI providers failed:\n${errors.join("\n")}`);
}
