import type { InterviewStudyPlan, WizardInput } from "@/lib/contentService";

export type AIProviderKey =
  | "openai"
  | "claude"
  | "gemini"
  | "deepseek"
  | "openrouter"
  | "ollama"
  | "custom";

export type AICostMode = "cheap" | "balanced" | "quality";

export type AIProviderConfigInput = {
  id?: string;
  provider: AIProviderKey;
  label: string;
  apiKey?: string;
  baseUrl?: string;
  model: string;
  enabled: boolean;
  priority: number;
  costMode: AICostMode;
};

export type AIProviderConfigRecord = Omit<AIProviderConfigInput, "apiKey"> & {
  id: string;
  ownerId: string;
  encryptedApiKey?: string;
  maskedKey?: string;
  status: "connected" | "error" | "untested";
  lastTestedAt?: string;
  lastError?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type AIProviderPublicConfig = Omit<
  AIProviderConfigRecord,
  "ownerId" | "encryptedApiKey"
>;

export type StudyPlanGenerationInput = WizardInput;

export type StudyPlanGenerationResult = {
  provider: string;
  model: string;
  plan: InterviewStudyPlan;
};
