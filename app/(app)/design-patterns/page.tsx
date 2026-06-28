import { KnowledgeLibraryPage } from "@/features/topic-library/KnowledgeLibraryPage";
import { DEFAULT_DESIGN_PATTERNS } from "@/features/topic-library/defaults";

export default function DesignPatternsRoute() {
  return (
    <KnowledgeLibraryPage
      categoryId="design-patterns"
      title="Design Patterns"
      defaultCategory={DEFAULT_DESIGN_PATTERNS}
      groupLabel="Pattern"
      itemLabel="Example"
    />
  );
}
