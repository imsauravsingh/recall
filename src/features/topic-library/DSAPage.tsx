"use client";

import { useEffect, useState } from "react";
import { ApiRoutes, callApi } from "@/lib/api";
import type { TopicCategory, TopicGroup, TopicItem } from "@/lib/contentService";
import { DEFAULT_DSA } from "./defaults";

// ─── Migration ────────────────────────────────────────────────────────────────

const PATTERN_SUBTITLES: Record<string, string> = {
  "Sliding Window": "Fixed and variable length windows",
  "Two Pointers": "Opposite ends, same direction",
  "Fast & Slow Pointer": "Cycle detection, middle of list",
  "Fast & Slow Pointers": "Cycle detection, middle of list",
  "Prefix Sum": "Range queries, subarray sums",
  "Binary Search": "Sorted arrays, search space reduction",
  "DFS": "Tree traversal, backtracking, graph paths",
  "BFS": "Shortest path, level-order traversal",
  "Backtracking": "Permutations, subsets, constraint solving",
  "Divide & Conquer": "Merge sort, quick select, recursive split",
  "Greedy": "Interval scheduling, locally optimal choices",
  "Dynamic Programming": "1D DP, 2D DP, knapsack, memoization",
  "Topological Sort": "DAG ordering, course scheduling",
  "Union Find": "Disjoint sets, connected components",
  "Monotonic Stack": "Next greater/smaller element, span problems",
};

