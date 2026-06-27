import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "../../lib/db";
import type { RevisionQueueItem } from "../../lib/types";
import { revisionQueueService } from "./revisionQueueService";

describe("revisionQueueService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("reschedules a pending item to a later date", async () => {
    const item: RevisionQueueItem = {
      id: "queue-1",
      topicId: "topic-1",
      priority: "High",
      dueDate: "2026-06-27",
      status: "Pending",
    };

    vi.spyOn(db.revisionQueue, "get").mockResolvedValue(item as never);
    const putSpy = vi
      .spyOn(db.revisionQueue, "put")
      .mockResolvedValue(item.id as never);

    await revisionQueueService.rescheduleQueueItem(item.id, 7);

    expect(putSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        id: item.id,
        status: "Pending",
        dueDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      }),
    );
  });
});
