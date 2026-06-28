"use client";

import { useState } from "react";
import type { TopicCategory, TopicGroup, TopicItem } from "@/lib/contentService";

// ─── Item row ─────────────────────────────────────────────────────────────────

function ItemRow({
  item,
  onToggle,
  onRename,
  onNotesChange,
  onDelete,
}: {
  item: TopicItem;
  onToggle: () => void;
  onRename: (name: string) => void;
  onNotesChange: (notes: string) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(item.name);
  const [draftNotes, setDraftNotes] = useState(item.notes ?? "");
  const [showNotes, setShowNotes] = useState(false);

  function saveEdit() {
    if (!draftName.trim()) return;
    onRename(draftName.trim());
    onNotesChange(draftNotes.trim());
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="rounded-lg border border-[#534AB7]/40 bg-[#f9f9fc] p-3 dark:bg-[#14131b]">
        <input
          type="text"
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditing(false); }}
          autoFocus
          className="w-full rounded-lg border border-[#dddbe7] bg-white px-3 py-1.5 text-xs font-medium text-[#1f1f28] outline-none focus:border-[#534AB7] dark:border-[#292735] dark:bg-[#1a1a23] dark:text-white"
          placeholder="Item name"
        />
        <input
          type="text"
          value={draftNotes}
          onChange={(e) => setDraftNotes(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-[#dddbe7] bg-white px-3 py-1.5 text-xs text-[#1f1f28] outline-none focus:border-[#534AB7] dark:border-[#292735] dark:bg-[#1a1a23] dark:text-white"
          placeholder="Notes (optional)"
        />
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => setEditing(false)}
            className="rounded-lg border border-[#dddbe7] px-3 py-1 text-[10px] font-medium text-[#625f6c] dark:border-[#292735]"
          >
            Cancel
          </button>
          <button
            onClick={saveEdit}
            disabled={!draftName.trim()}
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
    <div className="group">
      <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition hover:bg-[#f6f6f8] dark:hover:bg-[#20202a]">
        <button
          onClick={onToggle}
          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${
            item.completed
              ? "border-[#534AB7] bg-[#534AB7] text-white"
              : "border-[#dddbe7] hover:border-[#534AB7] dark:border-[#292735]"
          }`}
        >
          {item.completed && <span className="text-[9px] font-bold">✓</span>}
        </button>

        <span
          className={`flex-1 text-xs ${
            item.completed
              ? "line-through text-[#888391]"
              : "text-[#1f1f28] dark:text-white"
          }`}
        >
          {item.name}
        </span>

        <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
          {item.notes && (
            <button
              onClick={() => setShowNotes((v) => !v)}
              className="text-[10px] text-[#888391] hover:text-[#534AB7]"
              title="Toggle notes"
            >
              ✎
            </button>
          )}
          <button
            onClick={() => {
              setDraftName(item.name);
              setDraftNotes(item.notes ?? "");
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
            title="Delete"
          >
            ✕
          </button>
        </div>
      </div>

      {showNotes && item.notes && (
        <p className="ml-8 mt-0.5 text-[10px] text-[#888391]">{item.notes}</p>
      )}
    </div>
  );
}

// ─── Group card ───────────────────────────────────────────────────────────────

function GroupCard({
  group,
  onUpdate,
  onDelete,
}: {
  group: TopicGroup;
  onUpdate: (updated: TopicGroup) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(group.name);
  const [addingItem, setAddingItem] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const done = group.items.filter((i) => i.completed).length;
  const total = group.items.length;

  function saveGroupName() {
    if (!nameDraft.trim()) return;
    onUpdate({ ...group, name: nameDraft.trim() });
    setEditingName(false);
  }

  function addItem() {
    if (!newItemName.trim()) return;
    const item: TopicItem = {
      id: crypto.randomUUID(),
      name: newItemName.trim(),
      completed: false,
    };
    onUpdate({ ...group, items: [...group.items, item] });
    setNewItemName("");
    setAddingItem(false);
  }

  function updateItem(itemId: string, patch: Partial<TopicItem>) {
    const now = new Date().toISOString();
    onUpdate({
      ...group,
      items: group.items.map((i) =>
        i.id === itemId
          ? {
              ...i,
              ...patch,
              completedAt:
                patch.completed !== undefined
                  ? patch.completed
                    ? now
                    : undefined
                  : i.completedAt,
            }
          : i,
      ),
    });
  }

  function deleteItem(itemId: string) {
    onUpdate({ ...group, items: group.items.filter((i) => i.id !== itemId) });
  }

  return (
    <div className="rounded-xl border border-[#dddbe7] bg-white dark:border-[#292735] dark:bg-[#1a1a23]">
      {/* Group header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex flex-1 items-center gap-3 text-left"
        >
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#EEEDFE] text-[10px] font-bold text-[#534AB7] dark:bg-[#26215C] dark:text-[#CECBF6]">
            {done === total && total > 0 ? "✓" : done}
          </div>

          {editingName ? (
            <input
              type="text"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveGroupName();
                if (e.key === "Escape") setEditingName(false);
              }}
              onClick={(e) => e.stopPropagation()}
              autoFocus
              className="flex-1 rounded border border-[#534AB7] bg-[#f6f6f8] px-2 py-0.5 text-xs font-semibold text-[#1f1f28] outline-none dark:bg-[#121218] dark:text-white"
            />
          ) : (
            <span className="flex-1 text-sm font-semibold text-[#1f1f28] dark:text-white">
              {group.name}
            </span>
          )}

          <span className="text-[10px] text-[#888391]">
            {done}/{total}
          </span>
        </button>

        <div className="flex items-center gap-2">
          {editingName ? (
            <>
              <button
                onClick={() => setEditingName(false)}
                className="text-[10px] text-[#888391]"
              >
                Cancel
              </button>
              <button
                onClick={saveGroupName}
                className="rounded bg-[#534AB7] px-2 py-0.5 text-[10px] font-semibold text-white"
              >
                Save
              </button>
            </>
          ) : (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setNameDraft(group.name);
                  setEditingName(true);
                  setExpanded(true);
                }}
                className="text-[11px] text-[#888391] hover:text-[#534AB7]"
                title="Rename group"
              >
                ✎
              </button>
              {confirmDelete ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-[#888391]">Sure?</span>
                  <button
                    onClick={onDelete}
                    className="text-[10px] font-semibold text-[#E24B4A]"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="text-[10px] text-[#888391]"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDelete(true);
                  }}
                  className="text-[11px] text-[#dddbe7] hover:text-[#E24B4A] dark:text-[#292735]"
                  title="Delete group"
                >
                  ✕
                </button>
              )}
            </>
          )}
          <span className="text-[10px] text-[#888391]">
            {expanded ? "▲" : "▼"}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="h-0.5 w-full bg-[#f1f0f5] dark:bg-[#20202a]">
          <div
            className="h-full bg-[#534AB7] transition-all"
            style={{ width: `${Math.round((done / total) * 100)}%` }}
          />
        </div>
      )}

      {/* Items */}
      {expanded && (
        <div className="px-3 pb-3 pt-2">
          <div className="space-y-0.5">
            {group.items.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                onToggle={() => updateItem(item.id, { completed: !item.completed })}
                onRename={(name) => updateItem(item.id, { name })}
                onNotesChange={(notes) => updateItem(item.id, { notes: notes || undefined })}
                onDelete={() => deleteItem(item.id)}
              />
            ))}
          </div>

          {/* Add item inline */}
          {addingItem ? (
            <div className="mt-2 flex items-center gap-2">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addItem();
                  if (e.key === "Escape") { setAddingItem(false); setNewItemName(""); }
                }}
                autoFocus
                placeholder="Item name…"
                className="flex-1 rounded-lg border border-[#534AB7] bg-[#f6f6f8] px-3 py-1.5 text-xs text-[#1f1f28] outline-none dark:bg-[#121218] dark:text-white"
              />
              <button
                onClick={addItem}
                disabled={!newItemName.trim()}
                className="rounded-lg bg-[#534AB7] px-3 py-1.5 text-[10px] font-semibold text-white disabled:opacity-40"
              >
                Add
              </button>
              <button
                onClick={() => { setAddingItem(false); setNewItemName(""); }}
                className="text-[10px] text-[#888391]"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAddingItem(true)}
              className="mt-2 flex w-full items-center gap-1.5 rounded-lg border border-dashed border-[#dddbe7] py-1.5 px-3 text-[10px] font-medium text-[#888391] transition hover:border-[#534AB7] hover:text-[#534AB7] dark:border-[#292735]"
            >
              + Add item
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main tab ─────────────────────────────────────────────────────────────────

export function TopicLibraryTab({
  category,
  onUpdate,
}: {
  category: TopicCategory;
  onUpdate: (updated: TopicCategory) => Promise<void>;
}) {
  const [addingGroup, setAddingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  const totalItems = category.groups.reduce((s, g) => s + g.items.length, 0);
  const doneItems = category.groups.reduce(
    (s, g) => s + g.items.filter((i) => i.completed).length,
    0,
  );
  const pct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  function saveCategory(updated: TopicCategory) {
    void onUpdate(updated);
  }

  function updateGroup(groupId: string, updatedGroup: TopicGroup) {
    saveCategory({
      ...category,
      groups: category.groups.map((g) => (g.id === groupId ? updatedGroup : g)),
    });
  }

  function deleteGroup(groupId: string) {
    saveCategory({
      ...category,
      groups: category.groups.filter((g) => g.id !== groupId),
    });
  }

  function addGroup() {
    if (!newGroupName.trim()) return;
    const group: TopicGroup = {
      id: crypto.randomUUID(),
      name: newGroupName.trim(),
      items: [],
    };
    saveCategory({ ...category, groups: [...category.groups, group] });
    setNewGroupName("");
    setAddingGroup(false);
  }

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-4 rounded-xl border border-[#dddbe7] bg-white p-4 dark:border-[#292735] dark:bg-[#1a1a23]">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-[#625f6c] dark:text-[#b6b2c5]">
              {doneItems}/{totalItems} topics completed
            </p>
            <p className="text-xs font-semibold text-[#534AB7] dark:text-[#CECBF6]">
              {pct}%
            </p>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e9e8f6] dark:bg-[#20202a]">
            <div
              className="h-full rounded-full bg-[#534AB7] transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {addingGroup ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addGroup();
                if (e.key === "Escape") { setAddingGroup(false); setNewGroupName(""); }
              }}
              autoFocus
              placeholder="Group name…"
              className="w-40 rounded-lg border border-[#534AB7] bg-[#f6f6f8] px-3 py-1.5 text-xs text-[#1f1f28] outline-none dark:bg-[#121218] dark:text-white"
            />
            <button
              onClick={addGroup}
              disabled={!newGroupName.trim()}
              className="rounded-lg bg-[#534AB7] px-3 py-1.5 text-[10px] font-semibold text-white disabled:opacity-40"
            >
              Add
            </button>
            <button
              onClick={() => { setAddingGroup(false); setNewGroupName(""); }}
              className="text-[10px] text-[#888391]"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAddingGroup(true)}
            className="shrink-0 rounded-lg border border-[#dddbe7] px-3 py-1.5 text-xs font-medium text-[#625f6c] transition hover:border-[#534AB7] hover:text-[#534AB7] dark:border-[#292735] dark:text-[#b6b2c5]"
          >
            + Add Group
          </button>
        )}
      </div>

      {/* Groups */}
      {category.groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#dddbe7] py-12 text-center dark:border-[#292735]">
          <p className="text-sm font-medium text-[#1f1f28] dark:text-white">
            No groups yet
          </p>
          <p className="mt-1 text-xs text-[#888391]">
            Add a group to start organizing this topic area.
          </p>
          <button
            onClick={() => setAddingGroup(true)}
            className="mt-4 rounded-lg bg-[#534AB7] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3C3489]"
          >
            + Add Group
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {category.groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onUpdate={(updated) => updateGroup(group.id, updated)}
              onDelete={() => deleteGroup(group.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
