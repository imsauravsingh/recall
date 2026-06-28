'use client';

import { useEffect, useState } from "react";
import Badge from "../ui/Badge";
import { Topic } from "../../lib/types";
import { noteService } from "./noteService";

interface TopicCardProps {
  topic: Topic;
  queued?: boolean;
  onEdit: (topic: Topic) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string, archived: boolean) => void;
  onToggleQueue?: (topic: Topic) => void;
}

const TopicCard = ({
  topic,
  queued,
  onEdit,
  onDelete,
  onArchive,
  onToggleQueue,
}: TopicCardProps) => {
  const [showNotes, setShowNotes] = useState(false);
  const [personalNotes, setPersonalNotes] = useState("");
  const [interviewQuestions, setInterviewQuestions] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadNotes() {
      const note = await noteService.getNote(topic.id);
      if (!active) {
        return;
      }

      setPersonalNotes(note?.personalNotes ?? "");
      setInterviewQuestions(note?.interviewQuestions ?? "");
      setConfidence(note?.confidence ?? 0);
    }

    void loadNotes();

    return () => {
      active = false;
    };
  }, [topic.id]);

  async function handleSaveNotes() {
    setSaving(true);
    await noteService.saveNote(topic.id, {
      personalNotes,
      interviewQuestions,
      confidence,
    });
    setSaving(false);
  }

  return (
    <article className="rounded-lg border border-[#dddbe7] bg-white p-4 shadow-soft dark:border-[#292735] dark:bg-[#1a1a23]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap gap-2">
            <Badge label={topic.category} />
            {topic.archived && <Badge label="Archived" />}
          </div>
          <h3 className="mt-3 text-base font-semibold">{topic.title}</h3>
          <p className="mt-1 text-sm leading-6 text-[#625f6c] dark:text-[#b6b2c5]">
            {topic.description || "No description added yet."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!topic.archived && onToggleQueue ? (
            <button
              type="button"
              onClick={() => onToggleQueue(topic)}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${queued ? "bg-[#EAF3DE] text-[#0F6E56]" : "border border-[#dddbe7] bg-white text-[#625f6c] hover:bg-[#f1f0f5] dark:border-[#292735] dark:bg-[#1a1a23] dark:text-[#b6b2c5] dark:hover:bg-[#20202a]"}`}
            >
              {queued ? "In recall queue" : "Add to queue"}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => onArchive(topic.id, !topic.archived)}
            className="rounded-lg border border-[#dddbe7] px-3 py-2 text-xs font-medium text-[#625f6c] transition hover:bg-[#f1f0f5] dark:border-[#292735] dark:text-[#b6b2c5] dark:hover:bg-[#20202a]"
          >
            {topic.archived ? "Restore" : "Archive"}
          </button>
          <button
            type="button"
            onClick={() => setShowNotes((value) => !value)}
            className="rounded-lg border border-[#dddbe7] px-3 py-2 text-xs font-medium text-[#625f6c] transition hover:bg-[#f1f0f5] dark:border-[#292735] dark:text-[#b6b2c5] dark:hover:bg-[#20202a]"
          >
            {showNotes ? "Hide notes" : "Notes"}
          </button>
          <button
            type="button"
            onClick={() => onEdit(topic)}
            className="rounded-lg border border-[#AFA9EC] bg-[#EEEDFE] px-3 py-2 text-xs font-semibold text-[#3C3489] transition hover:bg-[#CECBF6]"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(topic.id)}
            className="rounded-lg border border-[#F09595] bg-[#FCEBEB] px-3 py-2 text-xs font-semibold text-[#A32D2D] transition hover:bg-[#F7D5D5]"
          >
            Delete
          </button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#888391]">
        <span>{topic.subcategory || "General"}</span>
        <span>{new Date(topic.updatedAt).toLocaleDateString()}</span>
        <span>{topic.tags.length ? topic.tags.join(", ") : "No tags"}</span>
      </div>

      {showNotes ? (
        <div className="mt-4 rounded-lg border border-[#eceaf2] bg-[#f8f7fb] p-3 dark:border-[#292735] dark:bg-[#20202a]">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <label className="space-y-2 text-sm">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#888391]">
                Confidence
              </span>
              <input
                type="range"
                min="0"
                max="100"
                value={confidence}
                onChange={(event) => setConfidence(Number(event.target.value))}
                className="w-full"
              />
              <p className="text-xs text-[#625f6c] dark:text-[#b6b2c5]">
                Current confidence: {confidence}%
              </p>
            </label>
            <button
              type="button"
              onClick={() => void handleSaveNotes()}
              className="rounded-lg bg-[#534AB7] px-3 py-2 text-xs font-semibold text-white"
            >
              {saving ? "Saving..." : "Save note"}
            </button>
          </div>

          <label className="mt-3 block space-y-2 text-sm">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#888391]">
              Personal notes
            </span>
            <textarea
              rows={3}
              value={personalNotes}
              onChange={(event) => setPersonalNotes(event.target.value)}
              placeholder="Capture your mental model, intuition, or weak spots."
              className="w-full rounded-lg border border-[#dddbe7] bg-white px-3 py-2 text-sm dark:border-[#292735] dark:bg-[#1a1a23]"
            />
          </label>

          <label className="mt-3 block space-y-2 text-sm">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#888391]">
              Interview questions
            </span>
            <textarea
              rows={2}
              value={interviewQuestions}
              onChange={(event) => setInterviewQuestions(event.target.value)}
              placeholder="Questions to rehearse or patterns to mention."
              className="w-full rounded-lg border border-[#dddbe7] bg-white px-3 py-2 text-sm dark:border-[#292735] dark:bg-[#1a1a23]"
            />
          </label>
        </div>
      ) : null}
    </article>
  );
};

export default TopicCard;
