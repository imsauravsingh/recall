export interface ContentManifest {
  version: string;
  lastUpdated: string;
  modules: string[];
}

export interface StudySection {
  title: string;
  items: string[];
}

export interface StudyWeek {
  week: string;
  goal: string;
  sections: StudySection[];
}

export interface StudyPlan {
  id?: string;
  title: string;
  description: string;
  status?: "active" | "archived";
  createdAt?: string;
  updatedAt?: string;
  startDate?: string;
  endDate?: string;
  weeklyCommitmentHours?: number;
  dailySchedule: Array<{
    time: string;
    duration: string;
    blocks: string[];
    focus: string[];
  }>;
  weeks: StudyWeek[];
  monthlyGoals: string[];
  recallNoteSections: string[];
}

export type ContentFile = Record<string, unknown>;

const CONTENT_REMOTE_REPO =
  "https://cdn.jsdelivr.net/gh/<username>/recall-content";

const localModules = import.meta.glob("../../recall-content/**/*.json", {
  as: "json",
  eager: true,
}) as Record<string, ContentFile>;

function getRemoteBaseUrl(branch = "main"): string {
  return `${CONTENT_REMOTE_REPO}@${branch}`;
}

const localManifest = localModules[
  "../../recall-content/manifest.json"
] as unknown as ContentManifest;
const localStudyPlan = localModules[
  "../../recall-content/plans/monthly.json"
] as unknown as StudyPlan;

export function getLocalManifest(): ContentManifest {
  return localManifest;
}

export function getLocalStudyPlan(): StudyPlan {
  return localStudyPlan;
}

export function getLocalModule(
  category: string,
  fileName: string,
): ContentFile | null {
  const key = `../../recall-content/${category}/${fileName}.json`;
  return localModules[key] ?? null;
}

export function getLocalModules(category: string): ContentFile[] {
  const prefix = `../../recall-content/${category}/`;
  return Object.keys(localModules)
    .filter(
      (path) => path.startsWith(prefix) && path !== `${prefix}manifest.json`,
    )
    .map((path) => localModules[path]);
}

export async function fetchRemoteManifest(
  branch = "main",
): Promise<ContentManifest> {
  const url = `${getRemoteBaseUrl(branch)}/manifest.json`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch remote manifest: ${response.status}`);
  }
  return response.json();
}

export async function fetchRemoteModule(
  category: string,
  fileName: string,
): Promise<ContentFile> {
  const url = `${getRemoteBaseUrl()}/${category}/${fileName}.json`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch remote module: ${response.status}`);
  }
  return response.json();
}

export function getRemoteManifestUrl(branch = "main"): string {
  return `${getRemoteBaseUrl(branch)}/manifest.json`;
}

export function getRemoteModuleUrl(category: string, fileName: string): string {
  return `${getRemoteBaseUrl()}/${category}/${fileName}.json`;
}
