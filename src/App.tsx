import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import { AuthProvider } from "./components/AuthProvider";
import { ProtectedRoute } from "./components/ProtectedRoute";

import SettingsPage from "./pages/SettingsPage";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/formations" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/my-exams" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/my-supervision" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/schedule" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/conflicts" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/departments" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/rooms" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/supervision" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
