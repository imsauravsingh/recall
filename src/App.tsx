import { Route, Routes, Navigate } from 'react-router-dom';
import AppShell from './features/shell/AppShell';
import DashboardPage from './features/dashboard/DashboardPage';
import TopicsPage from './features/topics/TopicsPage';
import PlaceholderPage from './features/shell/PlaceholderPage';

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <AppShell>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/topics" element={<TopicsPage />} />
          <Route
            path="/recall"
            element={
              <PlaceholderPage
                title="Recall mode"
                description="Structured recall sessions are coming next. Track your confidence, hide answers, and strengthen long-term retention."
              />
            }
          />
          <Route
            path="/revision"
            element={
              <PlaceholderPage
                title="Revision queue"
                description="Revision queue intelligence is under construction. You will soon get topic priorities based on forgetting curves and confidence."
              />
            }
          />
          <Route
            path="/settings"
            element={
              <PlaceholderPage
                title="Settings"
                description="Provider configuration, theme settings, and export/import are part of the planned settings experience."
              />
            }
          />
          <Route path="*" element={<div className="p-8">Page not found</div>} />
        </Routes>
      </AppShell>
    </div>
  );
}

export default App;
