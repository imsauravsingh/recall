import { NextResponse } from "next/server";
import { parseJsonBody, requireApiUser } from "@/lib/server/apiAuth";
import {
  listAIProviderConfigs,
  saveAIProviderConfig,
} from "@/lib/repositories/aiProviderRepository";
import type { AIProviderConfigInput } from "@/lib/ai/types";

export async function GET() {
  const authUser = await requireApiUser();
  if (!authUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(await listAIProviderConfigs(authUser.userId));
}

export async function POST(request: Request) {
  const authUser = await requireApiUser();
  if (!authUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const input = await parseJsonBody<AIProviderConfigInput>(request);
  return NextResponse.json(await saveAIProviderConfig(authUser.userId, input));
}