// If the DB has the old single-group structure, convert each item into its own pattern group
function migrateIfNeeded(cat: TopicCategory): { category: TopicCategory; migrated: boolean } {
  const hasOldStructure =
    cat.groups.length === 1 &&
    (cat.groups[0].name === "Problem Solving Patterns" ||
      (cat.groups[0].items.length > 3 &&
        cat.groups[0].items.every((i) => i.name in PATTERN_SUBTITLES)));

  if (!hasOldStructure) return { category: cat, migrated: false };

  const newGroups: TopicGroup[] = cat.groups[0].items.map((item) => ({
    id: item.id,
    name: item.name,
    subtitle: PATTERN_SUBTITLES[item.name],
    items: [],
  }));

  return { category: { ...cat, groups: newGroups }, migrated: true };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

type ConfidenceLevel = "Weak" | "Medium" | "Strong";

function getConfidence(items: TopicItem[]): { pct: number; level: ConfidenceLevel } {
  if (!items.length) return { pct: 0, level: "Weak" };
  const pct = Math.round((items.filter((i) => i.completed).length / items.length) * 100);
  const level: ConfidenceLevel = pct >= 70 ? "Strong" : pct >= 40 ? "Medium" : "Weak";
  return { pct, level };
}

function timeAgo(dateStr?: string): string {
  if (!dateStr) return "Never";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return mins <= 1 ? "Just now" : `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  return days < 14 ? "1 week ago" : `${Math.floor(days / 7)} weeks ago`;
}

const DIFFICULTY_STYLE: Record<string, string> = {
  easy: "bg-[#d4edda] text-[#1a6630] dark:bg-[#1a3d24] dark:text-[#5fcf7f]",
  medium: "bg-[#fff3cd] text-[#856404] dark:bg-[#3d2f00] dark:text-[#f0b429]",
  hard: "bg-[#f8d7da] text-[#842029] dark:bg-[#3d0b0b] dark:text-[#f06f6f]",
};

const CONFIDENCE_BADGE: Record<ConfidenceLevel, string> = {
  Strong: "border border-[#1a6630] bg-[#d4edda] text-[#1a6630] dark:border-[#5fcf7f]/40 dark:bg-[#1a3d24] dark:text-[#5fcf7f]",
  Medium: "border border-[#856404] bg-[#fff3cd] text-[#856404] dark:border-[#f0b429]/40 dark:bg-[#3d2f00] dark:text-[#f0b429]",
  Weak: "border border-[#842029] bg-[#f8d7da] text-[#842029] dark:border-[#f06f6f]/40 dark:bg-[#3d0b0b] dark:text-[#f06f6f]",
};

const CONFIDENCE_BAR: Record<ConfidenceLevel, string> = {
  Strong: "bg-[#28a745]",
  Medium: "bg-[#f0b429]",
  Weak: "bg-[#E24B4A]",
};

// ─── Question row ─────────────────────────────────────────────────────────────

function QuestionRow({
  item,
  onToggle,
  onUpdate,
  onDelete,
}: {
  item: TopicItem;
  onToggle: () => void;
  onUpdate: (patch: Partial<TopicItem>) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    name: item.name,
    difficulty: item.difficulty ?? "",
    url: item.url ?? "",
    notes: item.notes ?? "",
  });

  function save() {
    if (!draft.name.trim()) return;
    onUpdate({
      name: draft.name.trim(),
      difficulty: (draft.difficulty as TopicItem["difficulty"]) || undefined,
      url: draft.url.trim() || undefined,
      notes: draft.notes.trim() || undefined,
    });
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="border-t border-[#f1f0f5] bg-[#faf9fc] p-5 dark:border-[#1e1e28] dark:bg-[#14131b]">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
            autoFocus
            placeholder="Question title"
            className="min-w-0 flex-1 rounded-lg border border-[#534AB7] bg-white px-4 py-2.5 text-sm text-[#1f1f28] outline-none dark:bg-[#1a1a23] dark:text-white"
          />
          <select
            value={draft.difficulty}
            onChange={(e) => setDraft((d) => ({ ...d, difficulty: e.target.value }))}
            className="rounded-lg border border-[#dddbe7] bg-white px-3 py-2.5 text-sm text-[#1f1f28] outline-none dark:border-[#292735] dark:bg-[#1a1a23] dark:text-white"
          >
            <option value="">Difficulty</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div className="mt-3 flex gap-3">
          <input
            type="text"
            value={draft.url}
            onChange={(e) => setDraft((d) => ({ ...d, url: e.target.value }))}
            placeholder="LeetCode URL (optional)"
            className="flex-1 rounded-lg border border-[#dddbe7] bg-white px-4 py-2.5 text-sm text-[#1f1f28] outline-none dark:border-[#292735] dark:bg-[#1a1a23] dark:text-white"
          />
          <input
            type="text"
            value={draft.notes}
            onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
            placeholder="Notes / hint (optional)"
            className="flex-1 rounded-lg border border-[#dddbe7] bg-white px-4 py-2.5 text-sm text-[#1f1f28] outline-none dark:border-[#292735] dark:bg-[#1a1a23] dark:text-white"
          />
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => setEditing(false)}
            className="rounded-lg border border-[#dddbe7] px-4 py-2 text-sm font-medium text-[#625f6c] dark:border-[#292735]"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={!draft.name.trim()}
            className="rounded-lg bg-[#534AB7] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            Save
          </button>
          <button
            onClick={onDelete}
            className="ml-auto rounded-lg border border-[#FDE2E2] px-4 py-2 text-sm font-medium text-[#E24B4A]"
          >
            Delete
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-4 border-t border-[#f1f0f5] px-5 py-4 hover:bg-[#faf9fc] dark:border-[#1e1e28] dark:hover:bg-[#14131b]">
      {/* Checkbox */}
      <button
        onClick={onToggle}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition ${
          item.completed
            ? "border-[#534AB7] bg-[#534AB7] text-white"
            : "border-[#dddbe7] hover:border-[#534AB7] dark:border-[#292735]"
        }`}
      >
        {item.completed && <span className="text-xs font-bold">✓</span>}
      </button>

      {/* Title */}
      <span
        className={`flex-1 text-sm ${
          item.completed ? "text-[#888391] line-through" : "text-[#1f1f28] dark:text-white"
        }`}
      >
        {item.name}
      </span>

      {/* Notes */}
      {item.notes && (
        <span className="hidden max-w-[240px] truncate text-xs text-[#888391] sm:block">
          {item.notes}
        </span>
      )}

      {/* Difficulty */}
      {item.difficulty && (
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
            DIFFICULTY_STYLE[item.difficulty]
          }`}
        >
          {item.difficulty}
        </span>
      )}

      {/* URL */}
      {item.url && (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="shrink-0 text-xs font-medium text-[#534AB7] underline hover:text-[#3C3489]"
        >
          Link ↗
        </a>
      )}

      {/* Actions — always visible, not hover-only */}
      <div className="flex shrink-0 items-center gap-3">
        <button
          onClick={() => {
            setDraft({ name: item.name, difficulty: item.difficulty ?? "", url: item.url ?? "", notes: item.notes ?? "" });
            setEditing(true);
          }}
          className="rounded-md px-2.5 py-1 text-xs font-medium text-[#625f6c] transition hover:bg-[#EEEDFE] hover:text-[#534AB7] dark:hover:bg-[#26215C] dark:hover:text-[#CECBF6]"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="rounded-md px-2.5 py-1 text-xs font-medium text-[#888391] transition hover:bg-[#FDE2E2] hover:text-[#E24B4A]"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

// ─── Add question form ────────────────────────────────────────────────────────

function AddQuestionForm({ onAdd }: { onAdd: (item: Omit<TopicItem, "id" | "completed">) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");

  function submit() {
    if (!name.trim()) return;
    onAdd({
      name: name.trim(),
      difficulty: (difficulty as TopicItem["difficulty"]) || undefined,
      url: url.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    setName(""); setDifficulty(""); setUrl(""); setNotes("");
    setOpen(false);
  }

  if (!open) {
    return (
      <div className="border-t border-[#f1f0f5] px-5 py-3.5 dark:border-[#1e1e28]">
        <button
          onClick={() => setOpen(true)}
          className="flex w-full items-center gap-2 text-sm font-medium text-[#888391] transition hover:text-[#534AB7]"
        >
          <span className="text-base leading-none">+</span> Add question
        </button>
      </div>
    );
  }

  return (
    <div className="border-t border-[#534AB7]/20 bg-[#faf9fc] p-5 dark:border-[#534AB7]/20 dark:bg-[#14131b]">
      <p className="mb-3 text-sm font-semibold text-[#1f1f28] dark:text-white">Add question</p>
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); if (e.key === "Escape") setOpen(false); }}
          autoFocus
          placeholder="Question title (e.g. Two Sum)"
          className="min-w-0 flex-1 rounded-lg border border-[#534AB7] bg-white px-4 py-2.5 text-sm text-[#1f1f28] outline-none placeholder:text-[#b6b2c5] dark:bg-[#1a1a23] dark:text-white"
        />
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="rounded-lg border border-[#dddbe7] bg-white px-3 py-2.5 text-sm text-[#1f1f28] outline-none dark:border-[#292735] dark:bg-[#1a1a23] dark:text-white"
        >
          <option value="">Difficulty</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>
      <div className="mt-3 flex gap-3">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="LeetCode URL (optional)"
          className="flex-1 rounded-lg border border-[#dddbe7] bg-white px-4 py-2.5 text-sm text-[#1f1f28] outline-none placeholder:text-[#b6b2c5] dark:border-[#292735] dark:bg-[#1a1a23] dark:text-white"
        />
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes / hint (optional)"
          className="flex-1 rounded-lg border border-[#dddbe7] bg-white px-4 py-2.5 text-sm text-[#1f1f28] outline-none placeholder:text-[#b6b2c5] dark:border-[#292735] dark:bg-[#1a1a23] dark:text-white"
        />
      </div>
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => setOpen(false)}
          className="rounded-lg border border-[#dddbe7] px-4 py-2 text-sm font-medium text-[#625f6c] dark:border-[#292735]"
        >
          Cancel
        </button>
        <button
          onClick={submit}
          disabled={!name.trim()}
          className="rounded-lg bg-[#534AB7] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          Add Question
        </button>
      </div>
    </div>
  );
}

// ─── Pattern row ──────────────────────────────────────────────────────────────

function PatternRow({
  group,
  onUpdate,
  onDelete,
}: {
  group: TopicGroup;
  onUpdate: (updated: TopicGroup) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(group.name);
  const [subtitleDraft, setSubtitleDraft] = useState(group.subtitle ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { pct, level } = getConfidence(group.items);

  function saveNameEdit() {
    if (!nameDraft.trim()) return;
    onUpdate({ ...group, name: nameDraft.trim(), subtitle: subtitleDraft.trim() || undefined });
    setEditingName(false);
  }

  function toggleItem(itemId: string) {
    const now = new Date().toISOString();
    onUpdate({
      ...group,
      lastRevisedAt: now,
      items: group.items.map((i) =>
        i.id === itemId
          ? { ...i, completed: !i.completed, completedAt: !i.completed ? now : undefined }
          : i,
      ),
    });
  }

  function updateItem(itemId: string, patch: Partial<TopicItem>) {
    onUpdate({
      ...group,
      items: group.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)),
    });
  }

  function deleteItem(itemId: string) {
    onUpdate({ ...group, items: group.items.filter((i) => i.id !== itemId) });
  }

  function addItem(data: Omit<TopicItem, "id" | "completed">) {
    const now = new Date().toISOString();
    const newItem: TopicItem = { ...data, id: crypto.randomUUID(), completed: false };
    onUpdate({ ...group, lastRevisedAt: now, items: [...group.items, newItem] });
  }

  return (
    <div className="border-b border-[#eeedf3] last:border-b-0 dark:border-[#222130]">
      {/* Table row */}
      <div
        className="flex cursor-pointer items-center gap-4 px-5 py-4 hover:bg-[#f9f9fc] dark:hover:bg-[#16151e]"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Pattern name + subtitle */}
        <div className="min-w-0 flex-1">
          {editingName ? (
            <div
              className="space-y-1"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="text"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") saveNameEdit(); if (e.key === "Escape") setEditingName(false); }}
                autoFocus
                className="w-full rounded border border-[#534AB7] bg-[#f6f6f8] px-2 py-1 text-sm font-semibold text-[#1f1f28] outline-none dark:bg-[#121218] dark:text-white"
              />
              <input
                type="text"
                value={subtitleDraft}
                onChange={(e) => setSubtitleDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") saveNameEdit(); if (e.key === "Escape") setEditingName(false); }}
                className="w-full rounded border border-[#dddbe7] bg-[#f6f6f8] px-2 py-0.5 text-xs text-[#625f6c] outline-none dark:border-[#292735] dark:bg-[#121218] dark:text-[#b6b2c5]"
                placeholder="Subtitle (optional)"
              />
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setEditingName(false)}
                  className="rounded border border-[#dddbe7] px-2 py-0.5 text-[10px] text-[#625f6c]"
                >
                  Cancel
                </button>
                <button
                  onClick={saveNameEdit}
                  className="rounded bg-[#534AB7] px-2 py-0.5 text-[10px] font-semibold text-white"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="group/name flex items-start gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#1f1f28] dark:text-white">
                  {group.name}
                </p>
                {group.subtitle && (
                  <p className="truncate text-[11px] text-[#888391]">{group.subtitle}</p>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setNameDraft(group.name);
                  setSubtitleDraft(group.subtitle ?? "");
                  setEditingName(true);
                  setExpanded(true);
                }}
                className="mt-0.5 shrink-0 text-[10px] text-[#dddbe7] opacity-0 transition hover:text-[#534AB7] group-hover/name:opacity-100 dark:text-[#292735]"
                title="Edit"
              >
                ✎
              </button>
            </div>
          )}
        </div>

        {/* Topics count */}
        <div className="w-20 shrink-0 text-right text-xs text-[#625f6c] dark:text-[#b6b2c5]">
          {group.items.length > 0 ? `${group.items.length} ${group.items.length === 1 ? "topic" : "topics"}` : "—"}
        </div>

        {/* Confidence badge */}
        <div className="w-28 shrink-0 text-right">
          {group.items.length > 0 ? (
            <span className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-semibold ${CONFIDENCE_BADGE[level]}`}>
              {pct}% {level}
            </span>
          ) : (
            <span className="text-[10px] text-[#b6b2c5]">No data</span>
          )}
        </div>

        {/* Progress bar */}
        <div className="hidden w-28 shrink-0 sm:block">
          <div className="h-1.5 overflow-hidden rounded-full bg-[#e9e8f0] dark:bg-[#20202a]">
            <div
              className={`h-full rounded-full transition-all ${group.items.length ? CONFIDENCE_BAR[level] : ""}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Revised */}
        <div className="hidden w-24 shrink-0 text-right text-[11px] text-[#888391] md:block">
          {timeAgo(group.lastRevisedAt)}
        </div>

        {/* Expand / delete */}
        <div className="flex shrink-0 items-center gap-2 pl-2">
          {confirmDelete ? (
            <div
              className="flex items-center gap-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-[10px] text-[#888391]">Delete?</span>
              <button onClick={onDelete} className="text-[10px] font-semibold text-[#E24B4A]">Yes</button>
              <button onClick={() => setConfirmDelete(false)} className="text-[10px] text-[#888391]">No</button>
            </div>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }}
              className="text-[10px] text-[#e2e0ec] opacity-0 transition hover:text-[#E24B4A] group-hover:opacity-100 dark:text-[#292735]"
              title="Delete pattern"
            >
              ✕
            </button>
          )}
          <span className="text-xs text-[#888391]">{expanded ? "▲" : "▼"}</span>
        </div>
      </div>

      {/* Expanded question list */}
      {expanded && (
        <div className="border-t border-[#f1f0f5] dark:border-[#1e1e28]">
          {group.items.length === 0 ? (
            <p className="px-5 py-3 text-[11px] text-[#888391]">
              No questions yet. Add your first question below.
            </p>
          ) : (
            group.items.map((item) => (
              <QuestionRow
                key={item.id}
                item={item}
                onToggle={() => toggleItem(item.id)}
                onUpdate={(patch) => updateItem(item.id, patch)}
                onDelete={() => deleteItem(item.id)}
              />
            ))
          )}
          <AddQuestionForm onAdd={addItem} />
        </div>
      )}
    </div>
  );
}

// ─── DSA Page ─────────────────────────────────────────────────────────────────

export function DSAPage() {
  const [category, setCategory] = useState<TopicCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingPattern, setAddingPattern] = useState(false);
  const [newPatternName, setNewPatternName] = useState("");
  const [newPatternSubtitle, setNewPatternSubtitle] = useState("");

  useEffect(() => {
    callApi<TopicCategory | null>(ApiRoutes.topicLibrary.get("dsa"))
      .then((data) => {
        if (!data) {
          setCategory(DEFAULT_DSA);
          return;
        }
        const { category: migrated, migrated: didMigrate } = migrateIfNeeded(data);
        setCategory(migrated);
        if (didMigrate) {
          // Persist the migrated structure immediately
          void callApi(ApiRoutes.topicLibrary.update("dsa"), "PUT", migrated);
        }
      })
      .catch(() => setCategory(DEFAULT_DSA))
      .finally(() => setLoading(false));
  }, []);

  async function save(updated: TopicCategory) {
    setCategory(updated);
    setSaving(true);
    try {
      const saved = await callApi<TopicCategory>(
        ApiRoutes.topicLibrary.update("dsa"),
        "PUT",
        updated,
      );
      setCategory(saved);
    } finally {
      setSaving(false);
    }
  }

  function updateGroup(groupId: string, updated: TopicGroup) {
    if (!category) return;
    save({ ...category, groups: category.groups.map((g) => (g.id === groupId ? updated : g)) });
  }

  function deleteGroup(groupId: string) {
    if (!category) return;
    save({ ...category, groups: category.groups.filter((g) => g.id !== groupId) });
  }

  function addPattern() {
    if (!newPatternName.trim() || !category) return;
    const group: TopicGroup = {
      id: crypto.randomUUID(),
      name: newPatternName.trim(),
      subtitle: newPatternSubtitle.trim() || undefined,
      items: [],
    };
    save({ ...category, groups: [...category.groups, group] });
    setNewPatternName(""); setNewPatternSubtitle(""); setAddingPattern(false);
  }

  const totalItems = category?.groups.reduce((s, g) => s + g.items.length, 0) ?? 0;
  const doneItems = category?.groups.reduce(
    (s, g) => s + g.items.filter((i) => i.completed).length, 0
  ) ?? 0;
  const overallPct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1f1f28] dark:text-white">DSA</h1>
          <p className="mt-0.5 text-xs text-[#888391]">
            {totalItems > 0
              ? `${doneItems}/${totalItems} questions solved · ${overallPct}% overall`
              : "Track your DSA practice by pattern"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saving && <span className="text-[10px] text-[#888391]">Saving…</span>}
          {!addingPattern && (
            <button
              onClick={() => setAddingPattern(true)}
              className="rounded-lg border border-[#dddbe7] px-3 py-2 text-xs font-medium text-[#625f6c] transition hover:border-[#534AB7] hover:text-[#534AB7] dark:border-[#292735] dark:text-[#b6b2c5]"
            >
              + Add Pattern
            </button>
          )}
        </div>
      </div>

      {/* Add pattern form */}
      {addingPattern && (
        <div className="rounded-xl border border-[#534AB7]/30 bg-[#faf9fc] p-4 dark:bg-[#14131b]">
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              value={newPatternName}
              onChange={(e) => setNewPatternName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addPattern(); if (e.key === "Escape") setAddingPattern(false); }}
              autoFocus
              placeholder="Pattern name (e.g. Arrays & Hashing)"
              className="min-w-0 flex-1 rounded-lg border border-[#534AB7] bg-white px-3 py-2 text-sm font-medium text-[#1f1f28] outline-none placeholder:text-[#b6b2c5] dark:bg-[#1a1a23] dark:text-white"
            />
            <input
              type="text"
              value={newPatternSubtitle}
              onChange={(e) => setNewPatternSubtitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addPattern(); if (e.key === "Escape") setAddingPattern(false); }}
              placeholder="Subtitle (optional)"
              className="min-w-0 flex-1 rounded-lg border border-[#dddbe7] bg-white px-3 py-2 text-xs text-[#1f1f28] outline-none placeholder:text-[#b6b2c5] dark:border-[#292735] dark:bg-[#1a1a23] dark:text-white"
            />
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => { setAddingPattern(false); setNewPatternName(""); setNewPatternSubtitle(""); }}
              className="rounded-lg border border-[#dddbe7] px-3 py-1.5 text-[10px] font-medium text-[#625f6c] dark:border-[#292735]"
            >
              Cancel
            </button>
            <button
              onClick={addPattern}
              disabled={!newPatternName.trim()}
              className="rounded-lg bg-[#534AB7] px-3 py-1.5 text-[10px] font-semibold text-white disabled:opacity-40"
            >
              Add Pattern
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#534AB7] border-t-transparent" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#dddbe7] bg-white dark:border-[#292735] dark:bg-[#1a1a23]">
          {/* Table header */}
          <div className="flex items-center gap-4 border-b border-[#eeedf3] bg-[#f6f5fb] px-5 py-3 dark:border-[#222130] dark:bg-[#16151e]">
            <div className="flex-1 text-[10px] font-semibold uppercase tracking-widest text-[#888391]">
              Pattern
            </div>
            <div className="w-20 shrink-0 text-right text-[10px] font-semibold uppercase tracking-widest text-[#888391]">
              Topics
            </div>
            <div className="w-28 shrink-0 text-right text-[10px] font-semibold uppercase tracking-widest text-[#888391]">
              Confidence
            </div>
            <div className="hidden w-28 shrink-0 text-[10px] font-semibold uppercase tracking-widest text-[#888391] sm:block">
              Progress
            </div>
            <div className="hidden w-24 shrink-0 text-right text-[10px] font-semibold uppercase tracking-widest text-[#888391] md:block">
              Revised
            </div>
            <div className="w-16 shrink-0" />
          </div>

          {/* Rows */}
          {!category || category.groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <p className="text-sm font-medium text-[#1f1f28] dark:text-white">No patterns yet</p>
              <p className="mt-1 text-xs text-[#888391]">Add a pattern to start tracking your DSA practice.</p>
              <button
                onClick={() => setAddingPattern(true)}
                className="mt-4 rounded-lg bg-[#534AB7] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3C3489]"
              >
                + Add Pattern
              </button>
            </div>
          ) : (
            <div className="divide-y-0">
              {category.groups.map((group) => (
                <PatternRow
                  key={group.id}
                  group={group}
                  onUpdate={(updated) => updateGroup(group.id, updated)}
                  onDelete={() => deleteGroup(group.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
