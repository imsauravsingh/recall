import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/server/apiAuth";
import { setStudyPlanStatusForUser } from "@/lib/repositories/studyPlanRepository";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const authUser = await requireApiUser();
  if (!authUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const plan = await setStudyPlanStatusForUser(authUser.userId, id, "active");
  if (!plan) {
    return NextResponse.json({ message: "Study plan not found" }, { status: 404 });
  }

  return NextResponse.json(plan);
}
