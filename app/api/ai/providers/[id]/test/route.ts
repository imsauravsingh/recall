import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/server/apiAuth";
import {
  getAIProviderConfigRecord,
  updateAIProviderTestStatus,
} from "@/lib/repositories/aiProviderRepository";
import { testProviderConnection } from "@/lib/ai/adapters";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const authUser = await requireApiUser();
  if (!authUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const config = await getAIProviderConfigRecord(authUser.userId, id);
  if (!config) {
    return NextResponse.json({ message: "Provider not found" }, { status: 404 });
  }

  try {
    await testProviderConnection(config);
    return NextResponse.json(
      await updateAIProviderTestStatus(authUser.userId, id, "connected"),
    );
  } catch (error) {
    const message = (error as Error).message;
    await updateAIProviderTestStatus(authUser.userId, id, "error", message);
    return NextResponse.json({ message }, { status: 400 });
  }
}
