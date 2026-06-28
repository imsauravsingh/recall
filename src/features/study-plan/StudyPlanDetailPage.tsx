"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useStudyPlanStore } from "./studyPlanStore";
import type {
  InterviewStudyPlan,
  DaySession,
  PlanWeek,
  SubTopic,
  SubTopicType,
  SessionType,
} from "@/lib/contentService";

// ─── Constants ────────────────────────────────────────────────────────────────

const DAY_LABELS = ["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const SESSION_TYPE_COLOR: Record<string, string> = {
  dsa: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "system-design": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  behavioral: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  "low-level-design": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  review: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  mock: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  resume: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

const SUBTOPIC_TYPE_COLOR: Record<SubTopicType, string> = {
  concept: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "coding-problem": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  "design-problem": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  behavioral: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  "know-cold": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const SUBTOPIC_TYPE_LABEL: Record<SubTopicType, string> = {
  concept: "Concept",
  "coding-problem": "Coding",
  "design-problem": "Design",
  behavioral: "Behavioral",
  "know-cold": "Know Cold",
};

const DIFFICULTY_COLOR = {
  easy: "text-green-600 dark:text-green-400",
  medium: "text-yellow-600 dark:text-yellow-400",
  hard: "text-red-600 dark:text-red-400",
};

const SESSION_TYPES: SessionType[] = [
  "dsa", "system-design", "behavioral", "low-level-design", "review", "mock", "resume",
];

const SUBTOPIC_TYPES: SubTopicType[] = [
  "concept", "coding-problem", "design-problem", "behavioral", "know-cold",
];

type Tab = "roadmap" | "this-week" | "mock-interviews" | "milestones" | "recall-notes";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getPlanProgress(plan: InterviewStudyPlan): number {
  const all = plan.weeks.flatMap((w) => w.sessions ?? []);
  if (!all.length) return 0;
  return Math.round((all.filter((s) => s?.completed).length / all.length) * 100);
}

function getCurrentWeek(plan: InterviewStudyPlan): PlanWeek | undefined {
  return (
    plan.weeks.find((w) => (w.sessions ?? []).some((s) => !s?.completed)) ??
    plan.weeks[plan.weeks.length - 1]
  );
}

function newSession(): DaySession {
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

// ─── Sub-topic components ─────────────────────────────────────────────────────

function SubTopicItem({
  item,
  onToggle,
  onDelete,
  onUpdate,
}: {
  item: SubTopic;
  onToggle: (completed: boolean) => void;
  onDelete: () => void;
  onUpdate: (patch: Partial<SubTopic>) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    type: item.type,
    title: item.title,
    notes: item.notes ?? "",
    source: item.source ?? "",
  });

  function saveEdit() {
    if (!draft.title.trim()) return;
    onUpdate({
      type: draft.type,
      title: draft.title.trim(),
      notes: draft.notes.trim() || undefined,
      source: draft.source.trim() || undefined,
    });
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="rounded-lg border border-[#534AB7] bg-white p-3 dark:bg-[#1a1a23]">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {SUBTOPIC_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setDraft((d) => ({ ...d, type: t }))}
              className={`rounded-full px-2 py-0.5 text-[9px] font-semibold transition ${
                draft.type === t
                  ? SUBTOPIC_TYPE_COLOR[t]
                  : "border border-[#dddbe7] text-[#888391] dark:border-[#292735]"
              }`}
            >
              {SUBTOPIC_TYPE_LABEL[t]}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={draft.title}
          onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
          className="w-full rounded-lg border border-[#dddbe7] bg-[#f6f6f8] px-3 py-1.5 text-xs font-medium text-[#1f1f28] outline-none focus:border-[#534AB7] dark:border-[#292735] dark:bg-[#121218] dark:text-white"
          placeholder="Title"
        />
        <div className="mt-1.5 grid grid-cols-2 gap-2">
          <input
            type="text"
            value={draft.source}
            onChange={(e) => setDraft((d) => ({ ...d, source: e.target.value }))}
            className="rounded-lg border border-[#dddbe7] bg-[#f6f6f8] px-3 py-1.5 text-xs text-[#1f1f28] outline-none focus:border-[#534AB7] dark:border-[#292735] dark:bg-[#121218] dark:text-white"
            placeholder="Source (e.g. LeetCode 146)"
          />
          <input
            type="text"
            value={draft.notes}
            onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
            className="rounded-lg border border-[#dddbe7] bg-[#f6f6f8] px-3 py-1.5 text-xs text-[#1f1f28] outline-none focus:border-[#534AB7] dark:border-[#292735] dark:bg-[#121218] dark:text-white"
            placeholder="Notes / approach hint"
          />
        </div>
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => setEditing(false)}
            className="rounded-lg border border-[#dddbe7] px-3 py-1 text-[10px] font-medium text-[#625f6c] dark:border-[#292735]"
          >
            Cancel
          </button>
          <button
            onClick={saveEdit}
            disabled={!draft.title.trim()}
            className="rounded-lg bg-[#534AB7] px-3 py-1 text-[10px] font-semibold text-white disabled:opacity-40"
          >
            Save
          </button>
          <button
            onClick={onDelete}
            className="ml-auto rounded-lg border border-[#FDE2E2] px-3 py-1 text-[10px] font-medium text-[#E24B4A]"
          >
            Delete
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group flex items-start gap-2.5 rounded-lg border p-2.5 transition ${
        item.completed
          ? "border-[#dddbe7] bg-[#f9f9fc] opacity-60 dark:border-[#292735] dark:bg-[#14131b]"
          : "border-[#dddbe7] bg-white dark:border-[#292735] dark:bg-[#1a1a23]"
      }`}
    >
      <button
        onClick={() => onToggle(!item.completed)}
        className={`mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border transition ${
          item.completed
            ? "border-[#534AB7] bg-[#534AB7] text-white"
            : "border-[#dddbe7] hover:border-[#534AB7] dark:border-[#292735]"
        }`}
      >
        {item.completed && <span className="text-[8px] font-bold">✓</span>}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${SUBTOPIC_TYPE_COLOR[item.type]}`}
          >
            {SUBTOPIC_TYPE_LABEL[item.type]}
          </span>
          {item.difficulty && (
            <span className={`text-[9px] font-medium ${DIFFICULTY_COLOR[item.difficulty]}`}>
              {item.difficulty}
            </span>
          )}
          {item.source && item.source !== "null" && (
            <span className="text-[9px] text-[#888391]">{item.source}</span>
          )}
        </div>
        <p
          className={`mt-1 text-[11px] font-medium leading-snug ${
            item.completed
              ? "line-through text-[#888391]"
              : "text-[#1f1f28] dark:text-white"
          }`}
        >
          {item.title}
        </p>
        {item.notes && item.notes !== "null" && (
          <p className="mt-0.5 text-[10px] leading-relaxed text-[#888391]">
            {item.notes}
          </p>
        )}
      </div>

      <div className="flex shrink-0 flex-col gap-1 opacity-0 transition group-hover:opacity-100">
        <button
          onClick={() => {
            setDraft({ type: item.type, title: item.title, notes: item.notes ?? "", source: item.source ?? "" });
            setEditing(true);
          }}
          className="text-[10px] text-[#888391] hover:text-[#534AB7]"
          title="Edit"
        >
          ✎
        </button>
        <button
          onClick={onDelete}
          className="text-[10px] text-[#dddbe7] hover:text-[#E24B4A] dark:text-[#292735]"
          title="Remove"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

interface AddSubTopicForm {
  type: SubTopicType;
  title: string;
  notes: string;
  source: string;
}

function SubTopicsSection({
  session,
  weekNumber,
  planId,
  onSubTopicsChange,
  onGenerate,
  generating,
}: {
  session: DaySession;
  weekNumber: number;
  planId: string;
  onSubTopicsChange: (weekNum: number, sessionId: string, subTopics: SubTopic[]) => void;
  onGenerate: () => void;
  generating: boolean;
}) {
  void planId;
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState<AddSubTopicForm>({
    type: "concept",
    title: "",
    notes: "",
    source: "",
  });

  const subTopics = session.subTopics ?? [];
  const doneCount = subTopics.filter((s) => s.completed).length;

  function handleToggle(subTopicId: string, completed: boolean) {
    const now = new Date().toISOString();
    const updated = subTopics.map((st) =>
      st.id === subTopicId
        ? { ...st, completed, completedAt: completed ? now : undefined }
        : st,
    );
    onSubTopicsChange(weekNumber, session.id, updated);
  }

  function handleDelete(subTopicId: string) {
    onSubTopicsChange(
      weekNumber,
      session.id,
      subTopics.filter((st) => st.id !== subTopicId),
    );
  }

  function handleUpdate(subTopicId: string, patch: Partial<SubTopic>) {
    onSubTopicsChange(
      weekNumber,
      session.id,
      subTopics.map((st) => (st.id === subTopicId ? { ...st, ...patch } : st)),
    );
  }

  function handleAdd() {
    if (!form.title.trim()) return;
    const newItem: SubTopic = {
      id: crypto.randomUUID(),
      type: form.type,
      title: form.title.trim(),
      notes: form.notes.trim() || undefined,
      source: form.source.trim() || undefined,
      completed: false,
    };
    onSubTopicsChange(weekNumber, session.id, [...subTopics, newItem]);
    setForm({ type: "concept", title: "", notes: "", source: "" });
    setShowAddForm(false);
  }

  return (
    <div className="mt-2 border-t border-[#f1f0f5] pt-2 dark:border-[#20202a]">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#888391]">
          Prep Checklist
          {subTopics.length > 0 && (
            <span className="ml-1.5 font-normal normal-case">
              ({doneCount}/{subTopics.length} done)
            </span>
          )}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={onGenerate}
            disabled={generating}
            className="flex items-center gap-1 rounded-md bg-[#EEEDFE] px-2 py-1 text-[9px] font-semibold text-[#534AB7] transition hover:bg-[#d8d5fa] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#26215C] dark:text-[#CECBF6]"
          >
            {generating ? (
              <span className="animate-pulse">Generating…</span>
            ) : (
              <>✦ Generate with AI</>
            )}
          </button>
          <button
            onClick={() => setShowAddForm((v) => !v)}
            className="rounded-md border border-[#dddbe7] px-2 py-1 text-[9px] font-medium text-[#625f6c] transition hover:border-[#534AB7] hover:text-[#534AB7] dark:border-[#292735] dark:text-[#b6b2c5]"
          >
            + Add
          </button>
        </div>
      </div>

      {subTopics.length === 0 && !showAddForm && (
        <p className="py-2 text-center text-[10px] text-[#888391]">
          No prep items yet. Generate with AI or add manually.
        </p>
      )}

      <div className="space-y-1.5">
        {subTopics.map((st) => (
          <SubTopicItem
            key={st.id}
            item={st}
            onToggle={(completed) => handleToggle(st.id, completed)}
            onDelete={() => handleDelete(st.id)}
            onUpdate={(patch) => handleUpdate(st.id, patch)}
          />
        ))}
      </div>

      {showAddForm && (
        <div className="mt-2 space-y-2 rounded-lg border border-[#dddbe7] bg-[#f9f9fc] p-3 dark:border-[#292735] dark:bg-[#14131b]">
          <div className="flex flex-wrap gap-1.5">
            {SUBTOPIC_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setForm((f) => ({ ...f, type: t }))}
                className={`rounded-full px-2 py-0.5 text-[9px] font-semibold transition ${
                  form.type === t
                    ? SUBTOPIC_TYPE_COLOR[t]
                    : "border border-[#dddbe7] text-[#888391] dark:border-[#292735]"
                }`}
              >
                {SUBTOPIC_TYPE_LABEL[t]}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Title (required) — be specific"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full rounded-lg border border-[#dddbe7] bg-white px-3 py-1.5 text-xs text-[#1f1f28] outline-none focus:border-[#534AB7] dark:border-[#292735] dark:bg-[#1a1a23] dark:text-white"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Source (e.g. LeetCode 146)"
              value={form.source}
              onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
              className="rounded-lg border border-[#dddbe7] bg-white px-3 py-1.5 text-xs text-[#1f1f28] outline-none focus:border-[#534AB7] dark:border-[#292735] dark:bg-[#1a1a23] dark:text-white"
            />
            <input
              type="text"
              placeholder="Approach hint or notes"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="rounded-lg border border-[#dddbe7] bg-white px-3 py-1.5 text-xs text-[#1f1f28] outline-none focus:border-[#534AB7] dark:border-[#292735] dark:bg-[#1a1a23] dark:text-white"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddForm(false)}
              className="rounded-lg border border-[#dddbe7] px-3 py-1.5 text-[10px] font-medium text-[#625f6c] dark:border-[#292735]"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!form.title.trim()}
              className="rounded-lg bg-[#534AB7] px-3 py-1.5 text-[10px] font-semibold text-white disabled:opacity-40"
            >
              Add Item
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Session row ──────────────────────────────────────────────────────────────

function SessionRow({
  session,
  weekNumber,
  planId,
  isGlobalEditing,
  expanded,
  generatingSubTopics,
  onToggle,
  onExpand,
  onSubTopicsChange,
  onGenerateSubTopics,
  onStructuralEdit,
  onDelete,
  onInlineSave,
}: {
  session: DaySession;
  weekNumber: number;
  planId: string;
  isGlobalEditing: boolean;
  expanded: boolean;
  generatingSubTopics: boolean;
  onToggle: (completed: boolean) => void;
  onExpand: () => void;
  onSubTopicsChange: (weekNum: number, sessionId: string, subTopics: SubTopic[]) => void;
  onGenerateSubTopics: () => void;
  onStructuralEdit: (patch: Partial<DaySession>) => void;
  onDelete: () => void;
  onInlineSave: (updated: DaySession) => void;
}) {
  void planId;
  const [inlineEditing, setInlineEditing] = useState(false);
  const [draft, setDraft] = useState<DaySession>(session);

  function startInlineEdit() {
    setDraft({ ...session });
    setInlineEditing(true);
  }

  function cancelInlineEdit() {
    setInlineEditing(false);
  }

  function saveInlineEdit() {
    onInlineSave(draft);
    setInlineEditing(false);
  }

  const showEditControls = isGlobalEditing || inlineEditing;
  const editedSession = isGlobalEditing ? session : inlineEditing ? draft : session;
  const onEditChange = isGlobalEditing ? onStructuralEdit : (patch: Partial<DaySession>) => setDraft((d) => ({ ...d, ...patch }));

  const subTopicsSection = (
    <div className="border-t border-[#f1f0f5] px-3 pb-3 dark:border-[#20202a]">
      <SubTopicsSection
        session={session}
        weekNumber={weekNumber}
        planId={planId}
        onSubTopicsChange={onSubTopicsChange}
        onGenerate={onGenerateSubTopics}
        generating={generatingSubTopics}
      />
    </div>
  );

  if (showEditControls) {
    return (
      <div className="rounded-lg border border-[#534AB7]/40 bg-white dark:bg-[#1a1a23]">
        <div className="p-3">
          <div className="flex items-start gap-2">
            <div className="flex flex-1 flex-wrap gap-2">
              <select
                value={editedSession.type}
                onChange={(e) => onEditChange({ type: e.target.value as SessionType })}
                className="rounded-lg border border-[#dddbe7] bg-[#f6f6f8] px-2 py-1.5 text-xs text-[#1f1f28] outline-none focus:border-[#534AB7] dark:border-[#292735] dark:bg-[#121218] dark:text-white"
              >
                {SESSION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.replace(/-/g, " ")}
                  </option>
                ))}
              </select>
              <select
                value={editedSession.day}
                onChange={(e) => onEditChange({ day: Number(e.target.value) })}
                className="rounded-lg border border-[#dddbe7] bg-[#f6f6f8] px-2 py-1.5 text-xs text-[#1f1f28] outline-none focus:border-[#534AB7] dark:border-[#292735] dark:bg-[#121218] dark:text-white"
              >
                {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                  <option key={d} value={d}>
                    {DAY_LABELS[d]}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={editedSession.durationMinutes}
                onChange={(e) => onEditChange({ durationMinutes: Number(e.target.value) })}
                min={15}
                step={15}
                className="w-20 rounded-lg border border-[#dddbe7] bg-[#f6f6f8] px-2 py-1.5 text-xs text-[#1f1f28] outline-none focus:border-[#534AB7] dark:border-[#292735] dark:bg-[#121218] dark:text-white"
                placeholder="min"
              />
            </div>
            <button
              onClick={onDelete}
              className="mt-1 shrink-0 text-sm text-[#dddbe7] transition hover:text-[#E24B4A] dark:text-[#292735]"
              title="Delete session"
            >
              ✕
            </button>
          </div>
          <input
            type="text"
            value={editedSession.topic}
            onChange={(e) => onEditChange({ topic: e.target.value })}
            placeholder="Topic (e.g. Binary Trees & BST Operations)"
            className="mt-2 w-full rounded-lg border border-[#dddbe7] bg-[#f6f6f8] px-3 py-1.5 text-xs font-medium text-[#1f1f28] outline-none focus:border-[#534AB7] dark:border-[#292735] dark:bg-[#121218] dark:text-white"
          />
          <input
            type="text"
            value={editedSession.notes ?? ""}
            onChange={(e) => onEditChange({ notes: e.target.value || undefined })}
            placeholder="Notes / focus hint (optional)"
            className="mt-1.5 w-full rounded-lg border border-[#dddbe7] bg-[#f6f6f8] px-3 py-1.5 text-xs text-[#1f1f28] outline-none focus:border-[#534AB7] dark:border-[#292735] dark:bg-[#121218] dark:text-white"
          />
          {inlineEditing && (
            <div className="mt-2 flex gap-2">
              <button
                onClick={cancelInlineEdit}
                className="rounded-lg border border-[#dddbe7] px-3 py-1 text-[10px] font-medium text-[#625f6c] dark:border-[#292735]"
              >
                Cancel
              </button>
              <button
                onClick={saveInlineEdit}
                className="rounded-lg bg-[#534AB7] px-3 py-1 text-[10px] font-semibold text-white"
              >
                Save
              </button>
            </div>
          )}
        </div>
        {expanded && subTopicsSection}
        {!expanded && (
          <button
            onClick={onExpand}
            className="flex w-full items-center justify-center gap-1 border-t border-[#f1f0f5] py-1.5 text-[10px] text-[#888391] hover:text-[#534AB7] dark:border-[#20202a]"
          >
            Show prep checklist
            {(session.subTopics?.length ?? 0) > 0 && (
              <span className="text-[#534AB7]">
                ({session.subTopics!.filter((s) => s.completed).length}/{session.subTopics!.length})
              </span>
            )}
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`group rounded-lg border transition ${
        session.completed
          ? "border-[#dddbe7] bg-[#f9f9fc] dark:border-[#292735] dark:bg-[#14131b]"
          : "border-[#dddbe7] bg-white dark:border-[#292735] dark:bg-[#1a1a23]"
      }`}
    >
      <div className="flex items-start gap-3 p-3">
        <button
          onClick={() => onToggle(!session.completed)}
          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${
            session.completed
              ? "border-[#534AB7] bg-[#534AB7] text-white"
              : "border-[#dddbe7] hover:border-[#534AB7] dark:border-[#292735]"
          }`}
        >
          {session.completed && <span className="text-[9px] font-bold">✓</span>}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-[9px] font-semibold capitalize ${SESSION_TYPE_COLOR[session.type] ?? "bg-[#f1f0f5] text-[#625f6c]"}`}
            >
              {session.type.replace(/-/g, " ")}
            </span>
            <span className="text-[10px] text-[#888391]">
              {DAY_LABELS[session.day]} · {session.durationMinutes}m
            </span>
          </div>
          <p
            className={`mt-1 text-xs font-medium ${
              session.completed
                ? "line-through text-[#888391]"
                : "text-[#1f1f28] dark:text-white"
            }`}
          >
            {session.topic}
          </p>
          {session.notes && (
            <p className="mt-0.5 text-[10px] text-[#888391]">{session.notes}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            onClick={startInlineEdit}
            className="text-[11px] text-[#dddbe7] opacity-0 transition hover:text-[#534AB7] group-hover:opacity-100 dark:text-[#292735]"
            title="Edit session"
          >
            ✎
          </button>
          <button
            onClick={onExpand}
            className="rounded-md px-1.5 py-1 text-[10px] text-[#888391] transition hover:bg-[#f1f0f5] hover:text-[#534AB7] dark:hover:bg-[#20202a]"
            title={expanded ? "Hide prep list" : "Show prep list"}
          >
            {expanded ? "▲" : "▼"}
            {(session.subTopics?.length ?? 0) > 0 && (
              <span className="ml-1 text-[#534AB7]">
                {session.subTopics!.filter((s) => s.completed).length}/
                {session.subTopics!.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {expanded && subTopicsSection}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function StudyPlanDetailPage({ planId }: { planId: string }) {
  const router = useRouter();
  const {
    activePlan,
    loading,
    generating,
    error,
    loadPlan,
    updatePlan,
    toggleSession,
    archivePlan,
    regenerateActivePlan,
    regenerateActivePlanWeek,
    generateSubTopicsForSession,
  } = useStudyPlanStore();

  const [activeTab, setActiveTab] = useState<Tab>("roadmap");
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([1]));
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());
  const [generatingSessions, setGeneratingSessions] = useState<Set<string>>(new Set());
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState<InterviewStudyPlan | null>(null);
  const [savingEdits, setSavingEdits] = useState(false);
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);

  useEffect(() => {
    void loadPlan(planId);
  }, [planId, loadPlan]);

  const plan = activePlan;

  // ── Edit mode helpers ──────────────────────────────────────────────────────

  function enterEditMode() {
    if (!plan) return;
    setEditDraft(JSON.parse(JSON.stringify(plan)) as InterviewStudyPlan);
    setIsEditing(true);
  }

  function cancelEdit() {
    setEditDraft(null);
    setIsEditing(false);
  }

  async function saveEdits() {
    if (!editDraft || !plan) return;
    setSavingEdits(true);
    try {
      await updatePlan(plan.id, {
        title: editDraft.title,
        weeks: editDraft.weeks,
        interviewAreas: editDraft.interviewAreas,
      });
      setEditDraft(null);
      setIsEditing(false);
    } finally {
      setSavingEdits(false);
    }
  }

  function updateDraftTitle(title: string) {
    setEditDraft((prev) => (prev ? { ...prev, title } : prev));
  }

  function updateDraftWeekTheme(weekNumber: number, theme: string) {
    setEditDraft((prev) =>
      prev
        ? {
            ...prev,
            weeks: prev.weeks.map((w) =>
              w.weekNumber === weekNumber ? { ...w, theme } : w,
            ),
          }
        : prev,
    );
  }

  function updateDraftSession(
    weekNumber: number,
    sessionId: string,
    patch: Partial<DaySession>,
  ) {
    setEditDraft((prev) =>
      prev
        ? {
            ...prev,
            weeks: prev.weeks.map((w) =>
              w.weekNumber === weekNumber
                ? {
                    ...w,
                    sessions: w.sessions.map((s) =>
                      s.id === sessionId ? { ...s, ...patch } : s,
                    ),
                  }
                : w,
            ),
          }
        : prev,
    );
  }

  function addDraftSession(weekNumber: number) {
    setEditDraft((prev) =>
      prev
        ? {
            ...prev,
            weeks: prev.weeks.map((w) =>
              w.weekNumber === weekNumber
                ? { ...w, sessions: [...w.sessions, newSession()] }
                : w,
            ),
          }
        : prev,
    );
  }

  function deleteDraftSession(weekNumber: number, sessionId: string) {
    setEditDraft((prev) =>
      prev
        ? {
            ...prev,
            weeks: prev.weeks.map((w) =>
              w.weekNumber === weekNumber
                ? { ...w, sessions: w.sessions.filter((s) => s.id !== sessionId) }
                : w,
            ),
          }
        : prev,
    );
  }

  function addDraftWeek() {
    setEditDraft((prev) => {
      if (!prev) return prev;
      const nextNum = (prev.weeks[prev.weeks.length - 1]?.weekNumber ?? 0) + 1;
      return {
        ...prev,
        weeks: [
          ...prev.weeks,
          { weekNumber: nextNum, theme: "", areas: [], sessions: [] },
        ],
      };
    });
  }

  function deleteDraftWeek(weekNumber: number) {
    setEditDraft((prev) =>
      prev
        ? { ...prev, weeks: prev.weeks.filter((w) => w.weekNumber !== weekNumber) }
        : prev,
    );
  }

  // ── Inline session save (outside global edit mode) ────────────────────────

  async function handleInlineSaveSession(weekNumber: number, updated: DaySession) {
    if (!plan) return;
    const updatedWeeks = plan.weeks.map((w) =>
      w.weekNumber === weekNumber
        ? { ...w, sessions: w.sessions.map((s) => (s.id === updated.id ? updated : s)) }
        : w,
    );
    await updatePlan(plan.id, { weeks: updatedWeeks });
  }

  // ── Sub-topic helpers (live plan, not draft) ───────────────────────────────

  const handleSubTopicsChange = useCallback(
    async (weekNumber: number, sessionId: string, subTopics: SubTopic[]) => {
      if (!plan) return;
      const updatedWeeks = plan.weeks.map((w) =>
        w.weekNumber === weekNumber
          ? {
              ...w,
              sessions: (w.sessions ?? []).map((s) =>
                s.id === sessionId ? { ...s, subTopics } : s,
              ),
            }
          : w,
      );
      await updatePlan(plan.id, { weeks: updatedWeeks });
    },
    [plan, updatePlan],
  );

  async function handleGenerateSubTopics(session: DaySession) {
    if (!plan) return;
    setGeneratingSessions((prev) => new Set([...prev, session.id]));
    try {
      await generateSubTopicsForSession(plan.id, session.id);
      setExpandedSessions((prev) => new Set([...prev, session.id]));
    } finally {
      setGeneratingSessions((prev) => {
        const next = new Set(prev);
        next.delete(session.id);
        return next;
      });
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading && !plan) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-[#888391]">Loading plan…</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <p className="text-sm text-[#888391]">Plan not found.</p>
        <button
          onClick={() => router.push("/plan")}
          className="text-xs text-[#534AB7] underline"
        >
          Back to plans
        </button>
      </div>
    );
  }

  const displayPlan = isEditing && editDraft ? editDraft : plan;
  const progress = getPlanProgress(plan);
  const currentWeek = getCurrentWeek(plan);
  const isArchived = plan.status === "archived";

  const tabs: { id: Tab; label: string }[] = [
    { id: "roadmap", label: "Roadmap" },
    { id: "this-week", label: "This Week" },
    { id: "mock-interviews", label: "Mock Interviews" },
    { id: "milestones", label: "Milestones" },
    { id: "recall-notes", label: "Recall Notes" },
  ];

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-lg bg-[#FDE2E2] px-4 py-3 text-sm text-[#9E1A1A]">
          {error}
        </div>
      )}

      {/* Header */}
      <section className="rounded-xl border border-[#dddbe7] bg-white p-5 dark:border-[#292735] dark:bg-[#1a1a23]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <button
              onClick={() => router.push("/plan")}
              className="mb-2 text-[10px] text-[#888391] hover:text-[#534AB7]"
            >
              ← All plans
            </button>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-[#EEEDFE] px-2.5 py-0.5 text-[10px] font-semibold text-[#3C3489] dark:bg-[#26215C] dark:text-[#CECBF6]">
                {plan.targetRole}
              </span>
              {plan.targetCompany && (
                <span className="rounded-full bg-[#f1f0f5] px-2.5 py-0.5 text-[10px] font-medium text-[#625f6c] dark:bg-[#20202a] dark:text-[#b6b2c5]">
                  {plan.targetCompany}
                </span>
              )}
              {isArchived && (
                <span className="rounded-full bg-[#FDE2E2] px-2.5 py-0.5 text-[10px] font-semibold text-[#9E1A1A]">
                  Archived
                </span>
              )}
              {!plan.aiGenerated && (
                <span className="rounded-full bg-[#f1f0f5] px-2.5 py-0.5 text-[10px] font-medium text-[#625f6c] dark:bg-[#20202a] dark:text-[#b6b2c5]">
                  Manual
                </span>
              )}
            </div>

            {isEditing ? (
              <input
                type="text"
                value={editDraft?.title ?? ""}
                onChange={(e) => updateDraftTitle(e.target.value)}
                className="mt-2 w-full rounded-lg border border-[#534AB7] bg-[#f6f6f8] px-3 py-1.5 text-sm font-semibold text-[#1f1f28] outline-none dark:bg-[#121218] dark:text-white"
                placeholder="Plan title"
              />
            ) : (
              <h1 className="mt-2 text-base font-semibold text-[#1f1f28] dark:text-white">
                {plan.title}
              </h1>
            )}

            <div className="mt-1 flex flex-wrap gap-1.5">
              {(plan.techStack ?? []).map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-[#dddbe7] px-2 py-0.5 text-[10px] text-[#625f6c] dark:border-[#292735] dark:text-[#b6b2c5]"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="text-right">
            <p className="text-2xl font-bold text-[#534AB7] dark:text-[#CECBF6]">
              {progress}%
            </p>
            <p className="text-[10px] text-[#888391]">complete</p>
            <div className="mt-2 h-1.5 w-24 overflow-hidden rounded-full bg-[#e9e8f6] dark:bg-[#20202a]">
              <div
                className="h-full rounded-full bg-[#534AB7]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {isEditing ? (
            <>
              <button
                onClick={cancelEdit}
                className="rounded-lg border border-[#dddbe7] px-3 py-1.5 text-xs font-medium text-[#625f6c] transition hover:bg-[#f6f6f8] dark:border-[#292735] dark:text-[#b6b2c5]"
              >
                Cancel
              </button>
              <button
                onClick={saveEdits}
                disabled={savingEdits}
                className="rounded-lg bg-[#534AB7] px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-[#3C3489] disabled:opacity-60"
              >
                {savingEdits ? "Saving…" : "Save Changes"}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={enterEditMode}
                disabled={isArchived}
                className="rounded-lg border border-[#dddbe7] px-3 py-1.5 text-xs font-medium text-[#625f6c] transition hover:border-[#534AB7] hover:text-[#534AB7] disabled:opacity-40 dark:border-[#292735] dark:text-[#b6b2c5]"
              >
                Edit Plan
              </button>
              {plan.aiGenerated && (
                <button
                  onClick={() => setConfirmRegenerate(true)}
                  disabled={generating || isArchived}
                  className="rounded-lg border border-[#dddbe7] px-3 py-1.5 text-xs font-medium text-[#625f6c] transition hover:border-[#534AB7] hover:text-[#534AB7] disabled:opacity-40 dark:border-[#292735] dark:text-[#b6b2c5]"
                >
                  {generating ? "Regenerating…" : "Regenerate Plan"}
                </button>
              )}
              <button
                onClick={() => archivePlan(plan.id)}
                disabled={isArchived}
                className="rounded-lg border border-[#dddbe7] px-3 py-1.5 text-xs font-medium text-[#625f6c] transition hover:bg-[#f6f6f8] disabled:opacity-40 dark:border-[#292735] dark:text-[#b6b2c5] dark:hover:bg-[#20202a]"
              >
                Archive
              </button>
            </>
          )}
        </div>
      </section>

      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto rounded-lg border border-[#dddbe7] bg-white p-1 dark:border-[#292735] dark:bg-[#1a1a23]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition ${
              activeTab === tab.id
                ? "bg-[#534AB7] text-white"
                : "text-[#625f6c] hover:bg-[#f1f0f5] dark:text-[#b6b2c5] dark:hover:bg-[#20202a]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Roadmap tab */}
      {activeTab === "roadmap" && (
        <div className="space-y-3">
          {displayPlan.weeks.map((week) => {
            const expanded = expandedWeeks.has(week.weekNumber);
            const weekSessions = week.sessions ?? [];
            const doneCount = weekSessions.filter((s) => s?.completed).length;

            return (
              <div
                key={week.weekNumber}
                className="rounded-xl border border-[#dddbe7] bg-white dark:border-[#292735] dark:bg-[#1a1a23]"
              >
                <div className="flex w-full items-center justify-between gap-4 p-4">
                  <button
                    onClick={() =>
                      setExpandedWeeks((prev) => {
                        const next = new Set(prev);
                        if (next.has(week.weekNumber)) next.delete(week.weekNumber);
                        else next.add(week.weekNumber);
                        return next;
                      })
                    }
                    className="flex flex-1 items-center gap-3 text-left"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#EEEDFE] text-xs font-bold text-[#534AB7] dark:bg-[#26215C] dark:text-[#CECBF6]">
                      {week.weekNumber}
                    </div>
                    <div className="min-w-0 flex-1">
                      {isEditing ? (
                        <input
                          type="text"
                          value={week.theme}
                          onChange={(e) =>
                            updateDraftWeekTheme(week.weekNumber, e.target.value)
                          }
                          onClick={(e) => e.stopPropagation()}
                          placeholder="Week theme"
                          className="w-full rounded border border-[#dddbe7] bg-[#f6f6f8] px-2 py-1 text-xs font-semibold text-[#1f1f28] outline-none focus:border-[#534AB7] dark:border-[#292735] dark:bg-[#121218] dark:text-white"
                        />
                      ) : (
                        <p className="text-xs font-semibold text-[#1f1f28] dark:text-white">
                          {week.theme}
                        </p>
                      )}
                      <p className="mt-0.5 text-[10px] text-[#888391]">
                        {doneCount}/{weekSessions.length} sessions
                      </p>
                    </div>
                  </button>
                  <div className="flex items-center gap-2">
                    {isEditing && (
                      <button
                        onClick={() => deleteDraftWeek(week.weekNumber)}
                        className="text-xs text-[#dddbe7] transition hover:text-[#E24B4A] dark:text-[#292735]"
                        title="Delete week"
                      >
                        ✕
                      </button>
                    )}
                    <span className="text-[#888391]">{expanded ? "▲" : "▼"}</span>
                  </div>
                </div>

                {expanded && (
                  <div className="border-t border-[#dddbe7] p-4 dark:border-[#292735]">
                    <div className="space-y-2">
                      {weekSessions.map((session) => (
                        <SessionRow
                          key={session.id}
                          session={session}
                          weekNumber={week.weekNumber}
                          planId={plan.id}
                          isGlobalEditing={isEditing}
                          expanded={expandedSessions.has(session.id)}
                          generatingSubTopics={generatingSessions.has(session.id)}
                          onToggle={(completed) =>
                            toggleSession(plan.id, week.weekNumber, session.id, completed)
                          }
                          onExpand={() =>
                            setExpandedSessions((prev) => {
                              const next = new Set(prev);
                              if (next.has(session.id)) next.delete(session.id);
                              else next.add(session.id);
                              return next;
                            })
                          }
                          onSubTopicsChange={handleSubTopicsChange}
                          onGenerateSubTopics={() => handleGenerateSubTopics(session)}
                          onStructuralEdit={(patch) =>
                            updateDraftSession(week.weekNumber, session.id, patch)
                          }
                          onDelete={() =>
                            deleteDraftSession(week.weekNumber, session.id)
                          }
                          onInlineSave={(updated) =>
                            handleInlineSaveSession(week.weekNumber, updated)
                          }
                        />
                      ))}
                    </div>

                    {isEditing && (
                      <button
                        onClick={() => addDraftSession(week.weekNumber)}
                        className="mt-3 w-full rounded-lg border border-dashed border-[#dddbe7] py-2 text-xs font-medium text-[#888391] transition hover:border-[#534AB7] hover:text-[#534AB7] dark:border-[#292735]"
                      >
                        + Add Session
                      </button>
                    )}

                    {!isEditing && plan.aiGenerated && !isArchived && (
                      <button
                        onClick={() =>
                          regenerateActivePlanWeek(plan.id, week.weekNumber)
                        }
                        disabled={generating}
                        className="mt-3 rounded-lg border border-[#dddbe7] px-3 py-1.5 text-[10px] font-medium text-[#625f6c] transition hover:border-[#534AB7] hover:text-[#534AB7] disabled:opacity-40 dark:border-[#292735] dark:text-[#b6b2c5]"
                      >
                        Regenerate this week
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {isEditing && (
            <button
              onClick={addDraftWeek}
              className="w-full rounded-xl border border-dashed border-[#dddbe7] py-3 text-xs font-medium text-[#888391] transition hover:border-[#534AB7] hover:text-[#534AB7] dark:border-[#292735]"
            >
              + Add Week
            </button>
          )}
        </div>
      )}

      {/* This Week tab */}
      {activeTab === "this-week" && (
        <div className="space-y-4">
          {currentWeek ? (
            <>
              <div className="rounded-xl border border-[#EEEDFE] bg-[#EEEDFE]/40 p-4 dark:border-[#26215C] dark:bg-[#26215C]/30">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#534AB7]">
                  Week {currentWeek.weekNumber}
                </p>
                <p className="mt-1 text-sm font-semibold text-[#26215C] dark:text-[#CECBF6]">
                  {currentWeek.theme}
                </p>
              </div>
              <div className="space-y-2">
                {currentWeek.sessions.map((session) => (
                  <SessionRow
                    key={session.id}
                    session={session}
                    weekNumber={currentWeek.weekNumber}
                    planId={plan.id}
                    isGlobalEditing={false}
                    expanded={expandedSessions.has(session.id)}
                    generatingSubTopics={generatingSessions.has(session.id)}
                    onToggle={(completed) =>
                      toggleSession(plan.id, currentWeek.weekNumber, session.id, completed)
                    }
                    onExpand={() =>
                      setExpandedSessions((prev) => {
                        const next = new Set(prev);
                        if (next.has(session.id)) next.delete(session.id);
                        else next.add(session.id);
                        return next;
                      })
                    }
                    onSubTopicsChange={handleSubTopicsChange}
                    onGenerateSubTopics={() => handleGenerateSubTopics(session)}
                    onStructuralEdit={() => {}}
                    onDelete={() => {}}
                    onInlineSave={(updated) =>
                      handleInlineSaveSession(currentWeek.weekNumber, updated)
                    }
                  />
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-[#888391]">All sessions complete!</p>
          )}
        </div>
      )}

      {/* Mock Interviews tab */}
      {activeTab === "mock-interviews" && (
        <div className="space-y-3">
          {plan.mockInterviews.length === 0 ? (
            <p className="text-sm text-[#888391]">No mock interviews scheduled.</p>
          ) : (
            plan.mockInterviews.map((mock) => (
              <div
                key={mock.id}
                className={`flex items-center gap-4 rounded-xl border p-4 transition ${
                  mock.completed
                    ? "border-[#dddbe7] opacity-60 dark:border-[#292735]"
                    : "border-[#dddbe7] bg-white dark:border-[#292735] dark:bg-[#1a1a23]"
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EEEDFE] dark:bg-[#26215C]">
                  <span className="text-sm">🎤</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold capitalize text-[#1f1f28] dark:text-white">
                    {mock.type.replace("-", " ")} Mock
                  </p>
                  <p className="mt-0.5 text-[10px] text-[#888391]">
                    Week {mock.weekNumber} · {DAY_LABELS[mock.scheduledDay]} ·{" "}
                    {mock.durationMinutes}m
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                    mock.completed
                      ? "bg-[#EAF3DE] text-[#27500A]"
                      : "bg-[#EEEDFE] text-[#534AB7] dark:bg-[#26215C] dark:text-[#CECBF6]"
                  }`}
                >
                  {mock.completed ? "Done" : "Scheduled"}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Milestones tab */}
      {activeTab === "milestones" && (
        <div className="space-y-4">
          {plan.milestones.length === 0 ? (
            <p className="text-sm text-[#888391]">No milestones defined.</p>
          ) : (
            plan.milestones.map((milestone) => (
              <div
                key={milestone.weekNumber}
                className="rounded-xl border border-[#dddbe7] bg-white p-5 dark:border-[#292735] dark:bg-[#1a1a23]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EEEDFE] text-xs font-bold text-[#534AB7] dark:bg-[#26215C] dark:text-[#CECBF6]">
                    W{milestone.weekNumber}
                  </div>
                  <p className="text-sm font-semibold text-[#1f1f28] dark:text-white">
                    {milestone.description}
                  </p>
                </div>
                <ul className="mt-4 space-y-2">
                  {milestone.checkpoints.map((checkpoint, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-xs text-[#625f6c] dark:text-[#b6b2c5]"
                    >
                      <span className="mt-0.5 text-[#534AB7]">◇</span>
                      {checkpoint}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      )}

      {/* Recall Notes tab */}
      {activeTab === "recall-notes" && (
        <div className="space-y-3">
          {plan.recallTemplates.length === 0 ? (
            <p className="text-sm text-[#888391]">No recall templates.</p>
          ) : (
            plan.recallTemplates.map((template) => (
              <div
                key={template.area}
                className="rounded-xl border border-[#dddbe7] bg-white p-5 dark:border-[#292735] dark:bg-[#1a1a23]"
              >
                <p className="text-xs font-semibold text-[#534AB7]">
                  {template.area}
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {template.sections.map((section) => (
                    <div
                      key={section}
                      className="rounded-lg bg-[#f6f6f8] px-3 py-2 text-xs font-medium text-[#625f6c] dark:bg-[#20202a] dark:text-[#b6b2c5]"
                    >
                      {section}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Regenerate confirm modal */}
      {confirmRegenerate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl dark:bg-[#1a1a23]">
            <h3 className="text-sm font-semibold text-[#1f1f28] dark:text-white">
              Regenerate entire plan?
            </h3>
            <p className="mt-2 text-xs text-[#888391]">
              All weeks and topics will be regenerated. Completed sessions and prep
              checklists will be lost.
            </p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setConfirmRegenerate(false)}
                className="flex-1 rounded-lg border border-[#dddbe7] px-4 py-2 text-xs font-medium text-[#625f6c] dark:border-[#292735]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setConfirmRegenerate(false);
                  void regenerateActivePlan(plan.id);
                }}
                className="flex-1 rounded-lg bg-[#534AB7] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3C3489]"
              >
                Regenerate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
