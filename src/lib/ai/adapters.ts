import "server-only";
import type { AIProviderConfigRecord } from "@/lib/ai/types";
import { decryptSecret } from "@/lib/crypto/secrets";
import { getProviderCatalogItem } from "@/lib/ai/providerCatalog";

type GenerateOptions = {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
};

function getApiKey(config: AIProviderConfigRecord) {
  return config.encryptedApiKey
    ? decryptSecret(config.encryptedApiKey)
    : undefined;
}

function getBaseUrl(config: AIProviderConfigRecord) {
  const catalog = getProviderCatalogItem(config.provider);
  return (config.baseUrl || catalog?.defaultBaseUrl || "").replace(/\/$/, "");
}

async function readError(response: Response) {
  const text = await response.text().catch(() => "");
  return text.slice(0, 400) || `HTTP ${response.status}`;
}

async function generateOpenAICompatible(
  config: AIProviderConfigRecord,
  options: GenerateOptions,
) {
  const apiKey = getApiKey(config);
  const baseUrl = getBaseUrl(config);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  if (config.provider === "openrouter") {
    headers["HTTP-Referer"] = "http://localhost:3000";
    headers["X-Title"] = "Recall.dev";
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: config.model,
      messages: [{ role: "user", content: options.prompt }],
      temperature: options.temperature ?? 0.2,
      max_tokens: options.maxTokens ?? 1200,
    }),
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  const payload = await response.json();
  return payload.choices?.[0]?.message?.content as string | undefined;
}

async function generateClaude(
  config: AIProviderConfigRecord,
  options: GenerateOptions,
) {
  const apiKey = getApiKey(config);
  if (!apiKey) {
    throw new Error("Claude requires an API key.");
  }

  const response = await fetch(`${getBaseUrl(config)}/v1/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: options.maxTokens ?? 1200,
      temperature: options.temperature ?? 0.2,
      messages: [{ role: "user", content: options.prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  const payload = await response.json();
  return payload.content?.[0]?.text as string | undefined;
}

async function generateGemini(
  config: AIProviderConfigRecord,
  options: GenerateOptions,
) {
  const apiKey = getApiKey(config);
  if (!apiKey) {
    throw new Error("Gemini requires an API key.");
  }

  const response = await fetch(
    `${getBaseUrl(config)}/v1beta/models/${config.model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: options.prompt }] }],
        generationConfig: {
          temperature: options.temperature ?? 0.2,
          maxOutputTokens: options.maxTokens ?? 1200,
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  const payload = await response.json();
  return payload.candidates?.[0]?.content?.parts?.[0]?.text as
    | string
    | undefined;
}

export async function generateWithProvider(
  config: AIProviderConfigRecord,
  options: GenerateOptions,
) {
  const text =
    config.provider === "claude"
      ? await generateClaude(config, options)
      : config.provider === "gemini"
        ? await generateGemini(config, options)
        : await generateOpenAICompatible(config, options);

  if (!text) {
    throw new Error("Provider returned an empty response.");
  }

  return text;
}

export async function testProviderConnection(config: AIProviderConfigRecord) {
  const response = await generateWithProvider(config, {
    prompt: 'Reply with exactly: {"ok":true}',
    maxTokens: 30,
    temperature: 0,
  });

  return response.length > 0;
}
