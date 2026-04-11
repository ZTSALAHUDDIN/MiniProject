import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider, useApp } from "@/contexts/AppContext";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import SubjectsPage from "@/pages/SubjectsPage";
import RoutinePage from "@/pages/RoutinePage";
import SchedulePage from "@/pages/SchedulePage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import AwardsPage from "@/pages/AwardsPage";
import SettingsPage from "@/pages/SettingsPage";
import AuthPage from "@/pages/AuthPage";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

function AuthGate() {
  const { user, loading } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center animate-fade-in">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-glow mx-auto mb-3 animate-pulse-glow">
            <span className="text-primary-foreground text-lg">📚</span>
          </div>
          <p className="text-muted-foreground text-sm">Loading StudyFlow...</p>
        </div>
      </div>
    );
  }

  if (!user) return <AuthPage />;

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/subjects" element={<SubjectsPage />} />
        <Route path="/routine" element={<RoutinePage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/awards" element={<AwardsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppProvider>
          <AuthGate />
        </AppProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
