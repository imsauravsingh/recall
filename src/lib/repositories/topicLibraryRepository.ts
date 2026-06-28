import "server-only";
import { connectMongoDB } from "@/lib/db/mongodb";
import { TopicLibraryModel } from "@/lib/db/models";
import type { TopicCategory } from "@/lib/contentService";

export async function getTopicCategory(
  ownerId: string,
  categoryId: string,
): Promise<TopicCategory | null> {
  await connectMongoDB();
  const doc = await TopicLibraryModel.findOne({ ownerId, categoryId }).lean() as
    | { categoryId: string; name: string; groups: unknown[] }
    | null;
  if (!doc) return null;
  return {
    id: doc.categoryId,
    name: doc.name,
    groups: doc.groups ?? [],
  } as TopicCategory;
}

export async function upsertTopicCategory(
  ownerId: string,
  category: TopicCategory,
): Promise<TopicCategory> {
  await connectMongoDB();
  await TopicLibraryModel.findOneAndUpdate(
    { ownerId, categoryId: category.id },
    { $set: { name: category.name, groups: category.groups } },
    { upsert: true, new: true },
  );
  return category;
}
