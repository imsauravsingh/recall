import type { AIProviderKey } from "@/lib/ai/types";

export type ProviderCatalogItem = {
  provider: AIProviderKey;
  label: string;
  vendor: string;
  defaultModel: string;
  defaultBaseUrl?: string;
  needsApiKey: boolean;
};

export const providerCatalog: ProviderCatalogItem[] = [
  {
    provider: "openai",
    label: "OpenAI",
    vendor: "OpenAI-compatible",
    defaultModel: "gpt-4o-mini",
    defaultBaseUrl: "https://api.openai.com/v1",
    needsApiKey: true,
  },
  {
    provider: "openrouter",
    label: "OpenRouter",
    vendor: "Multi-provider router",
    defaultModel: "openai/gpt-4o-mini",
    defaultBaseUrl: "https://openrouter.ai/api/v1",
    needsApiKey: true,
  },
  {
    provider: "deepseek",
    label: "DeepSeek",
    vendor: "OpenAI-compatible",
    defaultModel: "deepseek-chat",
    defaultBaseUrl: "https://api.deepseek.com",
    needsApiKey: true,
  },
  {
    provider: "claude",
    label: "Claude",
    vendor: "Anthropic",
    defaultModel: "claude-3-5-haiku-latest",
    defaultBaseUrl: "https://api.anthropic.com",
    needsApiKey: true,
  },
  {
    provider: "gemini",
    label: "Gemini",
    vendor: "Google",
    defaultModel: "gemini-2.0-flash",
    defaultBaseUrl: "https://generativelanguage.googleapis.com",
    needsApiKey: true,
  },
  {
    provider: "ollama",
    label: "Ollama",
    vendor: "Local OpenAI-compatible",
    defaultModel: "llama3.1",
    defaultBaseUrl: "http://localhost:11434/v1",
    needsApiKey: false,
  },
  {
    provider: "custom",
    label: "Custom",
    vendor: "OpenAI-compatible",
    defaultModel: "model-name",
    defaultBaseUrl: "",
    needsApiKey: false,
  },
];

export function getProviderCatalogItem(provider: AIProviderKey) {
  return providerCatalog.find((item) => item.provider === provider);
}
