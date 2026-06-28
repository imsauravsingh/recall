import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/server/apiAuth";
import { getUserProfile } from "@/lib/repositories/workspaceRepository";

export async function GET() {
  const authUser = await requireApiUser();
  if (!authUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await getUserProfile(authUser.userId);
  return NextResponse.json(user);
}
