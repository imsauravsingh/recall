import Dexie, { Table } from 'dexie';
import { AIConversation, Milestone, Note, RecallSession, RevisionQueueItem, Topic } from './types';

export class RecallDatabase extends Dexie {
  topics!: Table<Topic, string>;
  notes!: Table<Note, string>;
  recallSessions!: Table<RecallSession, string>;
  milestones!: Table<Milestone, string>;
  aiConversations!: Table<AIConversation, string>;
  revisionQueue!: Table<RevisionQueueItem, string>;

  constructor() {
    super('RecallDev');
    this.version(1).stores({
      topics: 'id, title, category, subcategory, archived, updatedAt',
      notes: 'id, topicId, updatedAt',
      recallSessions: 'id, topicId, createdAt',
      milestones: 'id, role, completed',
      aiConversations: 'id, topicId, provider, createdAt',
      revisionQueue: 'id, topicId, priority, dueDate, status',
    });
  }
}

export const db = new RecallDatabase();
