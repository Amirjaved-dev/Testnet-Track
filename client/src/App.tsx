import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import AirdropChecker from "@/pages/AirdropChecker";
import Admin from "@/pages/Admin";
import Advertisements from "@/pages/Advertisements";
import AuthPage from "@/pages/auth-page";
import Navigation from "@/components/Navigation";
import { AuthProvider } from "@/hooks/use-auth";
import { createDummyAdvertisements } from "@/lib/helpers/db";
import { setupSupabaseTables, createDefaultAdminUser } from "@/lib/helpers/supabaseSetup";
import { ProtectedRoute } from "./lib/protected-route";
import { AppConfigProvider } from "./lib/appConfig";

function Router() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/airdrop-checker" component={AirdropChecker} />
          <Route path="/airdrop" component={AirdropChecker} />
          <Route path="/auth" component={AuthPage} />
          
          {/* Protected Admin Routes */}
          <ProtectedRoute path="/admin" component={Admin} />
          <ProtectedRoute path="/admin/advertisements" component={Advertisements} />
          
          <Route component={NotFound} />
        </Switch>
      </main>
      <footer className="py-6 border-t bg-muted/40">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>Monad Wallet Analyzer - Unofficial Tool - {new Date().getFullYear()}</p>
          <p className="mt-1">This tool is not affiliated with Monad Labs. Airdrop eligibility checks are unofficial criteria.</p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  // Log available environment variables (excluding secrets)
  useEffect(() => {
    const envVars = Object.keys(import.meta.env)
      .filter(key => !key.includes('SECRET') && !key.includes('PASSWORD'));
    console.log('Available env vars:', envVars);
    
    // Initialize database and application resources
    const initializeApp = async () => {
      try {
        // Set up database tables
        const tablesSetup = await setupSupabaseTables();
        console.log('Supabase tables setup result:', tablesSetup);
        
        // Create default admin user
        const adminUserCreated = await createDefaultAdminUser();
        console.log('Admin user creation result:', adminUserCreated);
        
        // Initialize dummy advertisements for demo purposes
        const adsCreated = await createDummyAdvertisements();
        if (adsCreated) {
          console.log('Dummy advertisements initialized successfully');
        } else {
          console.warn('Failed to initialize dummy advertisements');
        }
      } catch (error) {
        console.error('Error during app initialization:', error);
      }
    };
    
    initializeApp();
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppConfigProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AppConfigProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
