import { NextResponse } from "next/server";
import { parseJsonBody, requireApiUser } from "@/lib/server/apiAuth";
import {
  deleteRevisionQueueItem,
  listRevisionQueue,
  saveRevisionQueueItemForUser,
} from "@/lib/repositories/workspaceRepository";
import type { RevisionQueueItem } from "@/lib/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const authUser = await requireApiUser();
  if (!authUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const item = (await listRevisionQueue(authUser.userId)).find(
    (queueItem) => queueItem.id === id,
  );
  if (!item) {
    return NextResponse.json(
      { message: "Revision queue item not found" },
      { status: 404 },
    );
  }

  return NextResponse.json(item);
}

export async function PUT(request: Request, context: RouteContext) {
  const authUser = await requireApiUser();
  if (!authUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const item = await parseJsonBody<RevisionQueueItem>(request);
  return NextResponse.json(
    await saveRevisionQueueItemForUser(authUser.userId, { ...item, id }),
  );
}

export async function DELETE(_request: Request, context: RouteContext) {
  const authUser = await requireApiUser();
  if (!authUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  await deleteRevisionQueueItem(authUser.userId, id);
  return NextResponse.json({ ok: true });
}
