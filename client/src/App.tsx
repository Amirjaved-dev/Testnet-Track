import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import AirdropChecker from "@/pages/AirdropChecker";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Admin from "@/pages/Admin";
import Advertisements from "@/pages/Advertisements";
import Navigation from "@/components/Navigation";
import { AuthProvider } from "@/lib/auth";

function Router() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/airdrop" component={AirdropChecker} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/admin" component={Admin} />
          <Route path="/admin/advertisements" component={Advertisements} />
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
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
