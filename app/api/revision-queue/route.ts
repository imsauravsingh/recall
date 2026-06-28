import { NextResponse } from "next/server";
import { parseJsonBody, requireApiUser } from "@/lib/server/apiAuth";
import {
  listRevisionQueue,
  saveRevisionQueueItemForUser,
} from "@/lib/repositories/workspaceRepository";
import type { RevisionQueueItem } from "@/lib/types";

export async function GET() {
  const authUser = await requireApiUser();
  if (!authUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(await listRevisionQueue(authUser.userId));
}

export async function POST(request: Request) {
  const authUser = await requireApiUser();
  if (!authUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const item = await parseJsonBody<RevisionQueueItem>(request);
  return NextResponse.json(
    await saveRevisionQueueItemForUser(authUser.userId, item),
  );
}
