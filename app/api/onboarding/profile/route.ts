import { NextResponse } from "next/server";
import { parseJsonBody, requireApiUser } from "@/lib/server/apiAuth";
import {
  getOnboardingProfile,
  saveOnboardingProfileForUser,
} from "@/lib/repositories/workspaceRepository";
import type { OnboardingProfile } from "@/features/onboarding/onboardingTypes";

export async function GET() {
  const authUser = await requireApiUser();
  if (!authUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const profile = await getOnboardingProfile(authUser.userId);
  return NextResponse.json(profile);
}

export async function PUT(request: Request) {
  const authUser = await requireApiUser();
  if (!authUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const profile = await parseJsonBody<OnboardingProfile>(request);
  const saved = await saveOnboardingProfileForUser(authUser.userId, profile);
  return NextResponse.json(saved);
}
