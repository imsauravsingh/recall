import { db } from "../../lib/db";
import type { Note } from "../../lib/types";

export const noteService = {
  async getNote(topicId: string) {
    return db.notes.get(topicId);
  },

  async saveNote(topicId: string, updates: Partial<Note>) {
    const existing = await db.notes.get(topicId);
    const now = new Date().toISOString();
    const note: Note = {
      id: existing?.id ?? topicId,
      topicId,
      mentalModel: existing?.mentalModel ?? "",
      executionFlow: existing?.executionFlow ?? "",
      edgeCases: existing?.edgeCases ?? "",
      tradeOffs: existing?.tradeOffs ?? "",
      commonMistakes: existing?.commonMistakes ?? "",
      interviewQuestions: existing?.interviewQuestions ?? "",
      examples: existing?.examples ?? "",
      personalNotes: existing?.personalNotes ?? "",
      confidence: existing?.confidence ?? 0,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      ...updates,
    };

    await db.notes.put(note);
    return note;
  },
};
