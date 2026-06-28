"use client";

import { useEffect, useState } from "react";
import { TopicLibraryTab } from "@/features/study-plan/TopicLibraryTab";
import { ApiRoutes, callApi } from "@/lib/api";
import type { TopicCategory } from "@/lib/contentService";

export function TopicLibraryPage({
  categoryId,
  title,
  defaultCategory,
}: {
  categoryId: string;
  title: string;
  defaultCategory: TopicCategory;
}) {
  const [category, setCategory] = useState<TopicCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    callApi<TopicCategory | null>(ApiRoutes.topicLibrary.get(categoryId))
      .then((data) => {
        setCategory(data ?? defaultCategory);
      })
      .catch(() => {
        setCategory(defaultCategory);
      })
      .finally(() => setLoading(false));
  }, [categoryId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleUpdate(updated: TopicCategory) {
    setSaving(true);
    try {
      const saved = await callApi<TopicCategory>(
        ApiRoutes.topicLibrary.update(categoryId),
        "PUT",
        updated,
      );
      setCategory(saved);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1f1f28] dark:text-white">
            {title}
          </h1>
          <p className="mt-0.5 text-xs text-[#888391]">
            Track your knowledge and mark topics as you master them
          </p>
        </div>
        {saving && (
          <span className="text-[10px] text-[#888391]">Saving…</span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#534AB7] border-t-transparent" />
        </div>
      ) : (
        <TopicLibraryTab
          category={category ?? defaultCategory}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}
