'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { UserButton, useUser } from '@clerk/nextjs';
import { useRevisionQueueStore } from '../recall/revisionQueueStore';

const workspaceNavItems = [
  { label: 'Dashboard', path: '/dashboard', icon: '⊞' },
  { label: 'Study Plan', path: '/plan', icon: '▤' },
  { label: 'Topics', path: '/topics', icon: '◇' },
  { label: 'Recall', path: '/recall', icon: '↻' },
  { label: 'Resume', path: '/resume', icon: '▧' },
  { label: 'Templates', path: '/templates', icon: '▦' },
  { label: 'Settings', path: '/settings', icon: '⚙' },
];

const knowledgeNavItems = [
  { label: 'DSA', path: '/dsa', icon: '⌥' },
  { label: 'System Design', path: '/system-design', icon: '⬡' },
  { label: 'Architecture', path: '/architecture', icon: '⬢' },
  { label: 'Design Patterns', path: '/design-patterns', icon: '❖' },
  { label: 'Behavioral', path: '/behavioral', icon: '◎' },
];

function NavItem({
  path,
  label,
  icon,
  badge,
}: {
  path: string;
  label: string;
  icon: string;
  badge?: number;
}) {
  const pathname = usePathname();
  const isActive = pathname === path || pathname.startsWith(path + '/');

  return (
    <Link
      href={path}
      className={`mx-3 flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
        isActive
          ? 'bg-[#22212b] font-semibold text-white dark:bg-[#272633] dark:text-white'
          : 'text-[#625f6c] hover:bg-[#f1f0f5] hover:text-[#24232b] dark:text-[#b6b2c5] dark:hover:bg-[#20202a] dark:hover:text-white'
      }`}
    >
      <span className="flex h-5 w-5 items-center justify-center text-sm leading-none text-current">{icon}</span>
      <span>{label}</span>
      {badge ? (
        <span className="ml-auto rounded-full bg-[#E24B4A] px-1.5 py-0.5 text-[9px] font-semibold text-white">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

function MobileNavItem({ path, label, icon, badge }: { path: string; label: string; icon: string; badge?: number }) {
  const pathname = usePathname();
  const isActive = pathname === path || pathname.startsWith(path + '/');

  return (
    <Link
      href={path}
      className={`relative flex flex-col items-center gap-0.5 rounded-md px-1 py-1.5 text-[10px] ${
        isActive ? 'font-semibold text-[#534AB7]' : 'text-[#888391]'
      }`}
    >
      {badge ? (
        <span className="absolute top-0 right-1 rounded-full bg-[#E24B4A] px-1 text-[9px] text-white">{badge}</span>
      ) : null}
      <span className="text-base leading-none">{icon}</span>
      <span className="truncate">{label.split(' ')[0]}</span>
    </Link>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { items: queueItems, loadQueue } = useRevisionQueueStore();
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const firstName =
    user?.firstName ??
    user?.emailAddresses[0]?.emailAddress?.split('@')[0] ??
    'You';

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  // Close drawer on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const queueCount = queueItems.filter((i) => i.status === 'Pending').length;

  return (
    <div className="min-h-screen bg-[#f6f6f8] text-[#24232b] dark:bg-[#111116] dark:text-[#f4f3f8]">
      <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-[248px_minmax(0,1fr)]">

        {/* Desktop Sidebar */}
        <aside className="hidden border-r border-[#dddbe7] bg-white py-5 dark:border-[#292735] dark:bg-[#171720] lg:flex lg:flex-col">
          <div className="border-b border-[#dddbe7] px-6 pb-5 dark:border-[#292735]">
            <span className="text-base font-semibold tracking-tight">Recall.dev</span>
            <p className="mt-1 text-xs text-[#888391]">Interview workspace</p>
          </div>

          <div className="mt-5 flex-1 overflow-y-auto">
            <div className="px-6 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#888391]">
              Workspace
            </div>
            <nav className="mt-2 space-y-1">
              {workspaceNavItems.map((item) => (
                <NavItem
                  key={item.path}
                  path={item.path}
                  label={item.label}
                  icon={item.icon}
                  badge={item.path === '/recall' ? queueCount || undefined : undefined}
                />
              ))}
            </nav>

            <div className="mt-5 px-6 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#888391]">
              Knowledge Base
            </div>
            <nav className="mt-2 space-y-1">
              {knowledgeNavItems.map((item) => (
                <NavItem
                  key={item.path}
                  path={item.path}
                  label={item.label}
                  icon={item.icon}
                />
              ))}
            </nav>
          </div>

          <div className="mx-4 mt-4 rounded-lg border border-[#dddbe7] bg-[#faf9fc] p-4 dark:border-[#292735] dark:bg-[#20202a]">
            <p className="text-sm font-semibold text-[#24232b] dark:text-[#f4f3f8]">AI Features</p>
            <p className="mt-2 text-xs leading-5 text-[#625f6c] dark:text-[#b6b2c5]">
              Connect an AI provider in Settings to unlock smart study plans and recall prompts.
            </p>
            <button
              onClick={() => router.push('/settings')}
              className="mt-3 w-full rounded-md bg-[#24232b] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#3a3845] dark:bg-[#f4f3f8] dark:text-[#171720] dark:hover:bg-white"
            >
              Configure AI
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex min-w-0 flex-col pb-20 lg:pb-0">
          <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-[#dddbe7] bg-white px-4 py-3 dark:border-[#292735] dark:bg-[#171720] lg:px-7">
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#625f6c] transition hover:bg-[#f1f0f5] dark:text-[#b6b2c5] dark:hover:bg-[#20202a] lg:hidden"
            >
              <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 1H18M0 7H18M0 13H18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
              </svg>
            </button>

            <div className="flex items-center gap-2 lg:hidden">
              <span className="text-sm font-semibold">Recall.dev</span>
            </div>

            <div className="hidden max-w-3xl flex-1 cursor-pointer items-center gap-2 rounded-md border border-[#dddbe7] bg-[#f6f6f8] px-3 py-2 text-xs text-[#625f6c] transition hover:border-[#b9b7c4] dark:border-[#292735] dark:bg-[#20202a] dark:text-[#b6b2c5] sm:flex">
              <span aria-hidden="true" className="text-[#888391]">⌕</span>
              <span>Search topics, plans, templates...</span>
              <kbd className="ml-auto rounded border border-[#dddbe7] px-1.5 py-0.5 text-[10px] text-[#888391] dark:border-[#292735]">⌘K</kbd>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-xs font-semibold">{firstName}</p>
                <p className="text-[10px] text-[#888391]">Interview prep</p>
              </div>
              <UserButton
                appearance={{ elements: { avatarBox: 'h-8 w-8' } }}
              />
            </div>
          </header>

          <main className="min-w-0 flex-1 p-5 lg:p-7">{children}</main>
        </div>
      </div>

      {/* Mobile bottom nav — primary workspace items only */}
      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-[#dddbe7] bg-white px-1 py-1 dark:border-[#292735] dark:bg-[#171720] lg:hidden">
        {workspaceNavItems.slice(0, 5).map((item) => (
          <MobileNavItem
            key={item.path}
            path={item.path}
            label={item.label}
            icon={item.icon}
            badge={item.path === '/recall' ? queueCount || undefined : undefined}
          />
        ))}
      </nav>

      {/* Mobile hamburger drawer */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setMenuOpen(false)}
          />

          {/* Slide-in panel */}
          <div className="fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-white shadow-2xl dark:bg-[#171720] lg:hidden">
            {/* Drawer header */}
            <div className="flex items-center justify-between border-b border-[#dddbe7] px-5 py-4 dark:border-[#292735]">
              <div>
                <p className="text-base font-semibold tracking-tight text-[#1f1f28] dark:text-white">Recall.dev</p>
                <p className="text-xs text-[#888391]">Interview workspace</p>
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#888391] hover:bg-[#f1f0f5] dark:hover:bg-[#20202a]"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Nav */}
            <div className="flex-1 overflow-y-auto py-4">
              <div className="px-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#888391]">
                Workspace
              </div>
              <nav className="mt-2 space-y-1">
                {workspaceNavItems.map((item) => (
                  <NavItem
                    key={item.path}
                    path={item.path}
                    label={item.label}
                    icon={item.icon}
                    badge={item.path === '/recall' ? queueCount || undefined : undefined}
                  />
                ))}
              </nav>

              <div className="mt-5 px-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#888391]">
                Knowledge Base
              </div>
              <nav className="mt-2 space-y-1">
                {knowledgeNavItems.map((item) => (
                  <NavItem
                    key={item.path}
                    path={item.path}
                    label={item.label}
                    icon={item.icon}
                  />
                ))}
              </nav>
            </div>

            {/* AI features card */}
            <div className="m-4 rounded-lg border border-[#dddbe7] bg-[#faf9fc] p-4 dark:border-[#292735] dark:bg-[#20202a]">
              <p className="text-sm font-semibold text-[#24232b] dark:text-[#f4f3f8]">AI Features</p>
              <p className="mt-1.5 text-xs leading-5 text-[#625f6c] dark:text-[#b6b2c5]">
                Connect an AI provider in Settings to unlock smart study plans.
              </p>
              <button
                onClick={() => { router.push('/settings'); setMenuOpen(false); }}
                className="mt-3 w-full rounded-md bg-[#24232b] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#3a3845] dark:bg-[#f4f3f8] dark:text-[#171720] dark:hover:bg-white"
              >
                Configure AI
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
