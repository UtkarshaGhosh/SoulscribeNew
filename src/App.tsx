import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // Apply persisted theme (based on last mood) on initial load, but skip on auth pages
  if (typeof window !== 'undefined') {
    try {
      const pathname = window.location.pathname || '';
      if (!pathname.startsWith('/auth')) {
        const existing = JSON.parse(localStorage.getItem('soulscribe-moods') || '[]');
        if (Array.isArray(existing) && existing.length) {
          const last = existing[existing.length - 1];
          if (last && last.mood) {
            // Dynamically import to avoid circular deps at module init
            import('@/lib/moodTheme').then(({ applyThemeForMood }) => applyThemeForMood(last.mood)).catch(() => {});
          }
        }
      }
    } catch (e) {
      // ignore
    }
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
