import { KnowledgeLibraryPage } from "@/features/topic-library/KnowledgeLibraryPage";
import { DEFAULT_BEHAVIORAL } from "@/features/topic-library/defaults";

export default function BehavioralRoute() {
  return (
    <KnowledgeLibraryPage
      categoryId="behavioral"
      title="Behavioral"
      defaultCategory={DEFAULT_BEHAVIORAL}
      groupLabel="Theme"
      itemLabel="Question"
    />
  );
}
