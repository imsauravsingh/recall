import {
  InitialStudyPlan,
  LearningDomainRecommendation,
  OnboardingProfile,
} from "./onboardingTypes";

const recommendedDomains: LearningDomainRecommendation[] = [
  {
    slug: "backend-engineering",
    label: "Backend Engineering",
    description: "APIs, architecture, integrations, and scalability.",
  },
  {
    slug: "system-design",
    label: "System Design",
    description: "Large-scale architecture, reliability, and tradeoffs.",
  },
  {
    slug: "ai-system-design",
    label: "AI System Design",
    description: "Designing AI-enabled systems and products.",
  },
  {
    slug: "leadership",
    label: "Leadership",
    description: "Communication, decision making, and team influence.",
  },
  {
    slug: "behavioural",
    label: "Behavioural",
    description: "Interview soft skills and leadership storytelling.",
  },
  {
    slug: "dsa",
    label: "DSA",
    description: "Algorithms, data structures, and coding patterns.",
    optional: true,
  },
  {
    slug: "cloud",
    label: "Cloud",
    description: "Cloud services, deployment, and infrastructure.",
  },
];

export function recommendLearningDomains(
  profile: OnboardingProfile,
): LearningDomainRecommendation[] {
  const domains: LearningDomainRecommendation[] = [];

  const role = profile.designation.toLowerCase();
  const target = profile.targetRole.toLowerCase();
  const tech = profile.primaryTechnology.toLowerCase();

  if (
    /architect|principal|staff|lead|director/.test(role) ||
    /senior staff|principal|architect|lead/.test(target)
  ) {
    domains.push(recommendedDomains[0]);
    domains.push(recommendedDomains[1]);
    domains.push(recommendedDomains[2]);
    domains.push(recommendedDomains[3]);
    domains.push(recommendedDomains[4]);
  } else if (/engineer|developer/.test(role) || /engineer/.test(target)) {
    domains.push(recommendedDomains[0]);
    domains.push(recommendedDomains[1]);
    domains.push(recommendedDomains[4]);
    if (/node|js|typescript|java|python/.test(tech)) {
      domains.push(recommendedDomains[2]);
    }
    domains.push(recommendedDomains[5]);
  } else {
    domains.push(recommendedDomains[0]);
    domains.push(recommendedDomains[1]);
    domains.push(recommendedDomains[4]);
  }

  if (/cloud|aws|azure|gcp|kubernetes/.test(tech)) {
    domains.push(recommendedDomains[6]);
  }

  if (
    profile.yearsExperience < 3 &&
    !domains.some((domain) => domain.slug === "dsa")
  ) {
    domains.push(recommendedDomains[5]);
  }

  const unique = domains.filter(
    (item, index, arr) =>
      arr.findIndex((entry) => entry.slug === item.slug) === index,
  );
  return unique;
}

export function createInitialStudyPlan(
  profile: OnboardingProfile,
  domainSlugs: string[],
): InitialStudyPlan {
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 30);

  const cleanTitle = profile.targetRole
    ? `${profile.targetRole} readiness plan`
    : "Interview readiness plan";
  const domainLabels = domainSlugs.map((slug) => slug.replace(/-/g, " "));

  return {
    title: cleanTitle,
    description: `A ${profile.preparationTimeline} study plan for ${profile.targetRole} with ${profile.dailyStudyHours} hours of daily practice. Focused on ${domainLabels.join(", ")}.`,
    dailySchedule: [
      {
        time: "Morning",
        duration: `${Math.max(1, Math.floor(profile.dailyStudyHours * 0.4))} hrs`,
        blocks: ["Review concepts", "Practice questions"],
        focus: ["Knowledge", "Recall"],
      },
      {
        time: "Afternoon",
        duration: `${Math.max(1, Math.floor(profile.dailyStudyHours * 0.3))} hrs`,
        blocks: ["Study system design", "Review leadership stories"],
        focus: ["Architecture", "Behavioural"],
      },
      {
        time: "Evening",
        duration: `${Math.max(1, Math.ceil(profile.dailyStudyHours * 0.3))} hrs`,
        blocks: ["Mock answers", "Reflection notes"],
        focus: ["Communication", "Confidence"],
      },
    ],
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
    weeklyCommitmentHours: Math.min(profile.dailyStudyHours * 7, 28),
    weeks: [
      {
        week: "Week 1",
        goal: "Build foundational domain knowledge",
        sections: [
          {
            title: "Core concepts",
            items: ["Backend fundamentals", "System patterns"],
          },
          {
            title: "Practice",
            items: ["Core interview questions", "Recall sessions"],
          },
        ],
      },
      {
        week: "Week 2",
        goal: "Strengthen design and leadership thinking",
        sections: [
          { title: "Design", items: ["Scalability", "Tradeoffs"] },
          {
            title: "Behaviour",
            items: ["STAR stories", "Leadership narratives"],
          },
        ],
      },
      {
        week: "Week 3",
        goal: "Practice interview flow and edge cases",
        sections: [
          { title: "Review", items: ["Domain review", "Common pitfalls"] },
          { title: "Mock", items: ["Timed problems", "Answer refinement"] },
        ],
      },
      {
        week: "Week 4",
        goal: "Polish confidence and readiness",
        sections: [
          { title: "Recap", items: ["High-impact topics", "Resume alignment"] },
          { title: "Final prep", items: ["Mock sessions", "Notes review"] },
        ],
      },
    ],
    monthlyGoals: [
      "Be able to explain system design tradeoffs clearly.",
      "Practice leadership and behavioural stories with confidence.",
      "Complete multiple active recall sessions across domains.",
    ],
    recallNoteSections: [
      "Problem",
      "Approach",
      "Tradeoffs",
      "Examples",
      "Reflection",
    ],
  };
}
