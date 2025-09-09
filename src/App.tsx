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
  // Apply persisted mood class (if any) on initial load, but skip on auth pages
  if (typeof window !== 'undefined') {
    try {
      const pathname = window.location.pathname || '';
      // Do not apply mood background on the auth route (login/signup)
      if (!pathname.startsWith('/auth')) {
        const existing = JSON.parse(localStorage.getItem('soulscribe-moods') || '[]');
        if (Array.isArray(existing) && existing.length) {
          const last = existing[existing.length - 1];
          if (last && last.mood) {
            Array.from(document.body.classList)
              .filter((c) => c.startsWith('mood-'))
              .forEach((c) => document.body.classList.remove(c));
            document.body.classList.add(`mood-${last.mood}`);
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
