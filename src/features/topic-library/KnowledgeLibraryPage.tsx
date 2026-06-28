"use client";

import { useEffect, useState } from "react";
import { ApiRoutes, callApi } from "@/lib/api";
import type { TopicCategory, TopicGroup, TopicItem } from "@/lib/contentService";

// ─── DSA migration ────────────────────────────────────────────────────────────

const DSA_SUBTITLES: Record<string, string> = {
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

function migrateDSA(cat: TopicCategory): { category: TopicCategory; migrated: boolean } {
  const isOld =
    cat.groups.length === 1 &&
    (cat.groups[0].name === "Problem Solving Patterns" ||
      (cat.groups[0].items.length > 3 &&
        cat.groups[0].items.every((i) => i.name in DSA_SUBTITLES)));
  if (!isOld) return { category: cat, migrated: false };
  return {
    migrated: true,
    category: {
      ...cat,
      groups: cat.groups[0].items.map((item) => ({
        id: item.id,
        name: item.name,
        subtitle: DSA_SUBTITLES[item.name],
        items: [],
      })),
    },
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

type ConfidenceLevel = "Weak" | "Medium" | "Strong";

function getConfidence(items: TopicItem[]): { pct: number; level: ConfidenceLevel } {
  if (!items.length) return { pct: 0, level: "Weak" };
  const pct = Math.round((items.filter((i) => i.completed).length / items.length) * 100);
  return { pct, level: pct >= 70 ? "Strong" : pct >= 40 ? "Medium" : "Weak" };
}

function timeAgo(dateStr?: string): string {
  if (!dateStr) return "Never";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return mins <= 1 ? "Just now" : `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours === 1 ? "1h ago" : `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "1d ago";
  if (days < 7) return `${days}d ago`;
  return days < 14 ? "1w ago" : `${Math.floor(days / 7)}w ago`;
}

const DIFFICULTY_STYLE: Record<string, string> = {
  easy:   "bg-[#d4edda] text-[#1a6630] dark:bg-[#1a3d24] dark:text-[#5fcf7f]",
  medium: "bg-[#fff3cd] text-[#856404] dark:bg-[#3d2f00] dark:text-[#f0b429]",
  hard:   "bg-[#f8d7da] text-[#842029] dark:bg-[#3d0b0b] dark:text-[#f06f6f]",
};

const CONFIDENCE_BADGE: Record<ConfidenceLevel, string> = {
  Strong: "border border-[#1a6630] bg-[#d4edda] text-[#1a6630] dark:border-[#5fcf7f]/40 dark:bg-[#1a3d24] dark:text-[#5fcf7f]",
  Medium: "border border-[#856404] bg-[#fff3cd] text-[#856404] dark:border-[#f0b429]/40 dark:bg-[#3d2f00] dark:text-[#f0b429]",
  Weak:   "border border-[#842029] bg-[#f8d7da] text-[#842029] dark:border-[#f06f6f]/40 dark:bg-[#3d0b0b] dark:text-[#f06f6f]",
};

const CONFIDENCE_BAR: Record<ConfidenceLevel, string> = {
  Strong: "bg-[#28a745]",
  Medium: "bg-[#f0b429]",
  Weak:   "bg-[#E24B4A]",
};

// ─── Item row ─────────────────────────────────────────────────────────────────

function ItemRow({
  item,
  itemLabel,
  onToggle,
  onUpdate,
  onDelete,
}: {
  item: TopicItem;
  itemLabel: string;
  onToggle: () => void;
  onUpdate: (patch: Partial<TopicItem>) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    name: item.name,
    difficulty: item.difficulty ?? "",
    url: item.url ?? "",
    solutionUrl: item.solutionUrl ?? "",
    notes: item.notes ?? "",
  });

  function save() {
    if (!draft.name.trim()) return;
    onUpdate({
      name: draft.name.trim(),
      difficulty: (draft.difficulty as TopicItem["difficulty"]) || undefined,
      url: draft.url.trim() || undefined,
      solutionUrl: draft.solutionUrl.trim() || undefined,
      notes: draft.notes.trim() || undefined,
    });
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="border-t border-[#f1f0f5] bg-[#faf9fc] p-4 dark:border-[#1e1e28] dark:bg-[#14131b]">
        <p className="mb-3 text-sm font-semibold text-[#1f1f28] dark:text-white">
          Edit {itemLabel.toLowerCase()}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            type="text"
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
            autoFocus
            placeholder={`${itemLabel} title`}
            className="col-span-full rounded-lg border border-[#534AB7] bg-white px-4 py-3 text-sm text-[#1f1f28] outline-none placeholder:text-[#b6b2c5] dark:bg-[#1a1a23] dark:text-white"
          />
          <select
            value={draft.difficulty}
            onChange={(e) => setDraft((d) => ({ ...d, difficulty: e.target.value }))}
            className="rounded-lg border border-[#dddbe7] bg-white px-4 py-3 text-sm text-[#1f1f28] outline-none dark:border-[#292735] dark:bg-[#1a1a23] dark:text-white"
          >
            <option value="">No difficulty</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <input
            type="text"
            value={draft.url}
            onChange={(e) => setDraft((d) => ({ ...d, url: e.target.value }))}
            placeholder="Problem URL (LeetCode / GFG)"
            className="rounded-lg border border-[#dddbe7] bg-white px-4 py-3 text-sm text-[#1f1f28] outline-none placeholder:text-[#b6b2c5] dark:border-[#292735] dark:bg-[#1a1a23] dark:text-white"
          />
          <input
            type="text"
            value={draft.solutionUrl}
            onChange={(e) => setDraft((d) => ({ ...d, solutionUrl: e.target.value }))}
            placeholder="Solution URL (editorial / video)"
            className="rounded-lg border border-[#dddbe7] bg-white px-4 py-3 text-sm text-[#1f1f28] outline-none placeholder:text-[#b6b2c5] dark:border-[#292735] dark:bg-[#1a1a23] dark:text-white"
          />
          <input
            type="text"
            value={draft.notes}
            onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
            placeholder="Companies / notes (optional)"
            className="col-span-full rounded-lg border border-[#dddbe7] bg-white px-4 py-3 text-sm text-[#1f1f28] outline-none placeholder:text-[#b6b2c5] dark:border-[#292735] dark:bg-[#1a1a23] dark:text-white"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={() => setEditing(false)} className="flex-1 rounded-lg border border-[#dddbe7] px-4 py-2.5 text-sm font-medium text-[#625f6c] dark:border-[#292735]">
            Cancel
          </button>
          <button onClick={save} disabled={!draft.name.trim()} className="flex-1 rounded-lg bg-[#534AB7] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40">
            Save
          </button>
          <button onClick={onDelete} className="w-full rounded-lg border border-[#FDE2E2] px-4 py-2.5 text-sm font-medium text-[#E24B4A] sm:w-auto">
            Delete
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-[#f1f0f5] dark:border-[#1e1e28]">
      {/* ── Mobile layout (< md) ─────────────────────────────────────────── */}
      <div className="flex items-start gap-3 px-4 py-3.5 hover:bg-[#faf9fc] dark:hover:bg-[#14131b] md:hidden">
        <button
          onClick={onToggle}
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition ${item.completed ? "border-[#534AB7] bg-[#534AB7] text-white" : "border-[#dddbe7] hover:border-[#534AB7] dark:border-[#292735]"}`}
        >
          {item.completed && <span className="text-xs font-bold">✓</span>}
        </button>
        <div className="min-w-0 flex-1">
          <p className={`text-sm leading-snug ${item.completed ? "text-[#888391] line-through" : "text-[#1f1f28] dark:text-white"}`}>
            {item.name}
          </p>
          {item.notes && <p className="mt-0.5 text-xs text-[#888391]">{item.notes}</p>}

          {/* Row 1: difficulty badge + links — metadata only, no buttons */}
          {(item.difficulty || item.url || item.solutionUrl) && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {item.difficulty && (
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${DIFFICULTY_STYLE[item.difficulty]}`}>
                  {item.difficulty}
                </span>
              )}
              {item.url && (
                <a href={item.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs font-medium text-[#534AB7] underline">
                  Problem ↗
                </a>
              )}
              {item.solutionUrl && (
                <a href={item.solutionUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs font-medium text-[#28a745] underline">
                  Solution ↗
                </a>
              )}
            </div>
          )}

          {/* Row 2: Edit / Delete always on their own line, never wrapping */}
          <div className="mt-2 flex items-center gap-1">
            <button
              onClick={() => { setDraft({ name: item.name, difficulty: item.difficulty ?? "", url: item.url ?? "", solutionUrl: item.solutionUrl ?? "", notes: item.notes ?? "" }); setEditing(true); }}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-[#625f6c] hover:bg-[#EEEDFE] hover:text-[#534AB7]"
            >
              Edit
            </button>
            <button
              onClick={onDelete}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-[#888391] hover:bg-[#FDE2E2] hover:text-[#E24B4A]"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* ── Desktop layout (md+) ─────────────────────────────────────────── */}
      <div className="hidden items-center gap-4 px-5 py-3.5 hover:bg-[#faf9fc] dark:hover:bg-[#14131b] md:flex">
        <button
          onClick={onToggle}
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition ${item.completed ? "border-[#534AB7] bg-[#534AB7] text-white" : "border-[#dddbe7] hover:border-[#534AB7] dark:border-[#292735]"}`}
        >
          {item.completed && <span className="text-xs font-bold">✓</span>}
        </button>
        <span className={`min-w-0 flex-1 text-sm ${item.completed ? "text-[#888391] line-through" : "text-[#1f1f28] dark:text-white"}`}>
          {item.name}
        </span>
        {item.notes && (
          <span className="w-48 shrink-0 truncate text-xs text-[#888391]">{item.notes}</span>
        )}
        {item.difficulty ? (
          <span className={`w-20 shrink-0 rounded-full px-2.5 py-1 text-center text-xs font-semibold capitalize ${DIFFICULTY_STYLE[item.difficulty]}`}>
            {item.difficulty}
          </span>
        ) : (
          <span className="w-20 shrink-0" />
        )}
        <div className="flex w-28 shrink-0 items-center gap-2">
          {item.url && (
            <a href={item.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs font-medium text-[#534AB7] underline">
              Problem ↗
            </a>
          )}
          {item.solutionUrl && (
            <a href={item.solutionUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs font-medium text-[#28a745] underline">
              Solution ↗
            </a>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={() => { setDraft({ name: item.name, difficulty: item.difficulty ?? "", url: item.url ?? "", solutionUrl: item.solutionUrl ?? "", notes: item.notes ?? "" }); setEditing(true); }}
            className="rounded-md px-2.5 py-1.5 text-xs font-medium text-[#625f6c] transition hover:bg-[#EEEDFE] hover:text-[#534AB7] dark:hover:bg-[#26215C] dark:hover:text-[#CECBF6]"
          >
            Edit
          </button>
          <button onClick={onDelete} className="rounded-md px-2.5 py-1.5 text-xs font-medium text-[#888391] transition hover:bg-[#FDE2E2] hover:text-[#E24B4A]">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Add item form ────────────────────────────────────────────────────────────

function AddItemForm({ itemLabel, onAdd }: { itemLabel: string; onAdd: (item: Omit<TopicItem, "id" | "completed">) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [url, setUrl] = useState("");
  const [solutionUrl, setSolutionUrl] = useState("");
  const [notes, setNotes] = useState("");

  function submit() {
    if (!name.trim()) return;
    onAdd({
      name: name.trim(),
      difficulty: (difficulty as TopicItem["difficulty"]) || undefined,
      url: url.trim() || undefined,
      solutionUrl: solutionUrl.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    setName(""); setDifficulty(""); setUrl(""); setSolutionUrl(""); setNotes("");
    setOpen(false);
  }

  if (!open) {
    return (
      <div className="border-t border-[#f1f0f5] px-4 py-3.5 dark:border-[#1e1e28] md:px-5">
        <button onClick={() => setOpen(true)} className="flex w-full items-center gap-2 text-sm font-medium text-[#888391] transition hover:text-[#534AB7]">
          <span className="text-base leading-none">+</span> Add {itemLabel.toLowerCase()}
        </button>
      </div>
    );
  }

  return (
    <div className="border-t border-[#534AB7]/20 bg-[#faf9fc] p-4 dark:border-[#534AB7]/20 dark:bg-[#14131b] md:p-5">
      <p className="mb-3 text-sm font-semibold text-[#1f1f28] dark:text-white">Add {itemLabel.toLowerCase()}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); if (e.key === "Escape") setOpen(false); }}
          autoFocus
          placeholder={`${itemLabel} title`}
          className="col-span-full rounded-lg border border-[#534AB7] bg-white px-4 py-3 text-sm text-[#1f1f28] outline-none placeholder:text-[#b6b2c5] dark:bg-[#1a1a23] dark:text-white"
        />
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="rounded-lg border border-[#dddbe7] bg-white px-4 py-3 text-sm text-[#1f1f28] outline-none dark:border-[#292735] dark:bg-[#1a1a23] dark:text-white"
        >
          <option value="">No difficulty</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Problem URL (LeetCode / GFG)"
          className="rounded-lg border border-[#dddbe7] bg-white px-4 py-3 text-sm text-[#1f1f28] outline-none placeholder:text-[#b6b2c5] dark:border-[#292735] dark:bg-[#1a1a23] dark:text-white"
        />
        <input
          type="text"
          value={solutionUrl}
          onChange={(e) => setSolutionUrl(e.target.value)}
          placeholder="Solution URL (editorial / video)"
          className="rounded-lg border border-[#dddbe7] bg-white px-4 py-3 text-sm text-[#1f1f28] outline-none placeholder:text-[#b6b2c5] dark:border-[#292735] dark:bg-[#1a1a23] dark:text-white"
        />
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Companies / notes (optional)"
          className="col-span-full rounded-lg border border-[#dddbe7] bg-white px-4 py-3 text-sm text-[#1f1f28] outline-none placeholder:text-[#b6b2c5] dark:border-[#292735] dark:bg-[#1a1a23] dark:text-white"
        />
      </div>
      <div className="mt-3 flex gap-2">
        <button onClick={() => setOpen(false)} className="flex-1 rounded-lg border border-[#dddbe7] px-4 py-2.5 text-sm font-medium text-[#625f6c] dark:border-[#292735]">
          Cancel
        </button>
        <button onClick={submit} disabled={!name.trim()} className="flex-1 rounded-lg bg-[#534AB7] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40">
          Add {itemLabel}
        </button>
      </div>
    </div>
  );
}

// ─── Group row ────────────────────────────────────────────────────────────────

function GroupRow({
  group,
  groupLabel,
  itemLabel,
  onUpdate,
  onDelete,
}: {
  group: TopicGroup;
  groupLabel: string;
  itemLabel: string;
  onUpdate: (updated: TopicGroup) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(group.name);
  const [subtitleDraft, setSubtitleDraft] = useState(group.subtitle ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { pct, level } = getConfidence(group.items);
  const done = group.items.filter((i) => i.completed).length;

  function saveNameEdit() {
    if (!nameDraft.trim()) return;
    onUpdate({ ...group, name: nameDraft.trim(), subtitle: subtitleDraft.trim() || undefined });
    setEditingName(false);
  }

  function startEdit(e: React.MouseEvent) {
    e.stopPropagation();
    setNameDraft(group.name);
    setSubtitleDraft(group.subtitle ?? "");
    setEditingName(true);
    setExpanded(true);
  }

  function toggleItem(itemId: string) {
    const now = new Date().toISOString();
    onUpdate({
      ...group,
      lastRevisedAt: now,
      items: group.items.map((i) =>
        i.id === itemId ? { ...i, completed: !i.completed, completedAt: !i.completed ? now : undefined } : i,
      ),
    });
  }

  function updateItem(itemId: string, patch: Partial<TopicItem>) {
    onUpdate({ ...group, items: group.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)) });
  }

  function deleteItem(itemId: string) {
    onUpdate({ ...group, items: group.items.filter((i) => i.id !== itemId) });
  }

  function addItem(data: Omit<TopicItem, "id" | "completed">) {
    const now = new Date().toISOString();
    onUpdate({ ...group, lastRevisedAt: now, items: [...group.items, { ...data, id: crypto.randomUUID(), completed: false }] });
  }

  return (
    <div className="border-b border-[#eeedf3] last:border-b-0 dark:border-[#222130]">

      {/* ── Inline name editor (shared for both breakpoints) ──────────────── */}
      {editingName ? (
        <div className="p-4 md:p-5" onClick={(e) => e.stopPropagation()}>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") saveNameEdit(); if (e.key === "Escape") setEditingName(false); }}
              autoFocus
              placeholder={`${groupLabel} name`}
              className="col-span-full rounded-lg border border-[#534AB7] bg-white px-4 py-3 text-sm font-semibold text-[#1f1f28] outline-none dark:bg-[#1a1a23] dark:text-white"
            />
            <input
              type="text"
              value={subtitleDraft}
              onChange={(e) => setSubtitleDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") saveNameEdit(); if (e.key === "Escape") setEditingName(false); }}
              placeholder="Subtitle (optional)"
              className="col-span-full rounded-lg border border-[#dddbe7] bg-white px-4 py-2.5 text-sm text-[#625f6c] outline-none placeholder:text-[#b6b2c5] dark:border-[#292735] dark:bg-[#1a1a23] dark:text-[#b6b2c5]"
            />
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={() => setEditingName(false)} className="flex-1 rounded-lg border border-[#dddbe7] px-4 py-2.5 text-sm font-medium text-[#625f6c] dark:border-[#292735]">
              Cancel
            </button>
            <button onClick={saveNameEdit} className="flex-1 rounded-lg bg-[#534AB7] px-4 py-2.5 text-sm font-semibold text-white">
              Save
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* ── Mobile header (< md) ──────────────────────────────────────── */}
          <div
            className="cursor-pointer px-4 py-4 hover:bg-[#f9f9fc] dark:hover:bg-[#16151e] md:hidden"
            onClick={() => setExpanded((v) => !v)}
          >
            {/* Row 1: name + chevron */}
            <div className="flex items-center justify-between gap-2">
              <p className="text-base font-semibold text-[#1f1f28] dark:text-white">{group.name}</p>
              <span className="shrink-0 text-xs text-[#888391]">{expanded ? "▲" : "▼"}</span>
            </div>

            {/* Row 2: subtitle */}
            {group.subtitle && (
              <p className="mt-1 text-sm text-[#888391]">{group.subtitle}</p>
            )}

            {/* Row 3: badges */}
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              {group.items.length > 0 ? (
                <>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${CONFIDENCE_BADGE[level]}`}>
                    {pct}% {level}
                  </span>
                  <span className="text-xs text-[#888391]">
                    {done}/{group.items.length} {itemLabel.toLowerCase()}s
                  </span>
                  {group.lastRevisedAt && (
                    <span className="text-xs text-[#b6b2c5]">· {timeAgo(group.lastRevisedAt)}</span>
                  )}
                </>
              ) : (
                <span className="text-xs text-[#b6b2c5]">No {itemLabel.toLowerCase()}s yet</span>
              )}
            </div>

            {/* Row 4: progress bar */}
            {group.items.length > 0 && (
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e9e8f0] dark:bg-[#20202a]">
                <div className={`h-full rounded-full transition-all ${CONFIDENCE_BAR[level]}`} style={{ width: `${pct}%` }} />
              </div>
            )}

            {/* Row 5: Edit / Delete — own row, stops expand toggle */}
            <div className="mt-3 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              {!confirmDelete ? (
                <>
                  <button
                    onClick={startEdit}
                    className="rounded-md px-3 py-1.5 text-xs font-medium text-[#625f6c] hover:bg-[#EEEDFE] hover:text-[#534AB7]"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }}
                    className="rounded-md px-3 py-1.5 text-xs font-medium text-[#888391] hover:bg-[#FDE2E2] hover:text-[#E24B4A]"
                  >
                    Delete
                  </button>
                </>
              ) : (
                <>
                  <span className="mr-1 text-xs text-[#888391]">Delete this?</span>
                  <button onClick={onDelete} className="rounded-md bg-[#E24B4A] px-3 py-1.5 text-xs font-semibold text-white">Yes</button>
                  <button onClick={() => setConfirmDelete(false)} className="rounded-md px-3 py-1.5 text-xs text-[#888391]">Cancel</button>
                </>
              )}
            </div>
          </div>

          {/* ── Desktop table row (md+) ───────────────────────────────────── */}
          <div
            className="hidden cursor-pointer items-center gap-4 px-5 py-4 hover:bg-[#f9f9fc] dark:hover:bg-[#16151e] md:flex"
            onClick={() => setExpanded((v) => !v)}
          >
            {/* Pattern name + subtitle */}
            <div className="group/name min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold text-[#1f1f28] dark:text-white">{group.name}</p>
              </div>
              {group.subtitle && (
                <p className="truncate text-xs text-[#888391]">{group.subtitle}</p>
              )}
            </div>

            {/* Topics count */}
            <div className="w-20 shrink-0 text-right text-sm text-[#625f6c] dark:text-[#b6b2c5]">
              {group.items.length > 0 ? `${group.items.length}` : "—"}
            </div>

            {/* Confidence badge */}
            <div className="w-32 shrink-0 text-center">
              {group.items.length > 0 ? (
                <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${CONFIDENCE_BADGE[level]}`}>
                  {pct}% {level}
                </span>
              ) : (
                <span className="text-xs text-[#b6b2c5]">No data</span>
              )}
            </div>

            {/* Progress bar */}
            <div className="w-32 shrink-0">
              <div className="h-1.5 overflow-hidden rounded-full bg-[#e9e8f0] dark:bg-[#20202a]">
                <div
                  className={`h-full rounded-full transition-all ${group.items.length ? CONFIDENCE_BAR[level] : ""}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            {/* Revised */}
            <div className="w-24 shrink-0 text-right text-xs text-[#888391]">
              {timeAgo(group.lastRevisedAt)}
            </div>

            {/* Actions */}
            <div className="flex w-32 shrink-0 items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
              {confirmDelete ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-[#888391]">Sure?</span>
                  <button onClick={onDelete} className="rounded bg-[#E24B4A] px-2 py-1 text-xs font-semibold text-white">Yes</button>
                  <button onClick={() => setConfirmDelete(false)} className="text-xs text-[#888391]">No</button>
                </div>
              ) : (
                <>
                  <button onClick={startEdit} className="rounded-md px-2.5 py-1.5 text-xs font-medium text-[#625f6c] transition hover:bg-[#EEEDFE] hover:text-[#534AB7] dark:hover:bg-[#26215C] dark:hover:text-[#CECBF6]">
                    Edit
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }} className="rounded-md px-2.5 py-1.5 text-xs font-medium text-[#888391] transition hover:bg-[#FDE2E2] hover:text-[#E24B4A]">
                    Delete
                  </button>
                </>
              )}
              <span className="ml-1 text-xs text-[#888391]">{expanded ? "▲" : "▼"}</span>
            </div>
          </div>
        </>
      )}

      {/* ── Expanded item list (shared) ───────────────────────────────────── */}
      {expanded && !editingName && (
        <div className="border-t border-[#f1f0f5] dark:border-[#1e1e28]">
          {group.items.length === 0 ? (
            <p className="px-4 py-4 text-sm text-[#888391] md:px-5">
              No {itemLabel.toLowerCase()}s yet — add one below.
            </p>
          ) : (
            group.items.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                itemLabel={itemLabel}
                onToggle={() => toggleItem(item.id)}
                onUpdate={(patch) => updateItem(item.id, patch)}
                onDelete={() => deleteItem(item.id)}
              />
            ))
          )}
          <AddItemForm itemLabel={itemLabel} onAdd={addItem} />
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function KnowledgeLibraryPage({
  categoryId,
  title,
  defaultCategory,
  groupLabel = "Pattern",
  itemLabel = "Question",
}: {
  categoryId: string;
  title: string;
  defaultCategory: TopicCategory;
  groupLabel?: string;
  itemLabel?: string;
}) {
  const [category, setCategory] = useState<TopicCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingGroup, setAddingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupSubtitle, setNewGroupSubtitle] = useState("");

  useEffect(() => {
    callApi<TopicCategory | null>(ApiRoutes.topicLibrary.get(categoryId))
      .then((data) => {
        if (!data) { setCategory(defaultCategory); return; }
        if (categoryId === "dsa") {
          const { category: migrated, migrated: didMigrate } = migrateDSA(data);
          setCategory(migrated);
          if (didMigrate) void callApi(ApiRoutes.topicLibrary.update(categoryId), "PUT", migrated);
        } else {
          setCategory(data);
        }
      })
      .catch(() => setCategory(defaultCategory))
      .finally(() => setLoading(false));
  }, [categoryId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function persist(updated: TopicCategory) {
    setCategory(updated);
    setSaving(true);
    try {
      const saved = await callApi<TopicCategory>(ApiRoutes.topicLibrary.update(categoryId), "PUT", updated);
      setCategory(saved);
    } finally {
      setSaving(false);
    }
  }

  function updateGroup(groupId: string, updated: TopicGroup) {
    if (!category) return;
    persist({ ...category, groups: category.groups.map((g) => (g.id === groupId ? updated : g)) });
  }

  function deleteGroup(groupId: string) {
    if (!category) return;
    persist({ ...category, groups: category.groups.filter((g) => g.id !== groupId) });
  }

  function addGroup() {
    if (!newGroupName.trim() || !category) return;
    persist({
      ...category,
      groups: [...category.groups, { id: crypto.randomUUID(), name: newGroupName.trim(), subtitle: newGroupSubtitle.trim() || undefined, items: [] }],
    });
    setNewGroupName(""); setNewGroupSubtitle(""); setAddingGroup(false);
  }

  const totalItems = category?.groups.reduce((s, g) => s + g.items.length, 0) ?? 0;
  const doneItems  = category?.groups.reduce((s, g) => s + g.items.filter((i) => i.completed).length, 0) ?? 0;
  const overallPct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-[#1f1f28] dark:text-white">{title}</h1>
          <p className="mt-0.5 text-sm text-[#888391]">
            {totalItems > 0
              ? `${doneItems}/${totalItems} completed · ${overallPct}%`
              : `Track your ${title} prep by ${groupLabel.toLowerCase()}`}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {saving && <span className="text-xs text-[#888391]">Saving…</span>}
          {!addingGroup && (
            <button
              onClick={() => setAddingGroup(true)}
              className="rounded-lg bg-[#534AB7] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3C3489]"
            >
              + Add {groupLabel}
            </button>
          )}
        </div>
      </div>

      {/* Add group form */}
      {addingGroup && (
        <div className="rounded-xl border border-[#534AB7]/30 bg-[#faf9fc] p-4 dark:bg-[#14131b] md:p-5">
          <p className="mb-3 text-sm font-semibold text-[#1f1f28] dark:text-white">New {groupLabel}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addGroup(); if (e.key === "Escape") setAddingGroup(false); }}
              autoFocus
              placeholder={`${groupLabel} name`}
              className="col-span-full rounded-lg border border-[#534AB7] bg-white px-4 py-3 text-sm font-medium text-[#1f1f28] outline-none placeholder:text-[#b6b2c5] dark:bg-[#1a1a23] dark:text-white"
            />
            <input
              type="text"
              value={newGroupSubtitle}
              onChange={(e) => setNewGroupSubtitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addGroup(); if (e.key === "Escape") setAddingGroup(false); }}
              placeholder="Subtitle / description (optional)"
              className="col-span-full rounded-lg border border-[#dddbe7] bg-white px-4 py-3 text-sm text-[#1f1f28] outline-none placeholder:text-[#b6b2c5] dark:border-[#292735] dark:bg-[#1a1a23] dark:text-white"
            />
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={() => { setAddingGroup(false); setNewGroupName(""); setNewGroupSubtitle(""); }} className="flex-1 rounded-lg border border-[#dddbe7] px-4 py-2.5 text-sm font-medium text-[#625f6c] dark:border-[#292735]">
              Cancel
            </button>
            <button onClick={addGroup} disabled={!newGroupName.trim()} className="flex-1 rounded-lg bg-[#534AB7] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40">
              Add {groupLabel}
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#534AB7] border-t-transparent" />
        </div>
      ) : !category || category.groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#dddbe7] py-16 text-center dark:border-[#292735]">
          <p className="text-base font-semibold text-[#1f1f28] dark:text-white">No {groupLabel.toLowerCase()}s yet</p>
          <p className="mt-1 text-sm text-[#888391]">Add a {groupLabel.toLowerCase()} to start tracking your {title} prep.</p>
          <button onClick={() => setAddingGroup(true)} className="mt-4 rounded-lg bg-[#534AB7] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#3C3489]">
            + Add {groupLabel}
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#dddbe7] bg-white dark:border-[#292735] dark:bg-[#1a1a23]">
          {/* Desktop table header (hidden on mobile) */}
          <div className="hidden items-center gap-4 border-b border-[#eeedf3] bg-[#f6f5fb] px-5 py-3 dark:border-[#222130] dark:bg-[#16151e] md:flex">
            <div className="flex-1 text-xs font-semibold uppercase tracking-widest text-[#888391]">{groupLabel}</div>
            <div className="w-20 shrink-0 text-right text-xs font-semibold uppercase tracking-widest text-[#888391]">Topics</div>
            <div className="w-32 shrink-0 text-center text-xs font-semibold uppercase tracking-widest text-[#888391]">Confidence</div>
            <div className="w-32 shrink-0 text-xs font-semibold uppercase tracking-widest text-[#888391]">Progress</div>
            <div className="w-24 shrink-0 text-right text-xs font-semibold uppercase tracking-widest text-[#888391]">Revised</div>
            <div className="w-32 shrink-0" />
          </div>

          {category.groups.map((group) => (
            <GroupRow
              key={group.id}
              group={group}
              groupLabel={groupLabel}
              itemLabel={itemLabel}
              onUpdate={(updated) => updateGroup(group.id, updated)}
              onDelete={() => deleteGroup(group.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
