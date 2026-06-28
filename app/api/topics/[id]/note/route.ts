import { NextResponse } from "next/server";
import { parseJsonBody, requireApiUser } from "@/lib/server/apiAuth";
import {
  getNote,
  saveNoteForUser,
} from "@/lib/repositories/workspaceRepository";
import type { Note } from "@/lib/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const authUser = await requireApiUser();
  if (!authUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  return NextResponse.json(await getNote(authUser.userId, id));
}

export async function PUT(request: Request, context: RouteContext) {
  const authUser = await requireApiUser();
  if (!authUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const updates = await parseJsonBody<Partial<Note>>(request);
  return NextResponse.json(await saveNoteForUser(authUser.userId, id, updates));
}
