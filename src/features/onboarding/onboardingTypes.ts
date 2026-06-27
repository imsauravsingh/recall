import type { StudyPlan } from "../../lib/contentService";

export type OnboardingProfile = {
  designation: string;
  yearsExperience: number;
  primaryTechnology: string;
  responsibilities: string;
  targetRole: string;
  targetCompanies?: string;
  dailyStudyHours: number;
  preparationTimeline: string;
};

export type LearningDomainRecommendation = {
  slug: string;
  label: string;
  description: string;
  optional?: boolean;
};

export type InitialStudyPlan = StudyPlan;
