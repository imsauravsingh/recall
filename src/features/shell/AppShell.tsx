import { NavLink } from 'react-router-dom';
import { useTopicStore } from '../topics/topicStore';

const navItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Topics', path: '/topics' },
  { label: 'Recall Mode', path: '/recall' },
  { label: 'Revision Queue', path: '/revision' },
  { label: 'Settings', path: '/settings' },
];

function AppShell({ children }: { children: React.ReactNode }) {
  const topicCount = useTopicStore((state) => state.topics.length);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/80 px-5 py-5 shadow-soft backdrop-blur-lg sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">Recall.dev</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-50">Developer memory workspace</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Local-first recall and interview preparation for backend, system design, and architecture learning.
            </p>
          </div>
          <div className="rounded-3xl bg-slate-950/90 px-4 py-3 text-slate-300 ring-1 ring-slate-800">
            <p className="text-xs uppercase tracking-[0.32em] text-slate-500">Active topics</p>
            <p className="mt-1 text-2xl font-semibold text-slate-100">{topicCount}</p>
          </div>
        </header>

        <nav className="mb-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `rounded-3xl border px-4 py-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                  isActive
                    ? 'border-cyan-400 bg-cyan-500/10 text-cyan-100'
                    : 'border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-600 hover:bg-slate-900'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <main className="rounded-[2rem] border border-slate-800 bg-slate-900/80 p-6 shadow-soft backdrop-blur-xl">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppShell;
