import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useTopicStore } from "../topics/topicStore";
import { useRevisionQueueStore } from "./revisionQueueStore";

function getDueLabel(
  dueDate: string,
  status: "Pending" | "Completed" | "Skipped",
) {
  if (status === "Completed") return "Completed";
  if (status === "Skipped") return "Skipped for now";

  const diffDays = Math.max(
    0,
    Math.ceil(
      (new Date(dueDate).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24),
    ),
  );
  if (diffDays === 0) return "Due today";
  return diffDays === 1 ? "Due in 1 day" : `Due in ${diffDays} days`;
}

function RevisionQueuePage() {
  const {
    items,
    loadQueue,
    removeQueueItem,
    markCompleted,
    rescheduleQueueItem,
    skipQueueItem,
    loading,
  } = useRevisionQueueStore();
  const { topics, loadTopics } = useTopicStore();

  useEffect(() => {
    loadTopics();
    loadQueue();
  }, [loadTopics, loadQueue]);

  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-lg font-semibold">Recall Queue</h1>
        <p className="mt-1 text-xs text-[#625f6c] dark:text-[#b6b2c5]">
          {items.length} topics due for revision
        </p>
      </div>

      <section className="overflow-hidden rounded-lg border border-[#dddbe7] bg-white dark:border-[#292735] dark:bg-[#1a1a23]">
        {items.length === 0 ? (
          <div className="p-6 text-sm text-[#625f6c] dark:text-[#b6b2c5]">
            Your revision queue is empty. Add topics from the topics page to
            start scheduling recall practice.
          </div>
        ) : (
          items.map((item) => {
            const topic = topics.find((topic) => topic.id === item.topicId);
            const title = topic?.title ?? "Untitled topic";

            return (
              <div
                key={item.id}
                className="grid grid-cols-[1fr_auto] gap-3 border-b border-[#eceaf2] p-3 last:border-b-0 dark:border-[#292735] sm:grid-cols-[1fr_auto_auto_auto] sm:items-center"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{title}</p>
                  <p className="mt-1 text-xs text-[#888391]">
                    {item.priority} priority
                  </p>
                </div>
                <span className="hidden rounded-full bg-[#EEEDFE] px-2 py-1 text-[10px] font-medium text-[#3C3489] dark:bg-[#26215C] dark:text-[#CECBF6] sm:inline-flex">
                  {item.priority}
                </span>
                <span
                  className={`text-xs font-semibold ${item.status === "Completed" ? "text-[#1D9E75]" : item.status === "Skipped" ? "text-[#854F0B]" : "text-[#A32D2D]"}`}
                >
                  {getDueLabel(item.dueDate, item.status)}
                </span>
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  {item.status !== "Completed" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => void markCompleted(item.id)}
                        className="rounded-lg bg-[#EAF3DE] px-3 py-2 text-xs font-semibold text-[#0F6E56]"
                      >
                        Mark done
                      </button>
                      <button
                        type="button"
                        onClick={() => void rescheduleQueueItem(item.id, 3)}
                        className="rounded-lg border border-[#dddbe7] px-3 py-2 text-xs text-[#625f6c] transition hover:bg-[#f1f0f5] dark:border-[#292735] dark:text-[#b6b2c5] dark:hover:bg-[#20202a]"
                      >
                        Reschedule 3d
                      </button>
                      <button
                        type="button"
                        onClick={() => void skipQueueItem(item.id)}
                        className="rounded-lg border border-[#dddbe7] px-3 py-2 text-xs text-[#625f6c] transition hover:bg-[#f1f0f5] dark:border-[#292735] dark:text-[#b6b2c5] dark:hover:bg-[#20202a]"
                      >
                        Skip
                      </button>
                    </>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => void removeQueueItem(item.id)}
                    className="rounded-lg border border-[#dddbe7] px-3 py-2 text-xs text-[#625f6c] transition hover:bg-[#f1f0f5] dark:border-[#292735] dark:text-[#b6b2c5] dark:hover:bg-[#20202a]"
                  >
                    Remove
                  </button>
                  <Link
                    to={topic ? `/recall?topicId=${topic.id}` : "/recall"}
                    className="rounded-lg bg-[#534AB7] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#3C3489]"
                  >
                    Recall
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}

export default RevisionQueuePage;
