import { useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { UserButton, useUser } from "@clerk/react";
import { useTopicStore } from "../topics/topicStore";
import { useRevisionQueueStore } from "../recall/revisionQueueStore";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: "D" },
  { label: "Study Plan", path: "/plan", icon: "P" },
  { label: "Recall Queue", path: "/revision", icon: "Q" },
  { label: "DSA Patterns", path: "/topics", icon: "C" },
  { label: "Recall Mode", path: "/recall", icon: "R" },
  { label: "Templates", path: "/templates", icon: "T" },
];

function AppShell({ children }: { children: React.ReactNode }) {
  const topicCount = useTopicStore((state) => state.topics.length);
  const { items: queueItems, loadQueue } = useRevisionQueueStore();
  const queueCount = queueItems.length;
  const navigate = useNavigate();
  const { user } = useUser();
  const firstName = user?.firstName ?? user?.emailAddresses[0]?.emailAddress?.split('@')[0] ?? 'You';

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  return (
    <div className="min-h-screen bg-[#f6f6f8] text-[#24232b] dark:bg-[#121218] dark:text-[#f4f3f8]">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-[190px_1fr]">
        <aside className="hidden border-r border-[#dddbe7] bg-white px-0 py-4 dark:border-[#292735] dark:bg-[#171720] lg:flex lg:flex-col">
          <div className="flex items-center gap-2 border-b border-[#dddbe7] px-4 pb-4 dark:border-[#292735]">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#EEEDFE] text-sm font-semibold text-[#534AB7] dark:bg-[#26215C] dark:text-[#CECBF6]">
              R
            </div>
            <span className="text-sm font-semibold">Recall.dev</span>
          </div>

          <NavLink
            to="/topics"
            className="mx-3 mt-3 flex items-center justify-center gap-2 rounded-lg bg-[#534AB7] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#3C3489]"
          >
            <span aria-hidden="true">+</span>
            New Topic
          </NavLink>

          <div className="mt-4 px-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#888391]">
            Main
          </div>
          <nav className="mt-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 text-xs transition ${
                    isActive
                      ? "bg-[#EEEDFE] font-semibold text-[#3C3489] dark:bg-[#26215C] dark:text-[#CECBF6]"
                      : "text-[#625f6c] hover:bg-[#f1f0f5] hover:text-[#24232b] dark:text-[#b6b2c5] dark:hover:bg-[#20202a] dark:hover:text-white"
                  }`
                }
              >
                <span className="flex h-5 w-5 items-center justify-center rounded bg-[#f1f0f5] text-[10px] font-semibold dark:bg-[#20202a]">
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {item.path === "/revision" ? (
                  <span className="ml-auto rounded-full bg-[#E24B4A] px-1.5 py-0.5 text-[9px] font-semibold text-white">
                    {queueCount}
                  </span>
                ) : null}
              </NavLink>
            ))}
          </nav>

          <div className="mx-3 mt-auto rounded-lg bg-[#EEEDFE] p-3 dark:bg-[#26215C]">
            <p className="text-xs font-semibold text-[#3C3489] dark:text-[#CECBF6]">
              AI Features
            </p>
            <p className="mt-1 text-[11px] leading-4 text-[#534AB7] dark:text-[#AFA9EC]">
              Smart prompts, recall suggestions and deeper quiz generation.
            </p>
            <button
              onClick={() => navigate("/onboarding")}
              className="mt-2 w-full rounded-md bg-[#534AB7] px-2 py-1.5 text-[11px] font-semibold text-white"
            >
              Start onboarding
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col pb-20 lg:pb-0">
          <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-[#dddbe7] bg-white px-4 py-3 dark:border-[#292735] dark:bg-[#171720]">
            <div className="flex items-center gap-2 lg:hidden">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#EEEDFE] text-sm font-semibold text-[#534AB7]">
                R
              </div>
              <span className="text-sm font-semibold">Recall.dev</span>
            </div>
            <div className="hidden flex-1 items-center gap-2 rounded-lg border border-[#dddbe7] bg-[#f6f6f8] px-3 py-2 text-xs text-[#625f6c] dark:border-[#292735] dark:bg-[#20202a] dark:text-[#b6b2c5] sm:flex">
              <span aria-hidden="true">/</span>
              <span>Search topics, notes, keywords...</span>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-xs font-semibold">{firstName}</p>
                <p className="text-[10px] text-[#888391]">
                  {topicCount} local topics
                </p>
              </div>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'h-8 w-8',
                  },
                }}
              />
            </div>
          </header>

          <main className="min-w-0 flex-1 p-4 lg:p-5">{children}</main>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-6 border-t border-[#dddbe7] bg-white px-1 py-1 dark:border-[#292735] dark:bg-[#171720] lg:hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `relative flex flex-col items-center gap-0.5 rounded-md px-1 py-1.5 text-[10px] ${
                isActive ? "font-semibold text-[#534AB7]" : "text-[#888391]"
              }`
            }
          >
            {item.path === "/revision" ? (
              <span className="absolute top-0 rounded-full bg-[#E24B4A] px-1 text-[9px] text-white">
                {queueCount}
              </span>
            ) : null}
            <span className="text-sm font-semibold">{item.icon}</span>
            <span className="truncate">
              {item.label
                .replace(" Patterns", "")
                .replace("Recall ", "")
                .replace("Study ", "")}
            </span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default AppShell;
