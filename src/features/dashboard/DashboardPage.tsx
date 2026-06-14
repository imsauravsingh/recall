import { useEffect, useMemo } from 'react';
import { useTopicStore } from '../topics/topicStore';
import Panel from '../ui/Panel';

function DashboardMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-slate-50">{value}</p>
    </div>
  );
}

function DashboardPage() {
  const { topics, loadTopics, loading } = useTopicStore();

  useEffect(() => {
    loadTopics();
  }, [loadTopics]);

  const stats = useMemo(() => {
    const active = topics.filter((topic) => !topic.archived).length;
    const archived = topics.filter((topic) => topic.archived).length;
    const categories = Array.from(new Set(topics.map((topic) => topic.category))).length;

    return {
      active,
      archived,
      categories,
    };
  }, [topics]);

  return (
    <div className="space-y-8">
      <div className="grid gap-5 lg:grid-cols-3">
        <DashboardMetric label="Total topics" value={topics.length} />
        <DashboardMetric label="Active" value={stats.active} />
        <DashboardMetric label="Archived" value={stats.archived} />
      </div>

      <Panel>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Recall pulse</p>
              <h2 className="text-2xl font-semibold text-slate-50">Your current study baseline</h2>
            </div>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-400">
              {loading ? 'Refreshing…' : 'Live local data'}
            </span>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-slate-400">
            Recall.dev keeps your training data locally and surfaces your most important memory work before it decays.
            Add a topic to begin tracking structured recall across execution flow, edge cases, and interview readiness.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
              <p className="text-sm text-slate-500">Category variety</p>
              <p className="mt-4 text-4xl font-semibold text-slate-100">{stats.categories}</p>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
              <p className="text-sm text-slate-500">Last updated</p>
              <p className="mt-4 text-4xl font-semibold text-slate-100">{topics[0]?.updatedAt ? new Date(topics[0].updatedAt).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
              <p className="text-sm text-slate-500">Next phase</p>
              <p className="mt-4 text-4xl font-semibold text-slate-100">Recall Mode</p>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}

export default DashboardPage;
