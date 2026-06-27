import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createInitialStudyPlan,
  recommendLearningDomains,
} from "./onboardingService";
import { saveInitialStudyPlan, saveOnboardingProfile } from "./onboardingApi";
import { validateOnboardingProfile } from "./onboardingValidator";
import { OnboardingProfile } from "./onboardingTypes";

const initialProfile: OnboardingProfile = {
  designation: "",
  yearsExperience: 0,
  primaryTechnology: "",
  responsibilities: "",
  targetRole: "",
  targetCompanies: "",
  dailyStudyHours: 2,
  preparationTimeline: "1 month",
};

function OnboardingPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<OnboardingProfile>(initialProfile);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const recommendedDomains = useMemo(
    () => recommendLearningDomains(profile),
    [profile],
  );
  const initialPlan = useMemo(
    () =>
      createInitialStudyPlan(
        profile,
        recommendedDomains.map((domain) => domain.slug),
      ),
    [profile, recommendedDomains],
  );

  const handleChange = (
    field: keyof OnboardingProfile,
    value: string | number,
  ) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validateOnboardingProfile(profile);
    setErrors(validation);
    if (Object.keys(validation).length > 0) {
      return;
    }

    setSubmitted(true);
    await saveOnboardingProfile(profile);
    await saveInitialStudyPlan(initialPlan);
    navigate("/dashboard");
  };

  return (
    <div className="mx-auto max-w-5xl rounded-3xl bg-white p-6 shadow-sm dark:bg-[#171720]">
      <div className="mb-6 rounded-3xl border border-[#dddbe7] bg-[#f9f8fc] p-6 dark:border-[#292735] dark:bg-[#1a1a23]">
        <h1 className="text-2xl font-semibold">Welcome to Recall.dev</h1>
        <p className="mt-2 text-sm text-[#5f5b68] dark:text-[#b9b8c8]">
          Complete a quick onboarding and get recommended Learning Domains, an
          initial study plan, and default workspace setup.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span>Current designation</span>
            <input
              value={profile.designation}
              onChange={(event) =>
                handleChange("designation", event.target.value)
              }
              className="w-full rounded-xl border border-[#d9d9e1] bg-white px-3 py-2 text-sm dark:border-[#2f2d3c] dark:bg-[#121218] dark:text-white"
            />
            {errors.designation ? (
              <p className="text-xs text-[#E24B4A]">{errors.designation}</p>
            ) : null}
          </label>

          <label className="space-y-2 text-sm">
            <span>Years of experience</span>
            <input
              type="number"
              min={0}
              value={profile.yearsExperience}
              onChange={(event) =>
                handleChange("yearsExperience", Number(event.target.value))
              }
              className="w-full rounded-xl border border-[#d9d9e1] bg-white px-3 py-2 text-sm dark:border-[#2f2d3c] dark:bg-[#121218] dark:text-white"
            />
            {errors.yearsExperience ? (
              <p className="text-xs text-[#E24B4A]">{errors.yearsExperience}</p>
            ) : null}
          </label>

          <label className="space-y-2 text-sm">
            <span>Primary technology</span>
            <input
              value={profile.primaryTechnology}
              onChange={(event) =>
                handleChange("primaryTechnology", event.target.value)
              }
              className="w-full rounded-xl border border-[#d9d9e1] bg-white px-3 py-2 text-sm dark:border-[#2f2d3c] dark:bg-[#121218] dark:text-white"
            />
            {errors.primaryTechnology ? (
              <p className="text-xs text-[#E24B4A]">
                {errors.primaryTechnology}
              </p>
            ) : null}
          </label>

          <label className="space-y-2 text-sm">
            <span>Target role</span>
            <input
              value={profile.targetRole}
              onChange={(event) =>
                handleChange("targetRole", event.target.value)
              }
              className="w-full rounded-xl border border-[#d9d9e1] bg-white px-3 py-2 text-sm dark:border-[#2f2d3c] dark:bg-[#121218] dark:text-white"
            />
            {errors.targetRole ? (
              <p className="text-xs text-[#E24B4A]">{errors.targetRole}</p>
            ) : null}
          </label>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span>Daily study hours</span>
            <input
              type="number"
              min={1}
              value={profile.dailyStudyHours}
              onChange={(event) =>
                handleChange("dailyStudyHours", Number(event.target.value))
              }
              className="w-full rounded-xl border border-[#d9d9e1] bg-white px-3 py-2 text-sm dark:border-[#2f2d3c] dark:bg-[#121218] dark:text-white"
            />
            {errors.dailyStudyHours ? (
              <p className="text-xs text-[#E24B4A]">{errors.dailyStudyHours}</p>
            ) : null}
          </label>

          <label className="space-y-2 text-sm">
            <span>Preparation timeline</span>
            <select
              value={profile.preparationTimeline}
              onChange={(event) =>
                handleChange("preparationTimeline", event.target.value)
              }
              className="w-full rounded-xl border border-[#d9d9e1] bg-white px-3 py-2 text-sm dark:border-[#2f2d3c] dark:bg-[#121218] dark:text-white"
            >
              <option>1 month</option>
              <option>2 months</option>
              <option>3 months</option>
              <option>6 months</option>
            </select>
            {errors.preparationTimeline ? (
              <p className="text-xs text-[#E24B4A]">
                {errors.preparationTimeline}
              </p>
            ) : null}
          </label>
        </div>

        <div className="space-y-2 text-sm">
          <label className="space-y-2 text-sm">
            <span>Current responsibilities</span>
            <textarea
              value={profile.responsibilities}
              onChange={(event) =>
                handleChange("responsibilities", event.target.value)
              }
              rows={3}
              className="w-full rounded-xl border border-[#d9d9e1] bg-white px-3 py-2 text-sm dark:border-[#2f2d3c] dark:bg-[#121218] dark:text-white"
            />
            {errors.responsibilities ? (
              <p className="text-xs text-[#E24B4A]">
                {errors.responsibilities}
              </p>
            ) : null}
          </label>

          <label className="space-y-2 text-sm">
            <span>Target companies (optional)</span>
            <input
              value={profile.targetCompanies}
              onChange={(event) =>
                handleChange("targetCompanies", event.target.value)
              }
              className="w-full rounded-xl border border-[#d9d9e1] bg-white px-3 py-2 text-sm dark:border-[#2f2d3c] dark:bg-[#121218] dark:text-white"
            />
          </label>
        </div>

        <div className="flex flex-col gap-4 rounded-3xl border border-[#dddbe7] bg-[#faf9fc] p-4 dark:border-[#292735] dark:bg-[#14131b]">
          <h2 className="text-sm font-semibold">
            Recommended Learning Domains
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {recommendedDomains.map((domain) => (
              <div
                key={domain.slug}
                className="rounded-2xl border border-[#e9e7f1] bg-white p-3 dark:border-[#2f2d3c] dark:bg-[#171820]"
              >
                <p className="text-sm font-semibold">{domain.label}</p>
                <p className="mt-1 text-xs text-[#6d6a79] dark:text-[#b1afc7]">
                  {domain.description}
                </p>
                {domain.optional ? (
                  <span className="mt-2 inline-block rounded-full bg-[#f0eefc] px-2 py-1 text-[10px] font-semibold text-[#5a4edc] dark:bg-[#2a294f] dark:text-[#c9c8f8]">
                    Optional
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="rounded-3xl bg-[#534AB7] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#3C3489]"
        >
          Save onboarding profile
        </button>
      </form>

      {submitted ? (
        <div className="mt-8 rounded-3xl border border-[#dddbe7] bg-[#fbfbff] p-6 dark:border-[#292735] dark:bg-[#15151d]">
          <h2 className="text-lg font-semibold">
            Workspace initialization complete
          </h2>
          <p className="mt-2 text-sm text-[#5f5b68] dark:text-[#b9b8c8]">
            Your initial study plan has been created from your onboarding
            profile.
          </p>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="rounded-3xl bg-white p-4 shadow-sm dark:bg-[#171718]">
              <p className="text-sm font-semibold">Plan</p>
              <p className="mt-2 text-sm text-[#5f5b68] dark:text-[#b9b8c8]">
                {initialPlan.title}
              </p>
              <p className="mt-2 text-xs text-[#888391] dark:text-[#8b8aad]">
                {initialPlan.startDate} → {initialPlan.endDate}
              </p>
            </div>
            <div className="rounded-3xl bg-white p-4 shadow-sm dark:bg-[#171718]">
              <p className="text-sm font-semibold">Weekly commitment</p>
              <p className="mt-2 text-2xl font-semibold text-[#534AB7] dark:text-[#CECBF6]">
                {initialPlan.weeklyCommitmentHours} hrs
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/dashboard")}
            className="mt-6 rounded-3xl bg-[#534AB7] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#3C3489]"
          >
            Go to dashboard
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default OnboardingPage;
