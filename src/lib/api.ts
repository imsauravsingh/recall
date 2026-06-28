export const API_BASE = "/api";

export const ApiRoutes = {
  auth: {
    session: `${API_BASE}/auth/session`,
    logout: `${API_BASE}/auth/logout`,
  },
  onboarding: {
    profile: `${API_BASE}/onboarding/profile`,
    workspace: `${API_BASE}/onboarding/workspace`,
  },
  users: {
    me: `${API_BASE}/users/me`,
  },
  domains: {
    list: `${API_BASE}/domains`,
    create: `${API_BASE}/domains`,
  },
  studyPlans: {
    list: `${API_BASE}/study-plans`,
    detail: (id: string) => `${API_BASE}/study-plans/${id}`,
    update: (id: string) => `${API_BASE}/study-plans/${id}`,
    delete: (id: string) => `${API_BASE}/study-plans/${id}`,
    duplicate: (id: string) => `${API_BASE}/study-plans/${id}/duplicate`,
    archive: (id: string) => `${API_BASE}/study-plans/${id}/archive`,
    restore: (id: string) => `${API_BASE}/study-plans/${id}/restore`,
    progress: (id: string) => `${API_BASE}/study-plans/${id}/progress`,
    regenerate: (id: string) => `${API_BASE}/study-plans/${id}/regenerate`,
    regenerateWeek: (id: string) =>
      `${API_BASE}/study-plans/${id}/regenerate-week`,
    generateSubTopics: (planId: string, sessionId: string) =>
      `${API_BASE}/study-plans/${planId}/sessions/${sessionId}/generate-subtopics`,
  },
  topics: {
    list: `${API_BASE}/topics`,
    detail: (id: string) => `${API_BASE}/topics/${id}`,
  },
  templates: {
    list: `${API_BASE}/templates`,
    detail: (id: string) => `${API_BASE}/templates/${id}`,
  },
  revisionQueue: {
    list: `${API_BASE}/revision-queue`,
    detail: (id: string) => `${API_BASE}/revision-queue/${id}`,
  },
  recallSessions: {
    list: `${API_BASE}/recall-sessions`,
    detail: (id: string) => `${API_BASE}/recall-sessions/${id}`,
  },
  resumes: {
    list: `${API_BASE}/resumes`,
    detail: (id: string) => `${API_BASE}/resumes/${id}`,
  },
  ai: {
    prompts: `${API_BASE}/ai/prompts`,
    generate: `${API_BASE}/ai/generate`,
    providers: `${API_BASE}/ai/providers`,
    provider: (id: string) => `${API_BASE}/ai/providers/${id}`,
    testProvider: (id: string) => `${API_BASE}/ai/providers/${id}/test`,
    generateStudyPlan: `${API_BASE}/ai/generate-study-plan`,
  },
  topicLibrary: {
    get: (categoryId: string) => `${API_BASE}/topic-library/${categoryId}`,
    update: (categoryId: string) => `${API_BASE}/topic-library/${categoryId}`,
  },
  notifications: {
    list: `${API_BASE}/notifications`,
    detail: (id: string) => `${API_BASE}/notifications/${id}`,
  },
  syncQueue: {
    list: `${API_BASE}/sync-queue`,
    detail: (id: string) => `${API_BASE}/sync-queue/${id}`,
  },
};

export type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export async function callApi<T>(
  url: string,
  method: ApiMethod = "GET",
  body?: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || `API request failed: ${response.status}`);
  }

  return response.json();
}
