import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import type { Note } from "../../lib/types";
import { useTopicStore } from "../topics/topicStore";
import { noteService } from "../topics/noteService";
import { recallSessionService } from "./recallSessionService";
import { buildRecallHint } from "../../lib/insightsService";

const ratings = [
  {
    label: "Forgot",
    score: 20,
    className: "border-[#F09595] text-[#A32D2D] hover:bg-[#FCEBEB]",
  },
  {
    label: "Hard",
    score: 50,
    className: "border-[#EF9F27] text-[#854F0B] hover:bg-[#FAEEDA]",
  },
  {
    label: "Medium",
    score: 75,
    className: "border-[#85B7EB] text-[#185FA5] hover:bg-[#E6F1FB]",
  },
  {
    label: "Easy",
    score: 95,
    className: "border-[#5DCAA5] text-[#0F6E56] hover:bg-[#E1F5EE]",
  },
];

const prompts = [
  {
    title: "Mental model",
    prompt: "Explain the core idea of this topic in one sentence.",
    answer:
      "The main idea is to connect the concept to a reusable pattern and explain why it matters.",
  },
  {
    title: "Execution flow",
    prompt: "Walk through the key steps or algorithm structure.",
    answer:
      "Start from the problem statement, define the data structure, then explain each decision point.",
  },
  {
    title: "Edge cases",
    prompt: "What edge cases or failure modes should you remember?",
    answer:
      "Watch for empty inputs, duplicates, boundary values, and time complexity pitfalls.",
  },
];

