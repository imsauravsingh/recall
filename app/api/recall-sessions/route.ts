import { NextResponse } from "next/server";
import { parseJsonBody, requireApiUser } from "@/lib/server/apiAuth";
import {
  listRecallSessions,
  saveRecallSessionForUser,
} from "@/lib/repositories/workspaceRepository";
import type { RecallSession } from "@/lib/types";

export async function GET(request: Request) {
  const authUser = await requireApiUser();
  if (!authUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const topicId = url.searchParams.get("topicId") ?? undefined;
  return NextResponse.json(await listRecallSessions(authUser.userId, topicId));
}

export async function POST(request: Request) {
  const authUser = await requireApiUser();
  if (!authUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const session = await parseJsonBody<
    Omit<RecallSession, "id" | "createdAt"> & Partial<RecallSession>
  >(request);
  return NextResponse.json(
    await saveRecallSessionForUser(authUser.userId, session),
  );
}
