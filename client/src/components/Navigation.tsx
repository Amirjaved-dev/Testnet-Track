import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default function Navigation() {
  const [location] = useLocation();
  const { user, isAdmin, signOut } = useAuth();

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
            className={`hover:text-white/80 ${location === '/airdrop' ? 'font-bold underline' : ''}`}
          >
            Airdrop Checker
          </Link>
          
          <Link 
            href="/admin"
            className={`hover:text-white/80 ${location === '/admin' ? 'font-bold underline' : ''}`}
          >
            Admin Panel
          </Link>
        </div>
      </div>
    </nav>
  );
}