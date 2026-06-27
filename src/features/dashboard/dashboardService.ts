import { db } from "../../lib/db";

export const dashboardService = {
  async getRecallSessions() {
    return db.recallSessions.orderBy("createdAt").reverse().toArray();
  },
};
