import { create } from "zustand";
import { RevisionQueueItem, Topic } from "../../lib/types";
import { revisionQueueService } from "./revisionQueueService";

interface RevisionQueueState {
  items: RevisionQueueItem[];
  loading: boolean;
  error?: string;
  loadQueue: () => Promise<void>;
  addTopicToQueue: (topic: Topic) => Promise<void>;
  removeQueueItem: (id: string) => Promise<void>;
  markCompleted: (id: string) => Promise<void>;
  rescheduleQueueItem: (id: string, days?: number) => Promise<void>;
  skipQueueItem: (id: string) => Promise<void>;
}

export const useRevisionQueueStore = create<RevisionQueueState>((set, get) => ({
  items: [],
  loading: false,
  error: undefined,
  loadQueue: async () => {
    set({ loading: true, error: undefined });
    try {
      const items = await revisionQueueService.getQueueItems();
      set({ items, loading: false });
    } catch (error) {
      set({ loading: false, error: "Unable to load revision queue." });
    }
  },
  addTopicToQueue: async (topic) => {
    set({ loading: true, error: undefined });
    try {
      const queued = await revisionQueueService.getQueueItemByTopicId(topic.id);
      if (!queued) {
        const item = await revisionQueueService.addTopicToQueue(topic);
        set({ items: [item, ...get().items], loading: false });
      } else {
        set({ loading: false });
      }
    } catch (error) {
      set({ loading: false, error: "Unable to add topic to queue." });
    }
  },
  removeQueueItem: async (id) => {
    set({ loading: true, error: undefined });
    try {
      await revisionQueueService.removeQueueItem(id);
      set({
        items: get().items.filter((item) => item.id !== id),
        loading: false,
      });
    } catch (error) {
      set({ loading: false, error: "Unable to remove queue item." });
    }
  },
  markCompleted: async (id) => {
    set({ loading: true, error: undefined });
    try {
      const item = get().items.find((item) => item.id === id);
      if (!item) {
        set({ loading: false });
        return;
      }
      const updated = { ...item, status: "Completed" as const };
      await revisionQueueService.updateQueueItem(updated);
      set({
        items: get().items.map((queueItem) =>
          queueItem.id === id ? updated : queueItem,
        ),
        loading: false,
      });
    } catch (error) {
      set({ loading: false, error: "Unable to mark queue item complete." });
    }
  },
  rescheduleQueueItem: async (id, days = 3) => {
    set({ loading: true, error: undefined });
    try {
      const updated = await revisionQueueService.rescheduleQueueItem(id, days);
      if (!updated) {
        set({ loading: false });
        return;
      }
      set({
        items: get().items.map((queueItem) =>
          queueItem.id === id ? updated : queueItem,
        ),
        loading: false,
      });
    } catch (error) {
      set({ loading: false, error: "Unable to reschedule queue item." });
    }
  },
  skipQueueItem: async (id) => {
    set({ loading: true, error: undefined });
    try {
      const updated = await revisionQueueService.skipQueueItem(id);
      if (!updated) {
        set({ loading: false });
        return;
      }
      set({
        items: get().items.map((queueItem) =>
          queueItem.id === id ? updated : queueItem,
        ),
        loading: false,
      });
    } catch (error) {
      set({ loading: false, error: "Unable to skip queue item." });
    }
  },
}));
