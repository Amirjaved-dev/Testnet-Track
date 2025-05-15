import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut, Settings } from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();
  const { user, logoutMutation, isLoading } = useAuth();

  return (
    <nav className="bg-gradient-to-r from-primary to-secondary text-white shadow-md">
      <div className="container mx-auto py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-xl font-bold hover:text-white/90">
            Monad Wallet Analyzer
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <Link 
            href="/"
            className={`hover:text-white/80 ${location === '/' ? 'font-bold underline' : ''}`}
          >
            Home
          </Link>
          
          <Link 
            href="/airdrop"
            className={`hover:text-white/80 ${location === '/airdrop' || location === '/airdrop-checker' ? 'font-bold underline' : ''}`}
          >
            Airdrop Checker
          </Link>
          
          {user?.isAdmin && (
            <Link 
              href="/admin"
              className={`hover:text-white/80 flex items-center gap-1 ${location.startsWith('/admin') ? 'font-bold underline' : ''}`}
            >
              <Settings className="h-4 w-4" />
              Admin
            </Link>
          )}
          
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">
                Hi, {user.username}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="hover:bg-white/20 text-white"
              >
                {logoutMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <LogOut className="h-4 w-4 mr-1" />
                    Logout
                  </>
                )}
              </Button>
            </div>
          ) : (
            <Link href="/auth">
              <Button 
                variant="ghost" 
                size="sm"
                className="hover:bg-white/20 text-white"
              >
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}