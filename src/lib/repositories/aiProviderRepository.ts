import "server-only";
import type {
  AIProviderConfigInput,
  AIProviderConfigRecord,
  AIProviderPublicConfig,
} from "@/lib/ai/types";
import { AIProviderConfigModel } from "@/lib/db/models";
import { connectMongoDB } from "@/lib/db/mongodb";
import { encryptSecret, maskSecret } from "@/lib/crypto/secrets";

function cleanProvider(document: Record<string, unknown>) {
  const { _id, __v, ...rest } = document;
  void _id;
  void __v;
  return rest as AIProviderConfigRecord;
}

function toPublicConfig(
  config: AIProviderConfigRecord,
): AIProviderPublicConfig {
  const { ownerId, encryptedApiKey, ...publicConfig } = config;
  void ownerId;
  void encryptedApiKey;
  return publicConfig;
}

export async function listAIProviderConfigs(ownerId: string) {
  await connectMongoDB();
  const configs = await AIProviderConfigModel.find({ ownerId })
    .sort({ priority: 1, updatedAt: -1 })
    .lean()
    .exec();
  return configs.map((config) =>
    toPublicConfig(cleanProvider(config as unknown as Record<string, unknown>)),
  );
}

export async function listAIProviderConfigRecords(ownerId: string) {
  await connectMongoDB();
  const configs = await AIProviderConfigModel.find({ ownerId })
    .sort({ priority: 1, updatedAt: -1 })
    .lean()
    .exec();
  return configs.map((config) =>
    cleanProvider(config as unknown as Record<string, unknown>),
  );
}

export async function getAIProviderConfigRecord(ownerId: string, id: string) {
  await connectMongoDB();
  const config = await AIProviderConfigModel.findOne({ ownerId, id })
    .lean()
    .exec();
  return config
    ? cleanProvider(config as unknown as Record<string, unknown>)
    : null;
}

export async function saveAIProviderConfig(
  ownerId: string,
  input: AIProviderConfigInput,
) {
  await connectMongoDB();
  const now = new Date().toISOString();
  const id = input.id ?? crypto.randomUUID();
  const update: Partial<AIProviderConfigRecord> = {
    id,
    ownerId,
    provider: input.provider,
    label: input.label,
    baseUrl: input.baseUrl,
    model: input.model,
    enabled: input.enabled,
    priority: input.priority,
    costMode: input.costMode,
    status: "untested",
    lastError: undefined,
    updatedAt: now,
  };

  if (input.apiKey !== undefined) {
    update.encryptedApiKey = input.apiKey
      ? encryptSecret(input.apiKey)
      : undefined;
    update.maskedKey = input.apiKey ? maskSecret(input.apiKey) : undefined;
  }

  const saved = await AIProviderConfigModel.findOneAndUpdate(
    { ownerId, id },
    {
      $setOnInsert: { createdAt: now },
      $set: update,
    },
    { new: true, upsert: true },
  )
    .lean()
    .exec();

  return toPublicConfig(cleanProvider(saved as unknown as Record<string, unknown>));
}

export async function updateAIProviderTestStatus(
  ownerId: string,
  id: string,
  status: "connected" | "error",
  lastError?: string,
) {
  await connectMongoDB();
  const saved = await AIProviderConfigModel.findOneAndUpdate(
    { ownerId, id },
    {
      $set: {
        status,
        lastTestedAt: new Date().toISOString(),
        lastError,
      },
    },
    { new: true },
  )
    .lean()
    .exec();

  return saved
    ? toPublicConfig(cleanProvider(saved as unknown as Record<string, unknown>))
    : null;
}

export async function deleteAIProviderConfig(ownerId: string, id: string) {
  await connectMongoDB();
  await AIProviderConfigModel.deleteOne({ ownerId, id }).exec();
}
