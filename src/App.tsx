import { useEffect, useState } from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { useAuth, RedirectToSignIn } from "@clerk/react";
import AppShell from "./features/shell/AppShell";
import DashboardPage from "./features/dashboard/DashboardPage";
import TopicsPage from "./features/topics/TopicsPage";
import RecallPage from "./features/recall/RecallPage";
import RevisionQueuePage from "./features/recall/RevisionQueuePage";
import TemplatesPage from "./features/recall/TemplatesPage";
import StudyPlanPage from "./features/recall/StudyPlanPage";
import OnboardingPage from "./features/onboarding/OnboardingPage";
import { isOnboardingComplete } from "./features/onboarding/onboardingApi";

function App() {
  const location = useLocation();
  const { isLoaded, isSignedIn } = useAuth();
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(
    null,
  );

  useEffect(() => {
    if (!isSignedIn) return;
    void isOnboardingComplete().then((complete) =>
      setOnboardingComplete(complete),
    );
  }, [isSignedIn]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-[#625f6c]">
        Loading...
      </div>
    );
  }

  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  if (onboardingComplete === null) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-[#625f6c]">
        Loading...
      </div>
    );
  }

  if (!onboardingComplete && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  if (onboardingComplete && location.pathname === "/onboarding") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen">
      <AppShell>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/topics" element={<TopicsPage />} />
          <Route path="/recall" element={<RecallPage />} />
          <Route path="/revision" element={<RevisionQueuePage />} />
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/plan" element={<StudyPlanPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route
            path="*"
            element={
              <div className="rounded-lg bg-white p-8 dark:bg-[#1a1a23]">
                Page not found
              </div>
            }
          />
        </Routes>
      </AppShell>
    </div>
  );
}

export default App;
