import { NextResponse } from "next/server";
import { parseJsonBody, requireApiUser } from "@/lib/server/apiAuth";
import {
  listStudyPlansForUser,
  createStudyPlanForUser,
} from "@/lib/repositories/studyPlanRepository";
import type { InterviewStudyPlan } from "@/lib/contentService";

export async function GET() {
  const authUser = await requireApiUser();
  if (!authUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(await listStudyPlansForUser(authUser.userId));
}

export async function POST(request: Request) {
  const authUser = await requireApiUser();
  if (!authUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await parseJsonBody<
    Omit<InterviewStudyPlan, "id" | "createdAt" | "updatedAt">
  >(request);
  const plan = await createStudyPlanForUser(authUser.userId, body);
  return NextResponse.json(plan, { status: 201 });
}
