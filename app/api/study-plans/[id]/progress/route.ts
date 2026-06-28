import { NextResponse } from "next/server";
import { parseJsonBody, requireApiUser } from "@/lib/server/apiAuth";
import { markSessionCompleteForUser } from "@/lib/repositories/studyPlanRepository";

type RouteContext = { params: Promise<{ id: string }> };
type ProgressBody = { weekNumber: number; sessionId: string; completed: boolean };

export async function PATCH(request: Request, context: RouteContext) {
  const authUser = await requireApiUser();
  if (!authUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const { weekNumber, sessionId, completed } = await parseJsonBody<ProgressBody>(request);
  const plan = await markSessionCompleteForUser(
    authUser.userId,
    id,
    weekNumber,
    sessionId,
    completed,
  );
  if (!plan) {
    return NextResponse.json({ message: "Study plan not found" }, { status: 404 });
  }

  return NextResponse.json(plan);
}
