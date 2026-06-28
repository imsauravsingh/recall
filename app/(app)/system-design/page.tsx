import { KnowledgeLibraryPage } from "@/features/topic-library/KnowledgeLibraryPage";
import { DEFAULT_SYSTEM_DESIGN } from "@/features/topic-library/defaults";

export default function SystemDesignRoute() {
  return (
    <KnowledgeLibraryPage
      categoryId="system-design"
      title="System Design"
      defaultCategory={DEFAULT_SYSTEM_DESIGN}
      groupLabel="Topic"
      itemLabel="Scenario"
    />
  );
}
