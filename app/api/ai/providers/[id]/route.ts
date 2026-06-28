import { NextResponse } from "next/server";
import { parseJsonBody, requireApiUser } from "@/lib/server/apiAuth";
import {
  deleteAIProviderConfig,
  getAIProviderConfigRecord,
  saveAIProviderConfig,
} from "@/lib/repositories/aiProviderRepository";
import type { AIProviderConfigInput } from "@/lib/ai/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const authUser = await requireApiUser();
  if (!authUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const existing = await getAIProviderConfigRecord(authUser.userId, id);
  if (!existing) {
    return NextResponse.json({ message: "Provider not found" }, { status: 404 });
  }

  const updates = await parseJsonBody<Partial<AIProviderConfigInput>>(request);
  return NextResponse.json(
    await saveAIProviderConfig(authUser.userId, {
      provider: existing.provider,
      label: existing.label,
      model: existing.model,
      enabled: existing.enabled,
      priority: existing.priority,
      costMode: existing.costMode,
      baseUrl: existing.baseUrl,
      ...updates,
      id,
    }),
  );
}

export async function DELETE(_request: Request, context: RouteContext) {
  const authUser = await requireApiUser();
  if (!authUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  await deleteAIProviderConfig(authUser.userId, id);
  return NextResponse.json({ ok: true });
}
