import { useEffect, useState } from "react";
import { useStudyPlanStore } from "../study-plan/studyPlanStore";
import type { StudyWeek } from "../../lib/contentService";

function StudyPlanPage() {
  const {
    plan: studyPlan,
    loading,
    loadPlan,
    savePlan,
    duplicatePlan,
    archivePlan,
    restorePlan,
  } = useStudyPlanStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [weeklyHours, setWeeklyHours] = useState(0);
  const [monthlyGoals, setMonthlyGoals] = useState<string[]>([]);
  const [planWeeks, setPlanWeeks] = useState<StudyWeek[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void loadPlan();
  }, [loadPlan]);

  useEffect(() => {
    if (!studyPlan) return;
    setTitle(studyPlan.title);
    setDescription(studyPlan.description);
    setWeeklyHours(studyPlan.weeklyCommitmentHours ?? 0);
    setMonthlyGoals(studyPlan.monthlyGoals);
    setPlanWeeks(studyPlan.weeks);
  }, [studyPlan]);

  if (loading || !studyPlan) {
    return <div>Loading study plan...</div>;
  }

  const isArchived = studyPlan.status === "archived";
  const formattedUpdatedAt = studyPlan.updatedAt
    ? new Date(studyPlan.updatedAt).toLocaleDateString()
    : null;
  const formattedCreatedAt = studyPlan.createdAt
    ? new Date(studyPlan.createdAt).toLocaleDateString()
    : null;

  const handleSave = async () => {
    await savePlan({
      ...studyPlan,
      title,
      description,
      weeklyCommitmentHours: weeklyHours,
      monthlyGoals,
      weeks: planWeeks,
      updatedAt: new Date().toISOString(),
    });
    setMessage("Study plan saved successfully.");
    window.setTimeout(() => setMessage(""), 3000);
  };

  const updateGoal = (index: number, value: string) => {
    setMonthlyGoals((current) =>
      current.map((goal, goalIndex) => (goalIndex === index ? value : goal)),
    );
  };

  const addGoal = () => setMonthlyGoals((current) => [...current, ""]);
  const removeGoal = (index: number) =>
    setMonthlyGoals((current) =>
      current.filter((_, goalIndex) => goalIndex !== index),
    );

  const updateWeekGoal = (weekIndex: number, value: string) => {
    setPlanWeeks((current) =>
      current.map((week, index) =>
        index === weekIndex ? { ...week, goal: value } : week,
      ),
    );
  };

  const updateWeekItem = (
    weekIndex: number,
    sectionIndex: number,
    itemIndex: number,
    value: string,
  ) => {
    setPlanWeeks((current) =>
      current.map((week, index) => {
        if (index !== weekIndex) return week;
        return {
          ...week,
          sections: week.sections.map((section, sectionIdx) => {
            if (sectionIdx !== sectionIndex) return section;
            return {
              ...section,
              items: section.items.map((item, idx) =>
                idx === itemIndex ? value : item,
              ),
            };
          }),
        };
      }),
    );
  };

  const addWeekItem = (weekIndex: number, sectionIndex: number) => {
    setPlanWeeks((current) =>
      current.map((week, index) => {
        if (index !== weekIndex) return week;
        return {
          ...week,
          sections: week.sections.map((section, sectionIdx) => {
            if (sectionIdx !== sectionIndex) return section;
            return {
              ...section,
              items: [...section.items, "New task"],
            };
          }),
        };
      }),
    );
  };

  const planHealth = Math.min(
    100,
    Math.max(10, monthlyGoals.length * 12 + studyPlan.dailySchedule.length * 8),
  );

  return (
    <div className="space-y-4">
      <section className="rounded-lg bg-[#EEEDFE] p-4 dark:bg-[#26215C]">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#534AB7] dark:text-[#AFA9EC]">
              Month 1
            </p>
            <h1 className="mt-2 text-lg font-semibold text-[#26215C] dark:text-[#CECBF6]">
              {studyPlan.title}
            </h1>
            <p className="mt-2 max-w-3xl text-xs leading-5 text-[#534AB7] dark:text-[#AFA9EC]">
              {studyPlan.description}
            </p>
          </div>
          <div className="rounded-3xl bg-white p-4 text-sm dark:bg-[#1a1a23]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#888391]">
              Plan health
            </p>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-[#e9e8f6] dark:bg-[#20202a]">
                <div
                  className="h-full rounded-full bg-[#534AB7]"
                  style={{ width: `${planHealth}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-[#3C3489] dark:text-[#CECBF6]">
                {planHealth}%
              </span>
            </div>
            <p className="mt-2 text-xs text-[#625f6c] dark:text-[#b6b2c5]">
              Weekly rhythm, goals coverage, and commitment alignment.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
          <div>
            <label className="block text-sm font-semibold text-[#26215C] dark:text-[#CECBF6]">
              Plan title
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="mt-2 w-full rounded-3xl border border-[#d9d9e1] bg-white px-3 py-2 text-sm text-[#1f1f28] shadow-sm outline-none transition focus:border-[#534AB7] focus:ring-2 focus:ring-[#E8E4FF] dark:border-[#2f2d3c] dark:bg-[#121218] dark:text-white"
              />
            </label>
            <label className="mt-4 block text-sm font-semibold text-[#26215C] dark:text-[#CECBF6]">
              Description
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                className="mt-2 w-full rounded-3xl border border-[#d9d9e1] bg-white px-3 py-2 text-sm text-[#1f1f28] shadow-sm outline-none transition focus:border-[#534AB7] focus:ring-2 focus:ring-[#E8E4FF] dark:border-[#2f2d3c] dark:bg-[#121218] dark:text-white"
              />
            </label>

            <div className="mt-5 rounded-3xl border border-[#dddbe7] bg-[#faf9fc] p-4 dark:border-[#292735] dark:bg-[#14131b]">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[#26215C] dark:text-[#CECBF6]">
                  Monthly goals
                </p>
                <button
                  onClick={addGoal}
                  type="button"
                  className="rounded-full bg-[#534AB7] px-3 py-1 text-xs font-semibold text-white transition hover:bg-[#3C3489]"
                >
                  Add goal
                </button>
              </div>
              <div className="mt-3 space-y-3">
                {monthlyGoals.map((goal, index) => (
                  <div
                    key={`${goal}-${index}`}
                    className="flex items-start gap-2"
                  >
                    <input
                      value={goal}
                      onChange={(event) =>
                        updateGoal(index, event.target.value)
                      }
                      className="w-full rounded-3xl border border-[#d9d9e1] bg-white px-3 py-2 text-sm text-[#1f1f28] outline-none dark:border-[#2f2d3c] dark:bg-[#121218] dark:text-white"
                    />
                    <button
                      onClick={() => removeGoal(index)}
                      type="button"
                      className="rounded-full bg-[#E24B4A] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#C42E2E]"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-3 rounded-3xl border border-[#dddbe7] bg-white p-4 text-sm dark:border-[#292735] dark:bg-[#1a1a23]">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#888391]">
                Plan status
              </p>
              <p className="mt-2 text-base font-semibold">
                {isArchived ? "Archived" : "Active"}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#888391]">
                Weekly commitment
              </p>
              <input
                type="number"
                min={1}
                value={weeklyHours}
                onChange={(event) => setWeeklyHours(Number(event.target.value))}
                className="mt-2 w-full rounded-3xl border border-[#d9d9e1] bg-[#f6f6f8] px-3 py-2 text-sm text-[#1f1f28] outline-none dark:border-[#2f2d3c] dark:bg-[#1a1a23] dark:text-white"
              />
            </div>
            {formattedCreatedAt ? (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#888391]">
                  Created
                </p>
                <p className="mt-2 text-sm text-[#625f6c] dark:text-[#b6b2c5]">
                  {formattedCreatedAt}
                </p>
              </div>
            ) : null}
            {formattedUpdatedAt ? (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#888391]">
                  Updated
                </p>
                <p className="mt-2 text-sm text-[#625f6c] dark:text-[#b6b2c5]">
                  {formattedUpdatedAt}
                </p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={handleSave}
            className="rounded-3xl bg-[#534AB7] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#3C3489]"
          >
            Save plan
          </button>
          {message ? (
            <span className="text-sm text-[#27500A]">{message}</span>
          ) : null}
        </div>
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        {studyPlan.dailySchedule.map((slot) => (
          <article
            key={slot.time}
            className="rounded-lg border border-[#dddbe7] bg-white p-4 dark:border-[#292735] dark:bg-[#1a1a23]"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold">{slot.time}</h2>
                <p className="mt-1 text-xs text-[#888391]">{slot.duration}</p>
              </div>
              <span className="rounded-full bg-[#f1f0f5] px-3 py-1 text-xs text-[#625f6c] dark:bg-[#20202a] dark:text-[#b6b2c5]">
                Mon-Fri
              </span>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {slot.blocks.map((block) => (
                <div
                  key={block}
                  className="rounded-lg bg-[#f1f0f5] p-3 text-sm font-semibold dark:bg-[#20202a]"
                >
                  {block}
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {slot.focus.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-[#EEEDFE] px-2 py-0.5 text-[10px] font-medium text-[#3C3489] dark:bg-[#26215C] dark:text-[#CECBF6]"
                >
                  {item}
                </span>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-3 xl:grid-cols-2">
        {planWeeks.map((week, index) => (
          <article
            key={week.week}
            className="rounded-lg border border-[#dddbe7] bg-white p-4 dark:border-[#292735] dark:bg-[#1a1a23]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="w-full">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#888391]">
                      {week.week}
                    </p>
                    <input
                      value={week.goal}
                      onChange={(event) =>
                        updateWeekGoal(index, event.target.value)
                      }
                      className="mt-1 w-full rounded-3xl border border-[#d9d9e1] bg-[#f9f8fc] px-3 py-2 text-sm text-[#1f1f28] outline-none transition focus:border-[#534AB7] focus:ring-2 focus:ring-[#E8E4FF] dark:border-[#2f2d3c] dark:bg-[#171720] dark:text-white"
                    />
                  </div>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EEEDFE] text-sm font-semibold text-[#534AB7] dark:bg-[#26215C] dark:text-[#CECBF6]">
                    {index + 1}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {week.sections.map((section, sectionIndex) => (
                <div
                  key={section.title}
                  className="rounded-lg bg-[#f6f6f8] p-3 dark:bg-[#20202a]"
                >
                  <h3 className="text-xs font-semibold">{section.title}</h3>
                  <div className="mt-2 space-y-2">
                    {section.items.map((item, itemIndex) => (
                      <input
                        key={`${item}-${itemIndex}`}
                        value={item}
                        onChange={(event) =>
                          updateWeekItem(
                            index,
                            sectionIndex,
                            itemIndex,
                            event.target.value,
                          )
                        }
                        className="w-full rounded-3xl border border-[#dddbe7] bg-white px-3 py-2 text-sm text-[#1f1f28] outline-none transition focus:border-[#534AB7] focus:ring-2 focus:ring-[#E8E4FF] dark:border-[#292735] dark:bg-[#1a1a23] dark:text-white"
                      />
                    ))}
                    <button
                      type="button"
                      onClick={() => addWeekItem(index, sectionIndex)}
                      className="rounded-full bg-[#534AB7] px-3 py-1 text-xs font-semibold text-white transition hover:bg-[#3C3489]"
                    >
                      Add task
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-3 lg:grid-cols-[1fr_1.3fr]">
        <article className="rounded-lg border border-[#dddbe7] bg-white p-4 dark:border-[#292735] dark:bg-[#1a1a23]">
          <h2 className="text-sm font-semibold">Recall note structure</h2>
          <div className="mt-3 grid gap-2">
            {studyPlan.recallNoteSections.map((section) => (
              <div
                key={section}
                className="rounded-lg bg-[#f1f0f5] p-3 text-xs font-semibold dark:bg-[#20202a]"
              >
                {section}
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-lg border border-[#dddbe7] bg-white p-4 dark:border-[#292735] dark:bg-[#1a1a23]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold">End of Month 1 goal</h2>
              <p className="mt-1 text-xs text-[#625f6c] dark:text-[#b6b2c5]">
                You should confidently explain these topics without reading
                notes.
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${isArchived ? "bg-[#FDE2E2] text-[#9E1A1A]" : "bg-[#EAF3DE] text-[#27500A]"}`}
            >
              {isArchived ? "Archived" : "Active"}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {studyPlan.monthlyGoals.map((goal) => (
              <span
                key={goal}
                className="rounded-full bg-[#EAF3DE] px-2.5 py-1 text-[11px] font-semibold text-[#27500A]"
              >
                {goal}
              </span>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={duplicatePlan}
              className="rounded-3xl bg-[#534AB7] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#3C3489]"
            >
              Duplicate plan
            </button>
            <button
              onClick={isArchived ? restorePlan : archivePlan}
              className={`rounded-3xl px-4 py-2 text-xs font-semibold transition ${isArchived ? "bg-[#313131] text-white hover:bg-[#161616]" : "bg-[#E24B4A] text-white hover:bg-[#C42E2E]"}`}
            >
              {isArchived ? "Restore plan" : "Archive plan"}
            </button>
          </div>
        </article>
      </section>
    </div>
  );
}

export default StudyPlanPage;
