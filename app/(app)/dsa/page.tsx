import { KnowledgeLibraryPage } from "@/features/topic-library/KnowledgeLibraryPage";
import { DEFAULT_DSA } from "@/features/topic-library/defaults";

export default function DSARoute() {
  return (
    <KnowledgeLibraryPage
      categoryId="dsa"
      title="DSA"
      defaultCategory={DEFAULT_DSA}
      groupLabel="Pattern"
      itemLabel="Question"
    />
  );
}
