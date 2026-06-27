import { describe, expect, it, vi } from "vitest";
import { db } from "../../lib/db";
import { noteService } from "./noteService";

describe("noteService", () => {
  it("creates a note for a topic when none exists yet", async () => {
    vi.spyOn(db.notes, "get").mockResolvedValue(undefined as never);
    const putSpy = vi
      .spyOn(db.notes, "put")
      .mockResolvedValue(undefined as never);

    await noteService.saveNote("topic-1", {
      personalNotes: "Keep the core intuition in mind",
      confidence: 72,
    });

    expect(putSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        topicId: "topic-1",
        personalNotes: "Keep the core intuition in mind",
        confidence: 72,
      }),
    );
  });
});
