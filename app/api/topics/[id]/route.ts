import { NextResponse } from "next/server";
import { parseJsonBody, requireApiUser } from "@/lib/server/apiAuth";
import {
  deleteTopicForUser,
  getTopic,
  saveTopicForUser,
} from "@/lib/repositories/workspaceRepository";
import type { Topic } from "@/lib/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const authUser = await requireApiUser();
  if (!authUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const topic = await getTopic(authUser.userId, id);
  if (!topic) {
    return NextResponse.json({ message: "Topic not found" }, { status: 404 });
  }

  return NextResponse.json(topic);
}

export async function PUT(request: Request, context: RouteContext) {
  const authUser = await requireApiUser();
  if (!authUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const topic = await parseJsonBody<Topic>(request);
  return NextResponse.json(
    await saveTopicForUser(authUser.userId, { ...topic, id }),
  );
}

export async function PATCH(request: Request, context: RouteContext) {
  const authUser = await requireApiUser();
  if (!authUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const existing = await getTopic(authUser.userId, id);
  if (!existing) {
    return NextResponse.json({ message: "Topic not found" }, { status: 404 });
  }

  const updates = await parseJsonBody<Partial<Topic>>(request);
  return NextResponse.json(
    await saveTopicForUser(authUser.userId, {
      ...(existing as unknown as Topic),
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
  await deleteTopicForUser(authUser.userId, id);
  return NextResponse.json({ ok: true });
}
