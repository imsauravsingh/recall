import { useEffect, useMemo, useState } from 'react';
import TopicCard from './TopicCard';
import TopicForm from './TopicForm';
import { useTopicStore } from './topicStore';
import Panel from '../ui/Panel';
import { Topic } from '../../lib/types';

function TopicsPage() {
  const { topics, loadTopics, createTopic, updateTopic, removeTopic, toggleArchive, loading, error } = useTopicStore();
  const [editing, setEditing] = useState<Topic | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadTopics();
  }, [loadTopics]);

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
    <div className="space-y-8">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Topic workspace</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-100">Structured topic management</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Capture the concept, category, and tags for each developer memory topic. Add, update, archive, and delete locally.
          </p>
        </div>
        <button
          type="button"
          onClick={handleCreate}
          className="inline-flex items-center justify-center rounded-3xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
        >
          New topic
        </button>
      </div>

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
        <div className="rounded-3xl border border-rose-500 bg-rose-500/10 p-4 text-sm text-rose-100">{error}</div>
      ) : null}

      <Panel>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Topic inventory</p>
              <h3 className="text-2xl font-semibold text-slate-100">All topics</h3>
            </div>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-400">
              {loading ? 'Loading…' : `${activeTopics.length} active, ${archivedTopics.length} archived`}
            </span>
          </div>

          {topics.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950/70 p-8 text-center text-slate-400">
              No topics yet. Add your first developer memory item to get started.
            </div>
          ) : (
            <div className="grid gap-4">
              {activeTopics.map((topic) => (
                <TopicCard
                  key={topic.id}
                  topic={topic}
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
            <h3 className="text-xl font-semibold text-slate-100">Archived topics</h3>
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