function RecallPage() {
  const location = useLocation();
  const { topics, loadTopics } = useTopicStore();
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(68);
  const [seconds, setSeconds] = useState(0);
  const [selectedTopicId, setSelectedTopicId] = useState<string>("");
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [saved, setSaved] = useState(false);
  const [topicNote, setTopicNote] = useState<Note | undefined>(undefined);

  useEffect(() => {
    void loadTopics();
  }, [loadTopics]);

  useEffect(() => {
    const topicIdFromQuery = new URLSearchParams(location.search).get(
      "topicId",
    );
    if (
      topicIdFromQuery &&
      topics.some((topic) => topic.id === topicIdFromQuery)
    ) {
      setSelectedTopicId(topicIdFromQuery);
      setSaved(false);
      setRevealed(false);
      return;
    }

    if (!selectedTopicId && topics.length > 0) {
      setSelectedTopicId(topics[0].id);
    }
  }, [location.search, selectedTopicId, topics]);

  useEffect(() => {
    const timer = window.setInterval(
      () => setSeconds((value) => value + 1),
      1000,
    );
    return () => window.clearInterval(timer);
  }, []);

  const selectedTopic = useMemo(
    () => topics.find((topic) => topic.id === selectedTopicId),
    [selectedTopicId, topics],
  );

  useEffect(() => {
    if (!selectedTopic) {
      setTopicNote(undefined);
      return;
    }

    void noteService
      .getNote(selectedTopic.id)
      .then((note) => setTopicNote(note ?? undefined));
  }, [selectedTopic]);

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const remainingSeconds = (seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${remainingSeconds}`;
  }, [seconds]);

  const currentPrompt = prompts[currentPromptIndex];
  const aiHint = useMemo(
    () =>
      selectedTopic
        ? buildRecallHint({
            topic: selectedTopic,
            promptIndex: currentPromptIndex,
            note: topicNote,
          })
        : "",
    [selectedTopic, currentPromptIndex, topicNote],
  );

  async function handleSaveSession() {
    if (!selectedTopic) {
      return;
    }

    await recallSessionService.saveSession({
      topicId: selectedTopic.id,
      score,
      weaknesses: "Need more recall practice on edge cases",
      strengths: "Understood the main pattern and flow",
    });
    setSaved(true);
  }

  function handleNextPrompt() {
    setRevealed(false);
    setSaved(false);
    setCurrentPromptIndex((value) => (value + 1) % prompts.length);
  }

  return (
    <div className="space-y-3">
      <section className="rounded-lg bg-[#534AB7] p-4 text-white dark:bg-[#3C3489]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold">
              Recall Mode - {selectedTopic?.title ?? "Your topics"}
            </h1>
            <p className="mt-1 text-xs text-[#CECBF6]">
              Answer from memory first, then reveal the suggested model.
            </p>
          </div>
          <div className="text-2xl font-semibold">{formattedTime}</div>
        </div>
      </section>

      <div className="rounded-lg border border-[#dddbe7] bg-white p-3 dark:border-[#292735] dark:bg-[#1a1a23]">
        <label
          className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#888391]"
          htmlFor="topic-select"
        >
          Pick a topic
        </label>
        <select
          id="topic-select"
          value={selectedTopicId}
          onChange={(event) => {
            setSelectedTopicId(event.target.value);
            setSaved(false);
            setRevealed(false);
          }}
          className="mt-2 w-full rounded-lg border border-[#dddbe7] bg-[#f6f6f8] px-3 py-2 text-sm dark:border-[#292735] dark:bg-[#20202a]"
        >
          {topics.map((topic) => (
            <option key={topic.id} value={topic.id}>
              {topic.title}
            </option>
          ))}
        </select>
      </div>

      <section className="rounded-lg border border-[#dddbe7] bg-white p-4 dark:border-[#292735] dark:bg-[#1a1a23]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#888391]">
          Step {currentPromptIndex + 1} of {prompts.length} -{" "}
          {currentPrompt.title}
        </p>
        <h2 className="mt-2 text-base font-semibold">{currentPrompt.prompt}</h2>
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className={`mt-3 min-h-28 w-full rounded-lg border p-4 text-left text-xs leading-6 ${
            revealed
              ? "border-[#5DCAA5] bg-[#EAF3DE] text-[#085041] dark:border-[#1D9E75] dark:bg-[#085041] dark:text-[#9FE1CB]"
              : "border-[#dddbe7] bg-[#f6f6f8] text-center text-[#888391] dark:border-[#292735] dark:bg-[#20202a]"
          }`}
        >
          {revealed ? (
            <span>{currentPrompt.answer}</span>
          ) : (
            <span>Try to recall first, then tap to reveal the answer</span>
          )}
        </button>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {ratings.map((rating) => (
            <button
              key={rating.label}
              type="button"
              onClick={() => setScore(rating.score)}
              className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${rating.className}`}
            >
              {rating.label}
            </button>
          ))}
        </div>

        <div className="mt-3 rounded-lg border border-[#EEEDFE] bg-[#f8f7fb] p-3 text-sm text-[#3C3489] dark:border-[#26215C] dark:bg-[#20202a] dark:text-[#CECBF6]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">
            AI recall hint
          </p>
          <p className="mt-1 leading-6">
            {aiHint || "Add a note for this topic to unlock tailored prompts."}
          </p>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleSaveSession}
            className="rounded-lg bg-[#534AB7] px-3 py-2 text-xs font-semibold text-white"
          >
            Save session
          </button>
          <button
            type="button"
            onClick={handleNextPrompt}
            className="rounded-lg border border-[#dddbe7] px-3 py-2 text-xs font-semibold text-[#625f6c] dark:border-[#292735]"
          >
            Next prompt
          </button>
        </div>
        {saved ? (
          <p className="mt-2 text-xs text-[#0F6E56]">
            Session saved to your local history.
          </p>
        ) : null}
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-[#dddbe7] bg-white p-4 dark:border-[#292735] dark:bg-[#1a1a23]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#888391]">
            Session stats
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-[#f1f0f5] p-3 dark:bg-[#20202a]">
              <p className="text-xl font-semibold">
                {currentPromptIndex + 1}/{prompts.length}
              </p>
              <p className="text-xs text-[#625f6c] dark:text-[#b6b2c5]">
                Prompt
              </p>
            </div>
            <div className="rounded-lg bg-[#f1f0f5] p-3 dark:bg-[#20202a]">
              <p className="text-xl font-semibold">{score}%</p>
              <p className="text-xs text-[#625f6c] dark:text-[#b6b2c5]">
                Accuracy
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-[#dddbe7] bg-white p-4 text-xs leading-6 dark:border-[#292735] dark:bg-[#1a1a23]">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#888391]">
            Quick hints
          </p>
          <p>Start with the core idea before diving into details.</p>
          <p>Use the answer as a mental model, not a script.</p>
          <p>Review edge cases after the first pass.</p>
        </div>
      </section>
    </div>
  );
}

export default RecallPage;
