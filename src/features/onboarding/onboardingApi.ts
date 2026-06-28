import type {
  InitialStudyPlan,
  LearningDomainRecommendation,
  OnboardingProfile,
} from "./onboardingTypes";
import { ApiRoutes, callApi } from "../../lib/api";

const STORAGE_PROFILE_KEY = "recall:onboardingProfile";
const STORAGE_PLAN_KEY = "recall:initialStudyPlan";
const API_TIMEOUT_MS = 2500;

function readLocal<T>(key: string): T | null {
  if (typeof window === "undefined") {
    return null;
  }

  const payload = window.localStorage.getItem(key);
  return payload ? (JSON.parse(payload) as T) : null;
}

function writeLocal(key: string, value: unknown) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
}

async function callApiWithTimeout<T>(
  url: string,
  method: Parameters<typeof callApi<T>>[1] = "GET",
  body?: unknown,
): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    return await callApi<T>(url, method, body, controller.signal);
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function fetchOnboardingProfile(): Promise<OnboardingProfile | null> {
  try {
    return await callApiWithTimeout<OnboardingProfile | null>(
      ApiRoutes.onboarding.profile,
    );
  } catch {
    return readLocal<OnboardingProfile>(STORAGE_PROFILE_KEY);
  }
}

export async function saveOnboardingProfile(
  profile: OnboardingProfile,
): Promise<OnboardingProfile> {
  writeLocal(STORAGE_PROFILE_KEY, profile);

  try {
    return await callApiWithTimeout<OnboardingProfile>(
      ApiRoutes.onboarding.profile,
      "PUT",
      profile,
    );
  } catch {
    return profile;
  }
}

export async function fetchInitialStudyPlan(): Promise<InitialStudyPlan | null> {
  try {
    const plans = await callApiWithTimeout<InitialStudyPlan[]>(
      ApiRoutes.studyPlans.list,
    );
    return plans.find((plan) => plan.status !== "archived") ?? plans[0] ?? null;
  } catch {
    return readLocal<InitialStudyPlan>(STORAGE_PLAN_KEY);
  }
}

export async function saveInitialStudyPlan(
  plan: InitialStudyPlan,
): Promise<InitialStudyPlan> {
  writeLocal(STORAGE_PLAN_KEY, plan);

  try {
    const method = plan.id ? "PUT" : "POST";
    const url = plan.id ? ApiRoutes.studyPlans.detail(plan.id) : ApiRoutes.studyPlans.list;
    return await callApiWithTimeout<InitialStudyPlan>(url, method, plan);
  } catch {
    return plan;
  }
}

export async function recommendDomains(
  profile: OnboardingProfile,
): Promise<LearningDomainRecommendation[]> {
  // This method is intentionally local for the current MVP.
  // When a backend exists, switch this to `callApi(ApiRoutes.onboarding.profile)` or a dedicated endpoint.
  return [] as LearningDomainRecommendation[];
}

export async function initializeWorkspace(): Promise<{ studyPlanId: string }> {
  try {
    return await callApiWithTimeout<{ studyPlanId: string }>(
      ApiRoutes.onboarding.workspace,
      "POST",
    );
  } catch {
    return { studyPlanId: crypto.randomUUID() };
  }
}

export async function isOnboardingComplete(): Promise<boolean> {
  return (await fetchOnboardingProfile()) !== null;
}
