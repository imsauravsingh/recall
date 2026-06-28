import { NextResponse } from "next/server";
import { requireApiUser, parseJsonBody } from "@/lib/server/apiAuth";
import {
  getTopicCategory,
  upsertTopicCategory,
} from "@/lib/repositories/topicLibraryRepository";
import type { TopicCategory } from "@/lib/contentService";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ categoryId: string }> },
) {
  const authUser = await requireApiUser();
  if (!authUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const { categoryId } = await params;
  const category = await getTopicCategory(authUser.userId, categoryId);
  if (!category) {
    return NextResponse.json(null);
  }
  return NextResponse.json(category);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ categoryId: string }> },
) {
  const authUser = await requireApiUser();
  if (!authUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const { categoryId } = await params;
  const body = await parseJsonBody<TopicCategory>(req);
  if (!body) {
    return NextResponse.json({ message: "Invalid body" }, { status: 400 });
  }
  // Ensure the id matches the route param
  const category = { ...body, id: categoryId };
  const saved = await upsertTopicCategory(authUser.userId, category);
  return NextResponse.json(saved);
}
