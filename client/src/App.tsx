import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { AIChatbot } from "@/components/ai-chatbot";

// Import Pages
import Dashboard from "@/pages/dashboard";
import Candidates from "@/pages/candidates";
import Analytics from "@/pages/analytics";
import Interviews from "@/pages/interviews";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <SidebarProvider>
            <div className="flex min-h-screen bg-background">
              <AppSidebar />
              <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-auto">
                <div className="max-w-7xl mx-auto">
                  <Switch>
                    <Route path="/" component={Dashboard} />
                    <Route path="/candidates" component={Candidates} />
                    <Route path="/analytics" component={Analytics} />
                    <Route path="/interviews" component={Interviews} />
                    <Route path="/settings" component={Settings} />
                    <Route component={NotFound} />
                  </Switch>
                </div>
              </main>
              <AIChatbot />
            </div>
          </SidebarProvider>
        </TooltipProvider>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}