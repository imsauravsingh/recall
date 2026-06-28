import { ApiRoutes, callApi } from "@/lib/api";
import type {
  AIProviderConfigInput,
  AIProviderPublicConfig,
} from "@/lib/ai/types";

export async function fetchAIProviders() {
  return callApi<AIProviderPublicConfig[]>(ApiRoutes.ai.providers);
}

export async function saveAIProvider(input: AIProviderConfigInput) {
  return callApi<AIProviderPublicConfig>(ApiRoutes.ai.providers, "POST", input);
}

export async function updateAIProvider(
  id: string,
  input: Partial<AIProviderConfigInput>,
) {
  return callApi<AIProviderPublicConfig>(
    ApiRoutes.ai.provider(id),
    "PATCH",
    input,
  );
}

export async function testAIProvider(id: string) {
  return callApi<AIProviderPublicConfig>(ApiRoutes.ai.testProvider(id), "POST");
}

export async function deleteAIProvider(id: string) {
  return callApi<{ ok: boolean }>(ApiRoutes.ai.provider(id), "DELETE");
}
