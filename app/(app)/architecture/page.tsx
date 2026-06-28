import { KnowledgeLibraryPage } from "@/features/topic-library/KnowledgeLibraryPage";
import { DEFAULT_ARCHITECTURE } from "@/features/topic-library/defaults";

export default function ArchitectureRoute() {
  return (
    <KnowledgeLibraryPage
      categoryId="architecture"
      title="Architecture"
      defaultCategory={DEFAULT_ARCHITECTURE}
      groupLabel="Topic"
      itemLabel="Concept"
    />
  );
}
