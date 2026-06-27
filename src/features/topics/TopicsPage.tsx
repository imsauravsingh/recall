import { useEffect, useMemo, useState } from 'react';
import TopicCard from './TopicCard';
import TopicForm from './TopicForm';
import { useTopicStore } from './topicStore';
import { useRevisionQueueStore } from '../recall/revisionQueueStore';
import Panel from '../ui/Panel';
import { Topic } from '../../lib/types';
import { patterns } from '../recall/recallData';

function TopicsPage() {
  const { topics, loadTopics, createTopic, updateTopic, removeTopic, toggleArchive, loading, error } = useTopicStore();
  const { items: queueItems, loadQueue, addTopicToQueue, removeQueueItem } = useRevisionQueueStore();
  const [editing, setEditing] = useState<Topic | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadTopics();
    loadQueue();
  }, [loadTopics, loadQueue]);

  const isTopicQueued = (topicId: string) => queueItems.some((item) => item.topicId === topicId);

  function handleQueueToggle(topic: Topic) {
    const queueItem = queueItems.find((item) => item.topicId === topic.id);
    if (queueItem) {
      removeQueueItem(queueItem.id);
    } else {
      addTopicToQueue(topic);
    }
  }

  const activeTopics = useMemo(() => topics.filter((topic) => !topic.archived), [topics]);
  const archivedTopics = useMemo(() => topics.filter((topic) => topic.archived), [topics]);

  function handleSubmit(values: Omit<Topic, 'id' | 'createdAt' | 'updatedAt' | 'archived'> & { id?: string; archived?: boolean }) {
    if (values.id) {
      updateTopic({
        id: values.id,
        title: values.title,
        category: values.category,
        subcategory: values.subcategory,
        description: values.description,
        tags: values.tags,
        archived: values.archived ?? false,
        createdAt: editing?.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setEditing(undefined);
    } else {
      createTopic({
        title: values.title,
        category: values.category,
        subcategory: values.subcategory,
        description: values.description,
        tags: values.tags,
      });
    }
    setShowForm(false);
  }

  function handleEdit(topic: Topic) {
    setEditing(topic);
    setShowForm(true);
  }

  function handleCreate() {
    setEditing(undefined);
    setShowForm(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold">Interview Rounds / DSA</h1>
          <p className="mt-1 text-xs text-[#625f6c] dark:text-[#b6b2c5]">Data structures and algorithms - master fundamentals and coding interview recall.</p>
        </div>
        <button
          type="button"
          onClick={handleCreate}
          className="inline-flex items-center justify-center rounded-lg bg-[#534AB7] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3C3489]"
        >
          New topic
        </button>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['84', 'Total topics', ''],
          ['32', 'Strong topics', 'Recall >= 70%'],
          ['18', 'Weak topics', 'Recall < 40%'],
          ['62%', 'Overall recall', ''],
        ].map(([value, label, sub]) => (
          <div key={label} className="rounded-lg bg-[#f1f0f5] p-3 dark:bg-[#20202a]">
            <p className="text-2xl font-semibold leading-none">{value}</p>
            <p className="mt-1 text-xs text-[#625f6c] dark:text-[#b6b2c5]">{label}</p>
            {sub ? <p className="mt-0.5 text-[11px] text-[#888391]">{sub}</p> : null}
          </div>
        ))}
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {['All patterns', 'Arrays & Hashing', 'Two Pointers', 'Sliding Window', 'Heaps', 'Graphs', 'DP'].map((tab, index) => (
          <button
            key={tab}
            type="button"
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs ${
              index === 0
                ? 'border-[#AFA9EC] bg-[#EEEDFE] font-semibold text-[#3C3489]'
                : 'border-[#dddbe7] text-[#625f6c] dark:border-[#292735] dark:text-[#b6b2c5]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <section className="overflow-hidden rounded-lg border border-[#dddbe7] bg-white dark:border-[#292735] dark:bg-[#1a1a23]">
        <div className="hidden grid-cols-[1fr_70px_110px_100px_80px] bg-[#f1f0f5] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#888391] dark:bg-[#20202a] md:grid">
          <span>Pattern</span>
          <span className="text-center">Topics</span>
          <span className="text-center">Confidence</span>
          <span>Progress</span>
          <span>Revised</span>
        </div>
        {patterns.map((pattern) => (
          <div key={pattern.name} className="grid gap-3 border-t border-[#eceaf2] px-4 py-3 dark:border-[#292735] md:grid-cols-[1fr_70px_110px_100px_80px] md:items-center">
            <div>
              <p className="text-sm font-semibold">{pattern.name}</p>
              <p className="mt-0.5 text-xs text-[#625f6c] dark:text-[#b6b2c5]">{pattern.sub}</p>
            </div>
            <div className="text-xs text-[#625f6c] dark:text-[#b6b2c5] md:text-center">{pattern.topics} topics</div>
            <div className="md:text-center">
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  pattern.status === 'Strong'
                    ? 'bg-[#EAF3DE] text-[#27500A]'
                    : pattern.status === 'Medium'
                      ? 'bg-[#FAEEDA] text-[#633806]'
                      : 'bg-[#FCEBEB] text-[#A32D2D]'
                }`}
              >
                {pattern.confidence}% {pattern.status}
              </span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-[#dddbe7] dark:bg-[#292735]">
              <div className="h-full rounded-full" style={{ width: `${pattern.confidence}%`, background: pattern.color }} />
            </div>
            <div className="text-xs text-[#888391]">{pattern.revised}</div>
          </div>
        ))}
      </section>

      {showForm ? (
        <TopicForm
          initialTopic={editing}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditing(undefined);
          }}
        />
      ) : null}

      {error ? (
        <div className="rounded-lg border border-[#F09595] bg-[#FCEBEB] p-4 text-sm text-[#A32D2D]">{error}</div>
      ) : null}

      <Panel>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#888391]">Topic inventory</p>
              <h2 className="mt-1 text-base font-semibold">All topics</h2>
            </div>
            <span className="rounded-full bg-[#f1f0f5] px-3 py-1 text-xs text-[#625f6c] dark:bg-[#20202a] dark:text-[#b6b2c5]">
              {loading ? 'Loading...' : `${activeTopics.length} active, ${archivedTopics.length} archived`}
            </span>
          </div>

          {topics.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[#dddbe7] bg-[#f6f6f8] p-8 text-center text-sm text-[#625f6c] dark:border-[#292735] dark:bg-[#20202a] dark:text-[#b6b2c5]">
              No topics yet. Add your first developer memory item to get started.
            </div>
          ) : (
            <div className="grid gap-4">
              {activeTopics.map((topic) => (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  queued={isTopicQueued(topic.id)}
                  onToggleQueue={handleQueueToggle}
                  onEdit={handleEdit}
                  onDelete={removeTopic}
                  onArchive={toggleArchive}
                />
              ))}
            </div>
          )}
        </div>
      </Panel>

      {archivedTopics.length > 0 ? (
        <Panel>
          <div className="space-y-4">
            <h2 className="text-base font-semibold">Archived topics</h2>
            <div className="grid gap-4">
              {archivedTopics.map((topic) => (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  onEdit={handleEdit}
                  onDelete={removeTopic}
                  onArchive={toggleArchive}
                />
              ))}
            </div>
          </div>
        </Panel>
      ) : null}
    </div>
  );
}

export default TopicsPage;
