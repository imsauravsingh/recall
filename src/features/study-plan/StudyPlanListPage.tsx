"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStudyPlanStore } from "./studyPlanStore";
import type { InterviewStudyPlan } from "@/lib/contentService";

const PRIORITY_COLOR: Record<string, string> = {
  critical: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  low: "bg-[#f1f0f5] text-[#625f6c] dark:bg-[#20202a] dark:text-[#b6b2c5]",
};

function getPlanProgress(plan: InterviewStudyPlan): number {
  const allSessions = plan.weeks.flatMap((w) => w.sessions ?? []);
  if (allSessions.length === 0) return 0;
  const done = allSessions.filter((s) => s?.completed).length;
  return Math.round((done / allSessions.length) * 100);
}

function PlanCard({
  plan,
  onOpen,
  onDuplicate,
  onArchive,
  onRestore,
  onDelete,
}: {
  plan: InterviewStudyPlan;
  onOpen: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
  onRestore: () => void;
  onDelete: () => void;
}) {
  const progress = getPlanProgress(plan);
  const isArchived = plan.status === "archived";
  const techStack = plan.techStack ?? [];
  const interviewAreas = plan.interviewAreas ?? [];
  const topAreas = interviewAreas
    .filter((a) => a.priority === "critical" || a.priority === "high")
    .slice(0, 3);

  return (
    <article className="flex flex-col rounded-xl border border-[#dddbe7] bg-white p-5 transition hover:shadow-md dark:border-[#292735] dark:bg-[#1a1a23]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#EEEDFE] px-2.5 py-0.5 text-[10px] font-semibold text-[#3C3489] dark:bg-[#26215C] dark:text-[#CECBF6]">
              {plan.targetRole ?? "Study Plan"}
            </span>
            {isArchived && (
              <span className="rounded-full bg-[#FDE2E2] px-2.5 py-0.5 text-[10px] font-semibold text-[#9E1A1A]">
                Archived
              </span>
            )}
          </div>
          <h2 className="mt-2 text-sm font-semibold text-[#1f1f28] dark:text-white line-clamp-2">
            {plan.title}
          </h2>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {techStack.slice(0, 5).map((tech) => (
          <span
            key={tech}
            className="rounded-full border border-[#dddbe7] px-2 py-0.5 text-[10px] text-[#625f6c] dark:border-[#292735] dark:text-[#b6b2c5]"
          >
            {tech}
          </span>
        ))}
      </div>

      {topAreas.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {topAreas.map((area) => (
            <span
              key={area.name}
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${PRIORITY_COLOR[area.priority]}`}
            >
              {area.name}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4">
        <div className="flex items-center justify-between text-[10px] text-[#888391]">
          <span>{plan.targetTimeline ?? "—"}</span>
          <span>{progress}% done</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#e9e8f6] dark:bg-[#20202a]">
          <div
            className="h-full rounded-full bg-[#534AB7] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={onOpen}
          className="flex-1 rounded-lg bg-[#534AB7] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#3C3489]"
        >
          Open
        </button>
        <button
          onClick={onDuplicate}
          className="rounded-lg border border-[#dddbe7] px-3 py-1.5 text-xs font-medium text-[#625f6c] transition hover:bg-[#f6f6f8] dark:border-[#292735] dark:text-[#b6b2c5] dark:hover:bg-[#20202a]"
        >
          Duplicate
        </button>
        {isArchived ? (
          <button
            onClick={onRestore}
            className="rounded-lg border border-[#dddbe7] px-3 py-1.5 text-xs font-medium text-[#625f6c] transition hover:bg-[#f6f6f8] dark:border-[#292735] dark:text-[#b6b2c5] dark:hover:bg-[#20202a]"
          >
            Restore
          </button>
        ) : (
          <button
            onClick={onArchive}
            className="rounded-lg border border-[#dddbe7] px-3 py-1.5 text-xs font-medium text-[#625f6c] transition hover:bg-[#f6f6f8] dark:border-[#292735] dark:text-[#b6b2c5] dark:hover:bg-[#20202a]"
          >
            Archive
          </button>
        )}
        <button
          onClick={onDelete}
          className="rounded-lg border border-[#FDE2E2] px-3 py-1.5 text-xs font-medium text-[#9E1A1A] transition hover:bg-[#FDE2E2] dark:border-red-900/30 dark:text-red-400"
        >
          Delete
        </button>
      </div>
    </article>
  );
}

export default function StudyPlanListPage() {
  const router = useRouter();
  const { plans, loading, error, loadPlans, archivePlan, restorePlan, duplicatePlan, deletePlan } =
    useStudyPlanStore();
  const [showArchived, setShowArchived] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    void loadPlans();
  }, [loadPlans]);

  const active = plans.filter((p) => p.status !== "archived");
  const archived = plans.filter((p) => p.status === "archived");
  const visible = showArchived ? [...active, ...archived] : active;

  async function handleDelete(id: string) {
    await deletePlan(id);
    setConfirmDeleteId(null);
  }

  if (loading && plans.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-[#888391]">Loading your study plans…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg bg-[#FDE2E2] px-4 py-3 text-sm text-[#9E1A1A]">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-[#1f1f28] dark:text-white">
            Study Plans
          </h1>
          <p className="mt-0.5 text-xs text-[#888391]">
            AI-generated interview preparation roadmaps
          </p>
        </div>
        <div className="flex items-center gap-3">
          {archived.length > 0 && (
            <button
              onClick={() => setShowArchived((v) => !v)}
              className="text-xs text-[#888391] underline underline-offset-2 hover:text-[#534AB7]"
            >
              {showArchived ? "Hide archived" : `Show archived (${archived.length})`}
            </button>
          )}
          <button
            onClick={() => router.push("/plan/new")}
            className="rounded-lg bg-[#534AB7] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#3C3489]"
          >
            + New Plan
          </button>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#dddbe7] bg-white py-20 text-center dark:border-[#292735] dark:bg-[#1a1a23]">
          <div className="text-4xl">🎯</div>
          <h2 className="mt-4 text-base font-semibold text-[#1f1f28] dark:text-white">
            Your interview preparation starts here
          </h2>
          <p className="mt-2 max-w-sm text-sm text-[#888391]">
            Answer 4 questions. AI builds your complete roadmap in under 2 minutes.
          </p>
          <button
            onClick={() => router.push("/plan/new")}
            className="mt-6 rounded-lg bg-[#534AB7] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3C3489]"
          >
            Create Study Plan →
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onOpen={() => router.push(`/plan/${plan.id}`)}
              onDuplicate={() => duplicatePlan(plan.id)}
              onArchive={() => archivePlan(plan.id)}
              onRestore={() => restorePlan(plan.id)}
              onDelete={() => setConfirmDeleteId(plan.id)}
            />
          ))}
        </div>
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl dark:bg-[#1a1a23]">
            <h3 className="text-sm font-semibold text-[#1f1f28] dark:text-white">
              Delete study plan?
            </h3>
            <p className="mt-2 text-xs text-[#888391]">
              This action cannot be undone. All progress will be lost.
            </p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 rounded-lg border border-[#dddbe7] px-4 py-2 text-xs font-medium text-[#625f6c] dark:border-[#292735] dark:text-[#b6b2c5]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="flex-1 rounded-lg bg-[#E24B4A] px-4 py-2 text-xs font-semibold text-white hover:bg-[#C42E2E]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
