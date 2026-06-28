"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useStudyPlanStore } from "./studyPlanStore";
import type {
  InterviewStudyPlan,
  WizardInput,
  DaySession,
  PlanWeek,
  SessionType,
} from "@/lib/contentService";
import { createStudyPlan } from "./studyPlanClient";

// ─── Constants ────────────────────────────────────────────────────────────────

const TARGET_ROLES = [
  "Senior Software Engineer",
  "Staff Engineer",
  "Principal Engineer",
  "Principal Staff Engineer",
  "Architect",
];

const TECH_STACK_OPTIONS = [
  "Java", "Node.js", "Python", "Go", ".NET", "TypeScript",
  "Rust", "C++", "Kotlin", "Scala", "Ruby", "PHP",
];

const EXPERIENCE_OPTIONS = [5, 8, 10, 12, 15, 20];

const TIMELINE_OPTIONS = ["1 week", "2 weeks", "1 month", "2 months", "3 months"];

const COMPANY_OPTIONS = [
  "Google", "Meta", "Amazon", "Microsoft", "Apple",
  "Netflix", "Uber", "Stripe", "Startup",
];

const SESSION_TYPES: { value: SessionType; label: string }[] = [
  { value: "dsa", label: "DSA" },
  { value: "system-design", label: "System Design" },
  { value: "behavioral", label: "Behavioral" },
  { value: "low-level-design", label: "Low-Level Design" },
  { value: "review", label: "Review" },
  { value: "mock", label: "Mock Interview" },
  { value: "resume", label: "Resume" },
];

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const AI_STEPS = [
  "Analyzing target role…",
  "Inferring interview rounds…",
  "Prioritizing interview areas…",
  "Building weekly roadmap…",
  "Generating daily schedule…",
  "Scheduling mock interviews…",
  "Creating recall templates…",
];

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current, labels }: { current: number; labels: string[] }) {
  return (
    <div className="flex items-center gap-2">
      {labels.map((label, i) => {
        const idx = i + 1;
        const done = current > idx;
        const active = current === idx;
        return (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition ${
                done
                  ? "bg-[#534AB7] text-white"
                  : active
                    ? "border-2 border-[#534AB7] text-[#534AB7]"
                    : "border border-[#dddbe7] text-[#888391] dark:border-[#292735]"
              }`}
            >
              {done ? "✓" : idx}
            </div>
            <span
              className={`hidden text-[11px] font-medium sm:block ${
                active ? "text-[#534AB7]" : "text-[#888391]"
              }`}
            >
              {label}
            </span>
            {i < labels.length - 1 && (
              <div
                className={`h-px w-8 ${done ? "bg-[#534AB7]" : "bg-[#dddbe7] dark:bg-[#292735]"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Manual builder ───────────────────────────────────────────────────────────

interface ManualWeek {
  weekNumber: number;
  theme: string;
  sessions: DaySession[];
}

function newManualSession(): DaySession {
  return {
    id: crypto.randomUUID(),
    day: 1,
    type: "dsa",
    topic: "",
    durationMinutes: 60,
    completed: false,
    subTopics: [],
  };
}

function ManualSessionRow({
  session,
  onChange,
  onDelete,
}: {
  session: DaySession;
  onChange: (patch: Partial<DaySession>) => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-lg border border-[#dddbe7] bg-[#f9f9fc] p-3 dark:border-[#292735] dark:bg-[#14131b]">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={session.type}
          onChange={(e) => onChange({ type: e.target.value as SessionType })}
          className="rounded-lg border border-[#dddbe7] bg-white px-2 py-1.5 text-xs text-[#1f1f28] outline-none focus:border-[#534AB7] dark:border-[#292735] dark:bg-[#1a1a23] dark:text-white"
        >
          {SESSION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <select
          value={session.day}
          onChange={(e) => onChange({ day: Number(e.target.value) })}
          className="rounded-lg border border-[#dddbe7] bg-white px-2 py-1.5 text-xs text-[#1f1f28] outline-none focus:border-[#534AB7] dark:border-[#292735] dark:bg-[#1a1a23] dark:text-white"
        >
          {DAY_LABELS.map((label, i) => (
            <option key={i + 1} value={i + 1}>
              {label}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={session.durationMinutes}
            onChange={(e) => onChange({ durationMinutes: Number(e.target.value) })}
            min={15}
            step={15}
            className="w-16 rounded-lg border border-[#dddbe7] bg-white px-2 py-1.5 text-xs text-[#1f1f28] outline-none focus:border-[#534AB7] dark:border-[#292735] dark:bg-[#1a1a23] dark:text-white"
          />
          <span className="text-[10px] text-[#888391]">min</span>
        </div>
        <button
          onClick={onDelete}
          className="ml-auto text-xs text-[#dddbe7] transition hover:text-[#E24B4A] dark:text-[#292735]"
        >
          ✕
        </button>
      </div>
      <input
        type="text"
        value={session.topic}
        onChange={(e) => onChange({ topic: e.target.value })}
        placeholder="Topic (e.g. Binary Trees & BST Operations)"
        className="mt-2 w-full rounded-lg border border-[#dddbe7] bg-white px-3 py-1.5 text-xs font-medium text-[#1f1f28] outline-none focus:border-[#534AB7] dark:border-[#292735] dark:bg-[#1a1a23] dark:text-white"
      />
    </div>
  );
}

function ManualWeekCard({
  week,
  onThemeChange,
  onSessionChange,
  onAddSession,
  onDeleteSession,
  onDeleteWeek,
}: {
  week: ManualWeek;
  onThemeChange: (theme: string) => void;
  onSessionChange: (sessionId: string, patch: Partial<DaySession>) => void;
  onAddSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  onDeleteWeek: () => void;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="rounded-xl border border-[#dddbe7] bg-white dark:border-[#292735] dark:bg-[#1a1a23]">
      <div className="flex items-center gap-3 p-4">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#EEEDFE] text-xs font-bold text-[#534AB7] dark:bg-[#26215C] dark:text-[#CECBF6]">
          {week.weekNumber}
        </div>
        <input
          type="text"
          value={week.theme}
          onChange={(e) => onThemeChange(e.target.value)}
          placeholder="Week theme (e.g. DSA Foundations)"
          className="flex-1 rounded-lg border border-[#dddbe7] bg-[#f6f6f8] px-3 py-1.5 text-xs font-semibold text-[#1f1f28] outline-none focus:border-[#534AB7] dark:border-[#292735] dark:bg-[#121218] dark:text-white"
        />
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-[10px] text-[#888391]"
        >
          {expanded ? "▲" : "▼"}
        </button>
        <button
          onClick={onDeleteWeek}
          className="text-xs text-[#dddbe7] transition hover:text-[#E24B4A] dark:text-[#292735]"
          title="Delete week"
        >
          ✕
        </button>
      </div>

      {expanded && (
        <div className="border-t border-[#dddbe7] p-4 dark:border-[#292735]">
          <div className="space-y-2">
            {week.sessions.map((session) => (
              <ManualSessionRow
                key={session.id}
                session={session}
                onChange={(patch) => onSessionChange(session.id, patch)}
                onDelete={() => onDeleteSession(session.id)}
              />
            ))}
          </div>
          {week.sessions.length === 0 && (
            <p className="mb-2 text-center text-[10px] text-[#888391]">
              No sessions yet.
            </p>
          )}
          <button
            onClick={onAddSession}
            className="mt-2 w-full rounded-lg border border-dashed border-[#dddbe7] py-2 text-xs font-medium text-[#888391] transition hover:border-[#534AB7] hover:text-[#534AB7] dark:border-[#292735]"
          >
            + Add Session
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main wizard ──────────────────────────────────────────────────────────────

export default function StudyPlanWizard() {
  const router = useRouter();
  const { generatePlan } = useStudyPlanStore();

  // AI wizard state
  const [mode, setMode] = useState<"ai" | "manual" | null>(null);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<WizardInput>({
    targetRole: "",
    techStack: [],
    yearsOfExperience: 10,
    targetTimeline: "1 month",
    targetCompany: undefined,
    jobDescription: undefined,
  });
  const [showOptional, setShowOptional] = useState(false);
  const [generatedPlan, setGeneratedPlan] =
    useState<Omit<InterviewStudyPlan, "id" | "createdAt" | "updatedAt"> | null>(null);
  const [aiStepIndex, setAiStepIndex] = useState(0);
  const [aiError, setAiError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const generationDone = useRef(false);

  // Manual builder state
  const [manualTitle, setManualTitle] = useState("");
  const [manualWeeks, setManualWeeks] = useState<ManualWeek[]>([
    { weekNumber: 1, theme: "", sessions: [] },
  ]);

  const canProceedAI =
    form.targetRole &&
    form.techStack.length > 0 &&
    form.yearsOfExperience > 0 &&
    form.targetTimeline;

  function toggleTech(tech: string) {
    setForm((f) => ({
      ...f,
      techStack: f.techStack.includes(tech)
        ? f.techStack.filter((t) => t !== tech)
        : [...f.techStack, tech],
    }));
  }

  // ── AI generation ──────────────────────────────────────────────────────────

  async function startGeneration() {
    setMode("ai");
    setStep(2);
    setAiStepIndex(0);
    setAiError(null);
    generationDone.current = false;

    try {
      const plan = await generatePlan(form);
      setGeneratedPlan(
        plan as Omit<InterviewStudyPlan, "id" | "createdAt" | "updatedAt">,
      );
      generationDone.current = true;
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Generation failed.");
      generationDone.current = true;
    }
  }

  useEffect(() => {
    if (step !== 2 || mode !== "ai") return;
    let cancelled = false;

    async function animateSteps() {
      for (let i = 0; i < AI_STEPS.length; i++) {
        if (cancelled) return;
        setAiStepIndex(i);
        await new Promise((res) => setTimeout(res, 1200));
      }
      await new Promise<void>((res) => {
        const check = setInterval(() => {
          if (generationDone.current || cancelled) {
            clearInterval(check);
            res();
          }
        }, 200);
      });
      if (!cancelled && !aiError) setStep(3);
    }

    void animateSteps();
    return () => {
      cancelled = true;
    };
  }, [step, mode, aiError]);

  async function handleStartLearning() {
    if (!generatedPlan) return;
    setSaving(true);
    try {
      const saved = await createStudyPlan(generatedPlan);
      router.push(`/plan/${saved.id}`);
    } catch {
      setSaving(false);
    }
  }

  // ── Manual builder helpers ─────────────────────────────────────────────────

  function updateManualWeekTheme(weekNumber: number, theme: string) {
    setManualWeeks((prev) =>
      prev.map((w) => (w.weekNumber === weekNumber ? { ...w, theme } : w)),
    );
  }

  function addManualSession(weekNumber: number) {
    setManualWeeks((prev) =>
      prev.map((w) =>
        w.weekNumber === weekNumber
          ? { ...w, sessions: [...w.sessions, newManualSession()] }
          : w,
      ),
    );
  }

  function updateManualSession(
    weekNumber: number,
    sessionId: string,
    patch: Partial<DaySession>,
  ) {
    setManualWeeks((prev) =>
      prev.map((w) =>
        w.weekNumber === weekNumber
          ? {
              ...w,
              sessions: w.sessions.map((s) =>
                s.id === sessionId ? { ...s, ...patch } : s,
              ),
            }
          : w,
      ),
    );
  }

  function deleteManualSession(weekNumber: number, sessionId: string) {
    setManualWeeks((prev) =>
      prev.map((w) =>
        w.weekNumber === weekNumber
          ? { ...w, sessions: w.sessions.filter((s) => s.id !== sessionId) }
          : w,
      ),
    );
  }

  function addManualWeek() {
    const nextNum = (manualWeeks[manualWeeks.length - 1]?.weekNumber ?? 0) + 1;
    setManualWeeks((prev) => [
      ...prev,
      { weekNumber: nextNum, theme: "", sessions: [] },
    ]);
  }

  function deleteManualWeek(weekNumber: number) {
    if (manualWeeks.length <= 1) return;
    setManualWeeks((prev) => prev.filter((w) => w.weekNumber !== weekNumber));
  }

  async function handleSaveManual() {
    if (!manualTitle.trim()) return;
    setSaving(true);
    try {
      const weeks: PlanWeek[] = manualWeeks.map((w) => ({
        weekNumber: w.weekNumber,
        theme: w.theme || `Week ${w.weekNumber}`,
        areas: [],
        sessions: w.sessions,
      }));

      const plan: Omit<InterviewStudyPlan, "id" | "createdAt" | "updatedAt"> = {
        title: manualTitle.trim(),
        status: "active",
        targetRole: form.targetRole || "Software Engineer",
        techStack: form.techStack,
        yearsOfExperience: form.yearsOfExperience,
        targetTimeline: `${manualWeeks.length} week${manualWeeks.length > 1 ? "s" : ""}`,
        targetCompany: form.targetCompany,
        jobDescription: form.jobDescription,
        aiGenerated: false,
        interviewAreas: [],
        weeks,
        mockInterviews: [],
        milestones: [],
        recallTemplates: [],
      };

      const saved = await createStudyPlan(plan);
      router.push(`/plan/${saved.id}`);
    } catch {
      setSaving(false);
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  const aiStepLabels = ["Info", "AI Analysis", "Preview", "Start"];
  const manualStepLabels = ["Info", "Build", "Save"];

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        {mode === "manual" ? (
          <StepIndicator current={step} labels={manualStepLabels} />
        ) : (
          <StepIndicator current={step} labels={aiStepLabels} />
        )}
      </div>

      {/* Step 1: Info form (shared between AI and manual) */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-semibold text-[#1f1f28] dark:text-white">
              Build your interview roadmap
            </h1>
            <p className="mt-1 text-sm text-[#888391]">
              Fill in your details. Then generate with AI or build manually.
            </p>
          </div>

          <div className="rounded-xl border border-[#dddbe7] bg-white p-5 dark:border-[#292735] dark:bg-[#1a1a23]">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#534AB7]">
              Target Role
            </label>
            <div className="mt-3 flex flex-wrap gap-2">
              {TARGET_ROLES.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, targetRole: role }))}
                  className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                    form.targetRole === role
                      ? "bg-[#534AB7] text-white"
                      : "border border-[#dddbe7] text-[#625f6c] hover:border-[#534AB7] hover:text-[#534AB7] dark:border-[#292735] dark:text-[#b6b2c5]"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[#dddbe7] bg-white p-5 dark:border-[#292735] dark:bg-[#1a1a23]">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#534AB7]">
              Primary Tech Stack
              <span className="ml-1 font-normal normal-case text-[#888391]">
                (select all that apply)
              </span>
            </label>
            <div className="mt-3 flex flex-wrap gap-2">
              {TECH_STACK_OPTIONS.map((tech) => (
                <button
                  key={tech}
                  type="button"
                  onClick={() => toggleTech(tech)}
                  className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                    form.techStack.includes(tech)
                      ? "bg-[#534AB7] text-white"
                      : "border border-[#dddbe7] text-[#625f6c] hover:border-[#534AB7] hover:text-[#534AB7] dark:border-[#292735] dark:text-[#b6b2c5]"
                  }`}
                >
                  {tech}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[#dddbe7] bg-white p-5 dark:border-[#292735] dark:bg-[#1a1a23]">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#534AB7]">
                Years of Experience
              </label>
              <div className="mt-3 flex flex-wrap gap-2">
                {EXPERIENCE_OPTIONS.map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, yearsOfExperience: yr }))}
                    className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                      form.yearsOfExperience === yr
                        ? "bg-[#534AB7] text-white"
                        : "border border-[#dddbe7] text-[#625f6c] hover:border-[#534AB7] hover:text-[#534AB7] dark:border-[#292735] dark:text-[#b6b2c5]"
                    }`}
                  >
                    {yr}+
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-[#dddbe7] bg-white p-5 dark:border-[#292735] dark:bg-[#1a1a23]">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#534AB7]">
                Target Timeline
                <span className="ml-1 font-normal normal-case text-[#888391]">
                  (for AI path)
                </span>
              </label>
              <div className="mt-3 flex flex-wrap gap-2">
                {TIMELINE_OPTIONS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, targetTimeline: t }))}
                    className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                      form.targetTimeline === t
                        ? "bg-[#534AB7] text-white"
                        : "border border-[#dddbe7] text-[#625f6c] hover:border-[#534AB7] hover:text-[#534AB7] dark:border-[#292735] dark:text-[#b6b2c5]"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#dddbe7] bg-white p-5 dark:border-[#292735] dark:bg-[#1a1a23]">
            <button
              type="button"
              onClick={() => setShowOptional((v) => !v)}
              className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#888391] hover:text-[#534AB7]"
            >
              <span>Optional: Help AI personalize further</span>
              <span>{showOptional ? "▲" : "▼"}</span>
            </button>

            {showOptional && (
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-[11px] font-medium text-[#625f6c] dark:text-[#b6b2c5]">
                    Target Company
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {COMPANY_OPTIONS.map((co) => (
                      <button
                        key={co}
                        type="button"
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            targetCompany: f.targetCompany === co ? undefined : co,
                          }))
                        }
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                          form.targetCompany === co
                            ? "bg-[#534AB7] text-white"
                            : "border border-[#dddbe7] text-[#625f6c] hover:border-[#534AB7] dark:border-[#292735] dark:text-[#b6b2c5]"
                        }`}
                      >
                        {co}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#625f6c] dark:text-[#b6b2c5]">
                    Job Description (paste text)
                  </label>
                  <textarea
                    rows={4}
                    value={form.jobDescription ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        jobDescription: e.target.value || undefined,
                      }))
                    }
                    placeholder="Paste the job description to tailor your plan…"
                    className="mt-2 w-full rounded-lg border border-[#dddbe7] bg-[#f6f6f8] px-3 py-2 text-xs text-[#1f1f28] outline-none transition focus:border-[#534AB7] dark:border-[#292735] dark:bg-[#121218] dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => router.push("/plan")}
              className="text-xs text-[#888391] hover:text-[#534AB7]"
            >
              ← Back to plans
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setMode("manual");
                  setStep(2);
                  setManualTitle(
                    form.targetRole
                      ? `${form.targetRole} Interview Prep`
                      : "My Interview Prep Plan",
                  );
                }}
                className="rounded-lg border border-[#dddbe7] px-4 py-2.5 text-xs font-semibold text-[#625f6c] transition hover:border-[#534AB7] hover:text-[#534AB7] dark:border-[#292735] dark:text-[#b6b2c5]"
              >
                Build manually →
              </button>
              <button
                onClick={startGeneration}
                disabled={!canProceedAI}
                className="rounded-lg bg-[#534AB7] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3C3489] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Generate with AI →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2 AI: Generation loading */}
      {step === 2 && mode === "ai" && (
        <div className="flex flex-col items-center py-16 text-center">
          {aiError ? (
            <div className="w-full max-w-md">
              <div className="rounded-xl border border-[#FDE2E2] bg-[#FDE2E2]/30 p-6">
                <p className="text-sm font-semibold text-[#9E1A1A]">
                  Generation failed
                </p>
                <p className="mt-2 text-xs text-[#9E1A1A]">{aiError}</p>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => { setStep(1); setMode(null); }}
                  className="flex-1 rounded-lg border border-[#dddbe7] px-4 py-2 text-xs font-medium text-[#625f6c] dark:border-[#292735]"
                >
                  ← Back
                </button>
                <button
                  onClick={startGeneration}
                  className="flex-1 rounded-lg bg-[#534AB7] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3C3489]"
                >
                  Try again
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-[#EEEDFE] dark:bg-[#26215C]">
                <span className="animate-pulse text-2xl">✦</span>
              </div>
              <h2 className="text-lg font-semibold text-[#1f1f28] dark:text-white">
                Building your interview roadmap…
              </h2>
              <p className="mt-2 text-sm text-[#888391]">
                This usually takes 15–30 seconds
              </p>

              <div className="mt-10 w-full max-w-sm space-y-3 text-left">
                {AI_STEPS.map((label, i) => {
                  const done = i < aiStepIndex;
                  const active = i === aiStepIndex;
                  return (
                    <div key={label} className="flex items-center gap-3">
                      <div
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] transition ${
                          done
                            ? "bg-[#534AB7] text-white"
                            : active
                              ? "border-2 border-[#534AB7]"
                              : "border border-[#dddbe7] dark:border-[#292735]"
                        }`}
                      >
                        {done ? "✓" : active ? <span className="animate-pulse">•</span> : null}
                      </div>
                      <span
                        className={`text-xs transition ${
                          done
                            ? "text-[#534AB7] line-through"
                            : active
                              ? "font-medium text-[#1f1f28] dark:text-white"
                              : "text-[#888391]"
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* Step 2 Manual: Plan builder */}
      {step === 2 && mode === "manual" && (
        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-semibold text-[#1f1f28] dark:text-white">
              Build your plan
            </h1>
            <p className="mt-1 text-sm text-[#888391]">
              Add weeks and sessions. You can add AI-generated prep checklists per
              session after saving.
            </p>
          </div>

          <div className="rounded-xl border border-[#dddbe7] bg-white p-5 dark:border-[#292735] dark:bg-[#1a1a23]">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#534AB7]">
              Plan Title
            </label>
            <input
              type="text"
              value={manualTitle}
              onChange={(e) => setManualTitle(e.target.value)}
              placeholder="e.g. Senior SWE Interview Prep — Q1 2025"
              className="mt-3 w-full rounded-lg border border-[#dddbe7] bg-[#f6f6f8] px-3 py-2 text-sm font-medium text-[#1f1f28] outline-none focus:border-[#534AB7] focus:ring-2 focus:ring-[#E8E4FF] dark:border-[#292735] dark:bg-[#121218] dark:text-white"
            />
          </div>

          <div className="space-y-3">
            {manualWeeks.map((week) => (
              <ManualWeekCard
                key={week.weekNumber}
                week={week}
                onThemeChange={(theme) =>
                  updateManualWeekTheme(week.weekNumber, theme)
                }
                onSessionChange={(sessionId, patch) =>
                  updateManualSession(week.weekNumber, sessionId, patch)
                }
                onAddSession={() => addManualSession(week.weekNumber)}
                onDeleteSession={(sessionId) =>
                  deleteManualSession(week.weekNumber, sessionId)
                }
                onDeleteWeek={() => deleteManualWeek(week.weekNumber)}
              />
            ))}
          </div>

          <button
            onClick={addManualWeek}
            className="w-full rounded-xl border border-dashed border-[#dddbe7] py-3 text-xs font-medium text-[#888391] transition hover:border-[#534AB7] hover:text-[#534AB7] dark:border-[#292735]"
          >
            + Add Week
          </button>

          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => { setStep(1); setMode(null); }}
              className="text-xs text-[#888391] hover:text-[#534AB7]"
            >
              ← Back
            </button>
            <button
              onClick={handleSaveManual}
              disabled={saving || !manualTitle.trim()}
              className="rounded-lg bg-[#534AB7] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3C3489] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? "Saving…" : "Save Plan →"}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: AI plan preview */}
      {step === 3 && generatedPlan && (
        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-semibold text-[#1f1f28] dark:text-white">
              Your plan is ready
            </h1>
            <p className="mt-1 text-sm text-[#888391]">
              Review the AI-generated roadmap before starting.
            </p>
          </div>

          <div className="rounded-xl border border-[#dddbe7] bg-white p-5 dark:border-[#292735] dark:bg-[#1a1a23]">
            <h2 className="text-base font-semibold text-[#1f1f28] dark:text-white">
              {generatedPlan.title}
            </h2>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-full bg-[#EEEDFE] px-2.5 py-0.5 text-[10px] font-semibold text-[#3C3489] dark:bg-[#26215C] dark:text-[#CECBF6]">
                {generatedPlan.targetRole}
              </span>
              <span className="rounded-full bg-[#f1f0f5] px-2.5 py-0.5 text-[10px] font-medium text-[#625f6c] dark:bg-[#20202a] dark:text-[#b6b2c5]">
                {generatedPlan.targetTimeline}
              </span>
              {generatedPlan.targetCompany && (
                <span className="rounded-full bg-[#f1f0f5] px-2.5 py-0.5 text-[10px] font-medium text-[#625f6c] dark:bg-[#20202a] dark:text-[#b6b2c5]">
                  {generatedPlan.targetCompany}
                </span>
              )}
            </div>
          </div>

          {generatedPlan.interviewAreas.length > 0 && (
            <div className="rounded-xl border border-[#dddbe7] bg-white p-5 dark:border-[#292735] dark:bg-[#1a1a23]">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#888391]">
                Interview areas detected
              </p>
              <div className="mt-3 space-y-2">
                {generatedPlan.interviewAreas.map((area) => (
                  <div
                    key={area.name}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          area.priority === "critical"
                            ? "bg-red-500"
                            : area.priority === "high"
                              ? "bg-orange-400"
                              : area.priority === "medium"
                                ? "bg-yellow-400"
                                : "bg-[#dddbe7]"
                        }`}
                      />
                      <span className="text-xs font-medium text-[#1f1f28] dark:text-white">
                        {area.name}
                      </span>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                        area.priority === "critical"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : area.priority === "high"
                            ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                            : area.priority === "medium"
                              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                              : "bg-[#f1f0f5] text-[#625f6c] dark:bg-[#20202a] dark:text-[#b6b2c5]"
                      }`}
                    >
                      {area.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-[#EEEDFE] p-4 text-center dark:bg-[#26215C]">
              <p className="text-2xl font-bold text-[#534AB7] dark:text-[#CECBF6]">
                {generatedPlan.weeks.length}
              </p>
              <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-[#534AB7] dark:text-[#AFA9EC]">
                Weeks
              </p>
            </div>
            <div className="rounded-xl bg-[#EEEDFE] p-4 text-center dark:bg-[#26215C]">
              <p className="text-2xl font-bold text-[#534AB7] dark:text-[#CECBF6]">
                {generatedPlan.weeks.reduce((sum, w) => sum + w.sessions.length, 0)}
              </p>
              <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-[#534AB7] dark:text-[#AFA9EC]">
                Sessions
              </p>
            </div>
            <div className="rounded-xl bg-[#EEEDFE] p-4 text-center dark:bg-[#26215C]">
              <p className="text-2xl font-bold text-[#534AB7] dark:text-[#CECBF6]">
                {generatedPlan.mockInterviews.length}
              </p>
              <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-[#534AB7] dark:text-[#AFA9EC]">
                Mock Interviews
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={startGeneration}
              className="rounded-lg border border-[#dddbe7] px-4 py-2 text-xs font-medium text-[#625f6c] hover:bg-[#f6f6f8] dark:border-[#292735] dark:text-[#b6b2c5] dark:hover:bg-[#20202a]"
            >
              Regenerate
            </button>
            <button
              onClick={handleStartLearning}
              disabled={saving}
              className="flex-1 rounded-lg bg-[#534AB7] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3C3489] disabled:opacity-60"
            >
              {saving ? "Starting…" : "Start Learning →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
