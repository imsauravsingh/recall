import { OnboardingProfile } from "./onboardingTypes";

export function validateOnboardingProfile(profile: OnboardingProfile) {
  const errors: Record<string, string> = {};

  if (!profile.designation.trim()) {
    errors.designation = "Current designation is required.";
  }

  if (profile.yearsExperience < 0) {
    errors.yearsExperience = "Years of experience must be 0 or greater.";
  }

  if (!profile.primaryTechnology.trim()) {
    errors.primaryTechnology = "Primary technology is required.";
  }

  if (!profile.responsibilities.trim()) {
    errors.responsibilities = "Current responsibilities are required.";
  }

  if (!profile.targetRole.trim()) {
    errors.targetRole = "Target role is required.";
  }

  if (profile.dailyStudyHours <= 0) {
    errors.dailyStudyHours = "Daily study hours must be greater than zero.";
  }

  if (!profile.preparationTimeline.trim()) {
    errors.preparationTimeline = "Preparation timeline is required.";
  }

  return errors;
}
