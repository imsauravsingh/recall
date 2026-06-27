import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/react";
import { useTopicStore } from "../topics/topicStore";
import { rounds } from "../recall/recallData";
import { useRevisionQueueStore } from "../recall/revisionQueueStore";
import { useStudyPlanStore } from "../study-plan/studyPlanStore";
import type { RecallSession } from "../../lib/types";
import { getRecallInsights } from "../../lib/insightsService";
import { dashboardService } from "./dashboardService";

function DashboardMetric({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-lg bg-[#f1f0f5] p-3 dark:bg-[#20202a]">
      <p className="text-2xl font-semibold leading-none text-[#24232b] dark:text-white">
        {value}
      </p>
      <p className="mt-1 text-xs text-[#625f6c] dark:text-[#b6b2c5]">{label}</p>
      {sub ? <p className="mt-0.5 text-[11px] text-[#888391]">{sub}</p> : null}
    </div>
  );
}

function DashboardPage() {
  const { user } = useUser();
  const firstName = user?.firstName ?? user?.emailAddresses[0]?.emailAddress?.split('@')[0] ?? 'there';
  const { topics, loadTopics, loading } = useTopicStore();
  const { items: queueItems, loadQueue } = useRevisionQueueStore();
  const { plan: studyPlan, loadPlan } = useStudyPlanStore();
  const currentWeek =
    studyPlan?.weeks[Math.min(2, studyPlan.weeks.length - 1)] ??
    studyPlan?.weeks[0];
  const [sessions, setSessions] = useState<RecallSession[]>([]);

  useEffect(() => {
    loadTopics();
    loadQueue();
    void dashboardService
      .getRecallSessions()
      .then((items) => setSessions(items));
    void loadPlan();
  }, [loadTopics, loadQueue, loadPlan]);

  const stats = useMemo(() => {
    const active = topics.filter((topic) => !topic.archived).length;
    const archived = topics.filter((topic) => topic.archived).length;
    const categories = Array.from(
      new Set(topics.map((topic) => topic.category)),
    ).length;
    const avgScore =
      sessions.length > 0
        ? Math.round(
            sessions.reduce((sum, item) => sum + item.score, 0) /
              sessions.length,
          )
        : 68;
    const completionPercent =
      topics.length > 0
        ? Math.round(
            (queueItems.filter((item) => item.status === "Completed").length /
              Math.max(topics.length, 1)) *
              100,
          )
        : 0;
    const planStatus = studyPlan?.status ?? "draft";
    const weeklyHours = studyPlan?.weeklyCommitmentHours ?? 0;

    return {
      active,
      archived,
      categories,
      avgScore,
      completionPercent,
      planStatus,
      weeklyHours,
    };
  }, [sessions, topics, queueItems, studyPlan]);

  const insights = useMemo(
    () => getRecallInsights({ topics, queueItems, sessions }),
    [topics, queueItems, sessions],
  );

  return (
    <div className="space-y-4">
      <section className="rounded-lg bg-[#EEEDFE] p-4 dark:bg-[#26215C]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-[#26215C] dark:text-[#CECBF6]">
              Good morning, {firstName}
            </h1>
            <p className="mt-1 text-xs text-[#534AB7] dark:text-[#AFA9EC]">
              Week 3 of 12 - {queueItems.length} topics due for recall
            </p>
          </div>
          <Link
            to="/recall"
            className="inline-flex items-center justify-center rounded-lg bg-[#534AB7] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#3C3489]"
          >
            Start recall session
          </Link>
        </div>
      </section>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardMetric
          label="Total topics"
          value={topics.length || 128}
          sub={topics.length ? `${stats.active} active` : "+12 this week"}
        />
        <DashboardMetric
          label="Recall queue"
          value={queueItems.length}
          sub="Due for revision"
        />
        <DashboardMetric
          label="Plan status"
          value={studyPlan?.status ? studyPlan.status.toUpperCase() : "Draft"}
          sub="Current study plan"
        />
        <DashboardMetric
          label="Weekly commitment"
          value={`${stats.weeklyHours} hrs`}
          sub="Target hours"
        />
      </div>

      <section className="rounded-lg border border-[#dddbe7] bg-white p-4 dark:border-[#292735] dark:bg-[#1a1a23]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#888391]">
              AI-guided insights
            </p>
            <h2 className="mt-1 text-base font-semibold">
              Suggested next focus
            </h2>
            <p className="mt-2 text-sm text-[#625f6c] dark:text-[#b6b2c5]">
              {insights.nextAction}
            </p>
          </div>
          <div className="rounded-lg bg-[#EEEDFE] px-3 py-2 text-xs font-semibold text-[#3C3489] dark:bg-[#26215C] dark:text-[#CECBF6]">
            {insights.focusArea}
          </div>
        </div>
      </section>

      <section>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#888391]">
          Interview rounds overview
        </p>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {rounds.map((round) => (
            <Link
              key={round.name}
              to={round.name === "DSA" ? "/topics" : "/recall"}
              className="rounded-lg border border-[#dddbe7] bg-white p-3 transition hover:border-[#afa9ec] dark:border-[#292735] dark:bg-[#1a1a23]"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-md text-xs font-semibold ${round.accent}`}
                >
                  {round.name[0]}
                </span>
                <div>
                  <p className="text-sm font-semibold">{round.name}</p>
                  <p className="text-[11px] text-[#625f6c] dark:text-[#b6b2c5]">
                    {round.meta} - {round.recall}% recall
                  </p>
                </div>
              </div>
              <div className="mt-3 h-1 overflow-hidden rounded-full bg-[#dddbe7] dark:bg-[#292735]">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${round.recall}%`, background: round.color }}
                />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-[#dddbe7] bg-white p-3 dark:border-[#292735] dark:bg-[#1a1a23]">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold">
            Recall Queue ({queueItems.length})
          </h2>
          <Link to="/revision" className="text-xs font-medium text-[#534AB7]">
            View all
          </Link>
        </div>
        {queueItems.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#dddbe7] bg-[#f6f6f8] p-4 text-sm text-[#625f6c] dark:border-[#292735] dark:bg-[#20202a] dark:text-[#b6b2c5]">
            No queue items yet. Add topics to your revision queue from the
            topics page.
          </div>
        ) : (
          <div className="divide-y divide-[#eceaf2] dark:divide-[#292735]">
            {queueItems.slice(0, 4).map((item) => {
              const topic = topics.find((topic) => topic.id === item.topicId);
              const title = topic?.title ?? "Untitled topic";
              const dueDate = new Date(item.dueDate);
              const diffDays = Math.max(
                0,
                Math.ceil(
                  (dueDate.getTime() - new Date().getTime()) /
                    (1000 * 60 * 60 * 24),
                ),
              );
              const dueLabel =
                diffDays === 0
                  ? "Due today"
                  : diffDays === 1
                    ? "Due in 1 day"
                    : `Due in ${diffDays} days`;

              return (
                <div
                  key={item.id}
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-2 py-2 text-xs"
                >
                  <span className="min-w-0 truncate font-medium">{title}</span>
                  <span className="rounded-full bg-[#EEEDFE] px-2 py-0.5 text-[10px] text-[#3C3489] dark:bg-[#26215C] dark:text-[#CECBF6]">
                    {item.priority}
                  </span>
                  <span className="font-semibold text-[#0F6E56]">
                    {dueLabel}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-lg border border-[#dddbe7] bg-white p-4 dark:border-[#292735] dark:bg-[#1a1a23]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#888391]">
              Month 1 study plan
            </p>
            <h2 className="mt-1 text-base font-semibold">
              {currentWeek
                ? `${currentWeek.week}: ${currentWeek.goal}`
                : "Loading plan..."}
            </h2>
            <p className="mt-2 text-xs text-[#625f6c] dark:text-[#b6b2c5]">
              {studyPlan
                ? `${studyPlan.monthlyGoals.length} goals · ${studyPlan.dailySchedule.length} daily sessions · ${studyPlan.weeklyCommitmentHours ?? 0} hrs/week`
                : "Planning your first week..."}
            </p>
          </div>
          <Link
            to="/plan"
            className="rounded-lg border border-[#AFA9EC] bg-[#EEEDFE] px-3 py-2 text-center text-xs font-semibold text-[#3C3489]"
          >
            View plan
          </Link>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-4">
          {currentWeek ? (
            currentWeek.sections.map((section) => (
              <div
                key={section.title}
                className="rounded-lg bg-[#f6f6f8] p-3 dark:bg-[#20202a]"
              >
                <p className="text-xs font-semibold">{section.title}</p>
                <p className="mt-1 text-[11px] leading-4 text-[#625f6c] dark:text-[#b6b2c5]">
                  {section.items.slice(0, 3).join(", ")}
                </p>
              </div>
            ))
          ) : (
            <div className="rounded-lg bg-[#f6f6f8] p-3 dark:bg-[#20202a]">
              <p className="text-xs font-semibold">Loading plan details...</p>
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-2 sm:grid-cols-3">
        <DashboardMetric
          label="Category variety"
          value={stats.categories || 5}
        />
        <DashboardMetric
          label="Last updated"
          value={
            topics[0]?.updatedAt
              ? new Date(topics[0].updatedAt).toLocaleDateString()
              : "N/A"
          }
        />
        <DashboardMetric
          label="Month 1 targets"
          value={studyPlan?.monthlyGoals.length ?? 0}
          sub="Confidence checks"
        />
      </section>
    </div>
  );
}

export default DashboardPage;
