import { db } from "../../lib/db";
import { RecallSession } from "../../lib/types";

export const recallSessionService = {
  async saveSession(session: Omit<RecallSession, "id" | "createdAt">) {
    const record: RecallSession = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...session,
    };

    await db.recallSessions.add(record);
    return record;
  },

  async getSessionsByTopic(topicId: string) {
    return db.recallSessions
      .where("topicId")
      .equals(topicId)
      .reverse()
      .sortBy("createdAt");
  },
};
