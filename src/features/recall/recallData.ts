export const rounds = [
  { name: 'DSA', meta: '84 topics', recall: 62, color: '#378ADD', accent: 'bg-[#E6F1FB] text-[#185FA5]' },
  { name: 'System Design', meta: '36 topics', recall: 82, color: '#1D9E75', accent: 'bg-[#E1F5EE] text-[#0F6E56]' },
  { name: 'Backend Engg', meta: '42 topics', recall: 65, color: '#7F77DD', accent: 'bg-[#EEEDFE] text-[#534AB7]' },
  { name: 'AI Rounds', meta: '22 topics', recall: 65, color: '#D85A30', accent: 'bg-[#FCEBEB] text-[#A32D2D]' },
  { name: 'HR / Behavioral', meta: '18 topics', recall: 60, color: '#D4537E', accent: 'bg-[#FBEAF0] text-[#993556]' },
  { name: 'Resume Recall', meta: '11 projects', recall: 75, color: '#BA7517', accent: 'bg-[#FAEEDA] text-[#854F0B]' },
];

export const queueItems = [
  { topic: 'Raft Protocol', tag: 'Distributed', due: 'Due today', tone: 'text-[#A32D2D]' },
  { topic: 'PostgreSQL MVCC', tag: 'Backend', due: 'Due in 1 day', tone: 'text-[#854F0B]' },
  { topic: 'Sliding Window', tag: 'DSA', due: 'Due in 2 days', tone: 'text-[#854F0B]' },
  { topic: 'Consistent Hashing', tag: 'System Design', due: 'Due in 3 days', tone: 'text-[#0F6E56]' },
  { topic: 'RAG Architecture', tag: 'AI Round', due: 'Due in 4 days', tone: 'text-[#0F6E56]' },
  { topic: 'Dynamic Programming', tag: 'DSA', due: 'Due in 5 days', tone: 'text-[#0F6E56]' },
  { topic: 'Leadership conflict story', tag: 'HR', due: 'Due in 5 days', tone: 'text-[#0F6E56]' },
];

export const patterns = [
  { name: 'Arrays & Hashing', sub: 'Hash tables, prefix sum', topics: 12, confidence: 75, revised: '1 day ago', status: 'Strong', color: '#1D9E75' },
  { name: 'Sliding Window', sub: 'Fixed, variable window', topics: 10, confidence: 80, revised: '2 days ago', status: 'Strong', color: '#1D9E75' },
  { name: 'Heaps (Priority Queue)', sub: 'Top K, merge K lists', topics: 8, confidence: 60, revised: '3 days ago', status: 'Medium', color: '#BA7517' },
  { name: 'Graphs', sub: 'BFS, DFS, topological sort', topics: 11, confidence: 45, revised: '6 days ago', status: 'Weak', color: '#E24B4A' },
  { name: 'Dynamic Programming', sub: '1D DP, 2D DP, knapsack', topics: 15, confidence: 40, revised: '1 week ago', status: 'Weak', color: '#E24B4A' },
];

export const templates = [
  { name: 'Array Pattern', desc: 'HashMap usage, traversal decisions, edge cases and complexity analysis', tags: ['DSA', 'Easy'], accent: 'bg-[#E6F1FB] text-[#185FA5]' },
  { name: 'Sliding Window', desc: 'All patterns and variations of sliding window technique', tags: ['DSA', 'Medium'], accent: 'bg-[#E6F1FB] text-[#185FA5]' },
  { name: 'Rate Limiter', desc: 'Design and implement scalable rate limiting systems', tags: ['System Design', 'Medium'], accent: 'bg-[#FAEEDA] text-[#854F0B]' },
  { name: 'JWT and OAuth2', desc: 'Authentication flow, authorization boundaries, token risks and refresh strategy', tags: ['Backend', 'Medium'], accent: 'bg-[#E1F5EE] text-[#0F6E56]' },
  { name: 'Redis Internals', desc: 'TTL, PubSub, distributed locks, cache tradeoffs and failure cases', tags: ['Backend', 'Hard'], accent: 'bg-[#E1F5EE] text-[#0F6E56]' },
  { name: 'Database Indexes', desc: 'B-tree mental model, transactions, isolation levels and MVCC', tags: ['Backend', 'Medium'], accent: 'bg-[#FAEEDA] text-[#854F0B]' },
  { name: 'Kafka Consumer Groups', desc: 'Consumer groups, offsets, rebalancing and internals', tags: ['Backend', 'Medium'], accent: 'bg-[#E1F5EE] text-[#0F6E56]' },
  { name: 'RAG Architecture', desc: 'Retrieval augmented generation system design', tags: ['AI Round', 'Hard'], accent: 'bg-[#EEEDFE] text-[#534AB7]' },
  { name: 'STAR Method', desc: 'Structure behavioral answers using STAR framework', tags: ['HR / Behavioral', 'Easy'], accent: 'bg-[#FBEAF0] text-[#993556]' },
  { name: 'Binary Search', desc: 'Binary search and its variations with edge cases', tags: ['DSA', 'Easy'], accent: 'bg-[#E6F1FB] text-[#185FA5]' },
];

