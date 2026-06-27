import type {
  InitialStudyPlan,
  LearningDomainRecommendation,
  OnboardingProfile,
} from "./onboardingTypes";

const STORAGE_PROFILE_KEY = "recall:onboardingProfile";
const STORAGE_PLAN_KEY = "recall:initialStudyPlan";

export async function fetchOnboardingProfile(): Promise<OnboardingProfile | null> {
  if (typeof window === "undefined") {
    return null;
  }

  const payload = window.localStorage.getItem(STORAGE_PROFILE_KEY);
  if (!payload) {
    return null;
  }

  return JSON.parse(payload) as OnboardingProfile;
}

export async function saveOnboardingProfile(
  profile: OnboardingProfile,
): Promise<OnboardingProfile> {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(profile));
  }

  return profile;
}

export async function fetchInitialStudyPlan(): Promise<InitialStudyPlan | null> {
  if (typeof window === "undefined") {
    return null;
  }

  const payload = window.localStorage.getItem(STORAGE_PLAN_KEY);
  if (!payload) {
    return null;
  }

  return JSON.parse(payload) as InitialStudyPlan;
}

export async function saveInitialStudyPlan(
  plan: InitialStudyPlan,
): Promise<InitialStudyPlan> {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_PLAN_KEY, JSON.stringify(plan));
  }

  return plan;
}

export async function recommendDomains(
  profile: OnboardingProfile,
): Promise<LearningDomainRecommendation[]> {
  // This method is intentionally local for the current MVP.
  // When a backend exists, switch this to `callApi(ApiRoutes.onboarding.profile)` or a dedicated endpoint.
  return [] as LearningDomainRecommendation[];
}

export async function initializeWorkspace(): Promise<{ studyPlanId: string }> {
  // Placeholder for future backend-backed workspace initialization.
  return { studyPlanId: crypto.randomUUID() };
}

export async function isOnboardingComplete(): Promise<boolean> {
  return (await fetchOnboardingProfile()) !== null;
}
