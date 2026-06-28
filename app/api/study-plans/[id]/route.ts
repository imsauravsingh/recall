import { NextResponse } from "next/server";
import { parseJsonBody, requireApiUser } from "@/lib/server/apiAuth";
import {
  getStudyPlanForUser,
  updateStudyPlanForUser,
  deleteStudyPlanForUser,
} from "@/lib/repositories/studyPlanRepository";
import type { InterviewStudyPlan } from "@/lib/contentService";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const authUser = await requireApiUser();
  if (!authUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const plan = await getStudyPlanForUser(authUser.userId, id);
  if (!plan) {
    return NextResponse.json({ message: "Study plan not found" }, { status: 404 });
  }

  return NextResponse.json(plan);
}

export async function PATCH(request: Request, context: RouteContext) {
  const authUser = await requireApiUser();
  if (!authUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const patch = await parseJsonBody<Partial<InterviewStudyPlan>>(request);
  const updated = await updateStudyPlanForUser(authUser.userId, id, patch);
  if (!updated) {
    return NextResponse.json({ message: "Study plan not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const authUser = await requireApiUser();
  if (!authUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const existing = await getStudyPlanForUser(authUser.userId, id);
  if (!existing) {
    return NextResponse.json({ message: "Study plan not found" }, { status: 404 });
  }

  await deleteStudyPlanForUser(authUser.userId, id);
  return NextResponse.json({ ok: true });
}
