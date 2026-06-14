import { db } from '../../lib/db';
import { Topic } from '../../lib/types';

export const topicService = {
  async getTopics() {
    return await db.topics.orderBy('updatedAt').reverse().toArray();
  },

  async addTopic(topic: Topic) {
    await db.topics.add(topic);
    return topic;
  },

  async updateTopic(topic: Topic) {
    await db.topics.put(topic);
    return topic;
  },

  async deleteTopic(id: string) {
    await db.topics.delete(id);
  },

  async archiveTopic(id: string, archived: boolean) {
    const topic = await db.topics.get(id);
    if (topic) {
      await db.topics.put({ ...topic, archived, updatedAt: new Date().toISOString() });
    }
  },
};
