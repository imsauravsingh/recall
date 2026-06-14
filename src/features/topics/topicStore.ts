import { create } from 'zustand';
import { Topic } from '../../lib/types';
import { topicService } from './topicService';

interface TopicState {
  topics: Topic[];
  activeTopic?: Topic;
  loading: boolean;
  error?: string;
  loadTopics: () => Promise<void>;
  createTopic: (topic: Omit<Topic, 'id' | 'createdAt' | 'updatedAt' | 'archived'>) => Promise<void>;
  updateTopic: (topic: Topic) => Promise<void>;
  removeTopic: (id: string) => Promise<void>;
  toggleArchive: (id: string, archived: boolean) => Promise<void>;
  setActiveTopic: (topic?: Topic) => void;
}

export const useTopicStore = create<TopicState>((set, get) => ({
  topics: [],
  loading: false,
  loadTopics: async () => {
    set({ loading: true, error: undefined });
    try {
      const topics = await topicService.getTopics();
      set({ topics, loading: false });
    } catch (error) {
      set({ loading: false, error: 'Unable to load topics.' });
    }
  },
  createTopic: async (payload) => {
    set({ loading: true, error: undefined });
    try {
      const now = new Date().toISOString();
      const topic: Topic = {
        id: crypto.randomUUID(),
        ...payload,
        archived: false,
        createdAt: now,
        updatedAt: now,
      };
      await topicService.addTopic(topic);
      set({ topics: [topic, ...get().topics], loading: false });
    } catch (error) {
      set({ loading: false, error: 'Unable to create topic.' });
    }
  },
  updateTopic: async (topic) => {
    set({ loading: true, error: undefined });
    try {
      const updated = { ...topic, updatedAt: new Date().toISOString() };
      await topicService.updateTopic(updated);
      set({
        topics: get().topics.map((item) => (item.id === updated.id ? updated : item)),
        loading: false,
      });
    } catch (error) {
      set({ loading: false, error: 'Unable to save topic.' });
    }
  },
  removeTopic: async (id) => {
    set({ loading: true, error: undefined });
    try {
      await topicService.deleteTopic(id);
      set({ topics: get().topics.filter((topic) => topic.id !== id), loading: false });
    } catch (error) {
      set({ loading: false, error: 'Unable to delete topic.' });
    }
  },
  toggleArchive: async (id, archived) => {
    set({ loading: true, error: undefined });
    try {
      await topicService.archiveTopic(id, archived);
      set({
        topics: get().topics.map((topic) =>
          topic.id === id ? { ...topic, archived, updatedAt: new Date().toISOString() } : topic,
        ),
        loading: false,
      });
    } catch (error) {
      set({ loading: false, error: 'Unable to archive topic.' });
    }
  },
  setActiveTopic: (topic) => set({ activeTopic: topic }),
}));
