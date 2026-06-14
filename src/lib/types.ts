export type TopicCategory =
  | 'Backend'
  | 'System Design'
  | 'Architecture'
  | 'Interview'
  | 'Career'
  | 'Other';

export interface Topic {
  id: string;
  title: string;
  category: TopicCategory;
  subcategory: string;
  description: string;
  tags: string[];
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  topicId: string;
  mentalModel: string;
  executionFlow: string;
  edgeCases: string;
  tradeOffs: string;
  commonMistakes: string;
  interviewQuestions: string;
  examples: string;
  personalNotes: string;
  confidence: number;
  createdAt: string;
  updatedAt: string;
}

export interface RecallSession {
  id: string;
  topicId: string;
  score: number;
  weaknesses: string;
  strengths: string;
  createdAt: string;
}

export interface Milestone {
  id: string;
  role: string;
  title: string;
  progress: number;
  completed: boolean;
}

export interface AIConversation {
  id: string;
  topicId: string;
  provider: string;
  prompt: string;
  response: string;
  createdAt: string;
}

export interface RevisionQueueItem {
  id: string;
  topicId: string;
  priority: 'High' | 'Medium' | 'Low';
  dueDate: string;
  status: 'Pending' | 'Completed' | 'Skipped';
}
