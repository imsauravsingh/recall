import { db } from "../../lib/db";
import { RevisionQueueItem, Topic } from "../../lib/types";

const priorityByCategory: Record<string, RevisionQueueItem["priority"]> = {
  Backend: "High",
  "System Design": "High",
  Architecture: "Medium",
  Interview: "Medium",
  Career: "Low",
  Other: "Low",
};

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function normalizeDueDate(date: Date) {
  return date.toISOString().split("T")[0];
}

export const revisionQueueService = {
  async getQueueItems() {
    return db.revisionQueue.orderBy("dueDate").toArray();
  },

  async getQueueItemByTopicId(topicId: string) {
    return db.revisionQueue.where("topicId").equals(topicId).first();
  },

  async addTopicToQueue(topic: Topic) {
    const dueDate = normalizeDueDate(addDays(new Date(), 3));
    const item: RevisionQueueItem = {
      id: crypto.randomUUID(),
      topicId: topic.id,
      priority: priorityByCategory[topic.category] ?? "Medium",
      dueDate,
      status: "Pending",
    };

    await db.revisionQueue.add(item);
    return item;
  },

  async updateQueueItem(item: RevisionQueueItem) {
    await db.revisionQueue.put(item);
    return item;
  },

  async rescheduleQueueItem(id: string, days = 3) {
    const item = await db.revisionQueue.get(id);
    if (!item) {
      return null;
    }

    const updated: RevisionQueueItem = {
      ...item,
      dueDate: normalizeDueDate(addDays(new Date(), days)),
      status: "Pending",
    };

    await db.revisionQueue.put(updated);
    return updated;
  },

  async skipQueueItem(id: string) {
    const item = await db.revisionQueue.get(id);
    if (!item) {
      return null;
    }

    const updated: RevisionQueueItem = {
      ...item,
      dueDate: normalizeDueDate(addDays(new Date(), 2)),
      status: "Skipped",
    };

    await db.revisionQueue.put(updated);
    return updated;
  },

  async removeQueueItem(id: string) {
    await db.revisionQueue.delete(id);
  },
};
