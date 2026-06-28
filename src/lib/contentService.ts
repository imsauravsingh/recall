import localManifest from "../../recall-content/manifest.json";
import localStudyPlan from "../../recall-content/plans/monthly.json";

// ── New AI-first interview study plan types ──────────────────────────────────

export type InterviewAreaPriority = "critical" | "high" | "medium" | "low";

export interface InterviewArea {
  name: string;
  priority: InterviewAreaPriority;
  topics: string[];
}

export type SessionType =
  | "dsa"
  | "system-design"
  | "behavioral"
  | "low-level-design"
  | "review"
  | "mock"
  | "resume";

export type SubTopicType =
  | "concept"
  | "coding-problem"
  | "design-problem"
  | "behavioral"
  | "know-cold";

export interface SubTopic {
  id: string;
  title: string;
  type: SubTopicType;
  notes?: string;
  source?: string;
  difficulty?: "easy" | "medium" | "hard";
  completed: boolean;
  completedAt?: string;
}

export interface DaySession {
  id: string;
  day: number;
  type: SessionType;
  topic: string;
  durationMinutes: number;
  notes?: string;
  completed: boolean;
  completedAt?: string;
  subTopics?: SubTopic[];
}

export interface PlanWeek {
  weekNumber: number;
  theme: string;
  areas: string[];
  sessions: DaySession[];
}

export type MockSessionType = "dsa" | "system-design" | "behavioral" | "full";

export interface MockSession {
  id: string;
  weekNumber: number;
  type: MockSessionType;
  scheduledDay: number;
  durationMinutes: number;
  completed: boolean;
}

export interface Milestone {
  weekNumber: number;
  description: string;
  checkpoints: string[];
}

export interface RecallTemplate {
  area: string;
  sections: string[];
}

// ── Topic Library ────────────────────────────────────────────────────────────

export interface TopicItem {
  id: string;
  name: string;
  notes?: string;
  difficulty?: "easy" | "medium" | "hard";
  url?: string;
  solutionUrl?: string;
  completed: boolean;
  completedAt?: string;
}

export interface TopicGroup {
  id: string;
  name: string;
  subtitle?: string;
  lastRevisedAt?: string;
  items: TopicItem[];
}

export interface TopicCategory {
  id: string;
  name: string;
  groups: TopicGroup[];
}

export interface WizardInput {
  targetRole: string;
  techStack: string[];
  yearsOfExperience: number;
  targetTimeline: string;
  targetCompany?: string;
  jobDescription?: string;
}

export interface InterviewStudyPlan {
  id: string;
  title: string;
  status: "active" | "archived" | "completed";
  targetRole: string;
  techStack: string[];
  yearsOfExperience: number;
  targetTimeline: string;
  targetCompany?: string;
  jobDescription?: string;
  aiGenerated: boolean;
  sourcePrompt?: string;
  providerId?: string;
  interviewAreas: InterviewArea[];
  weeks: PlanWeek[];
  mockInterviews: MockSession[];
  milestones: Milestone[];
  recallTemplates: RecallTemplate[];
  createdAt: string;
  updatedAt: string;
}

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

function getRemoteBaseUrl(branch = "main"): string {
  return `${CONTENT_REMOTE_REPO}@${branch}`;
}

export function getLocalManifest(): ContentManifest | null {
  return localManifest as ContentManifest;
}

export function getLocalStudyPlan(): StudyPlan | null {
  return localStudyPlan as StudyPlan;
}

export function getLocalModule(
  _category: string,
  _fileName: string,
): ContentFile | null {
  return null;
}

export function getLocalModules(_category: string): ContentFile[] {
  return [];
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