export const dailySchedule = [
  { time: 'Morning', duration: '1 hour', blocks: ['45 min DSA', '15 min Recall Revision'], focus: ['Pattern recognition', 'Understand patterns', 'Avoid solving random volume'] },
  { time: 'Evening', duration: '2 hours', blocks: ['1 hour System Design / Backend', '1 hour Deep Topic'], focus: ['Kafka', 'PostgreSQL', 'Redis', 'Distributed Systems', 'JVM', 'Cloud'] },
];

export const monthOnePlan = [
  {
    week: 'Week 1',
    goal: 'Build the base: arrays, REST, traffic entry points, and resume recall.',
    sections: [
      { title: 'DSA', items: ['Arrays', 'Two Sum', 'Best Time To Buy Stock', 'Contains Duplicate', 'Product Except Self', 'Move Zeroes'] },
      { title: 'Recall Topics', items: ['Array Pattern', 'HashMap Pattern', 'Complexity Analysis'] },
      { title: 'Backend', items: ['REST API Design', 'Pagination', 'Versioning', 'Idempotency'] },
      { title: 'System Design', items: ['Load Balancer', 'CDN', 'API Gateway'] },
      { title: 'Resume Recall', items: ['IoT Platform', 'AWS Cost Optimization', 'Performance Improvement'] },
    ],
  },
  {
    week: 'Week 2',
    goal: 'Recognize window/two-pointer patterns and explain auth plus cache design.',
    sections: [
      { title: 'DSA', items: ['Sliding Window', 'Maximum Sum Subarray', 'Longest Substring', 'Permutation In String', 'Two Pointer', 'Container With Most Water', 'Valid Palindrome'] },
      { title: 'Backend', items: ['JWT', 'OAuth2', 'Authentication', 'Authorization'] },
      { title: 'System Design', items: ['Cache', 'Redis', 'Cache Aside', 'Write Through'] },
    ],
  },
  {
    week: 'Week 3',
    goal: 'Connect stack/queue recall with Redis internals and rate limiter design.',
    sections: [
      { title: 'DSA', items: ['Stack', 'Valid Parentheses', 'Min Stack', 'Max Stack', 'Queue', 'Sliding Window Maximum'] },
      { title: 'Backend', items: ['Redis Internals', 'TTL', 'PubSub', 'Distributed Lock'] },
      { title: 'System Design', items: ['Rate Limiter'] },
      { title: 'Recall Notes', items: ['Mental Model', 'Flow', 'Tradeoffs', 'Failure Cases'] },
    ],
  },
  {
    week: 'Week 4',
    goal: 'Finish month one with linked lists, database fundamentals, and notification design.',
    sections: [
      { title: 'DSA', items: ['Linked List', 'Reverse Linked List', 'Cycle Detection', 'Merge Lists', 'LRU Foundation'] },
      { title: 'Database', items: ['Indexes', 'Transactions', 'Isolation Levels', 'MVCC'] },
      { title: 'System Design', items: ['Notification Service'] },
    ],
  },
];

export const monthOneGoals = ['Redis', 'JWT', 'Rate Limiter', 'REST', 'Database Indexes', 'Arrays', 'Sliding Window', 'Stack', 'Linked List'];

export const recallNoteSections = ['Mental Model', 'Flow', 'Tradeoffs', 'Failure Cases'];
