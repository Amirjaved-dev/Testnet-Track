import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();
  const { user } = useAuth();

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
          
          {user?.isAdmin ? (
            // Show admin link if logged in as admin
            <Link 
              href="/admin"
              className={`hover:text-white/80 flex items-center gap-1 ${location.startsWith('/admin') ? 'font-bold underline' : ''}`}
            >
              <Settings className="h-4 w-4" />
              Admin
            </Link>
          ) : (
            // Show admin login link if not logged in
            <Link 
              href="/admin/login"
              className={`hover:text-white/80 ${location === '/admin/login' ? 'font-bold underline' : ''}`}
            >
              Admin
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}