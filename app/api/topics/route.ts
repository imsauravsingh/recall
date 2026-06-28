import { NextResponse } from "next/server";
import { parseJsonBody, requireApiUser } from "@/lib/server/apiAuth";
import {
  listTopics,
  saveTopicForUser,
} from "@/lib/repositories/workspaceRepository";
import type { Topic } from "@/lib/types";

export async function GET() {
  const authUser = await requireApiUser();
  if (!authUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(await listTopics(authUser.userId));
}

export async function POST(request: Request) {
  const authUser = await requireApiUser();
  if (!authUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const topic = await parseJsonBody<Topic>(request);
  return NextResponse.json(await saveTopicForUser(authUser.userId, topic));
}
