import StudyPlanDetailPage from "@/features/study-plan/StudyPlanDetailPage";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <StudyPlanDetailPage planId={id} />;
}
