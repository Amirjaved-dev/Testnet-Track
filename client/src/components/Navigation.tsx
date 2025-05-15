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
          
          {user ? (
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link 
                  href="/admin"
                  className={`hover:text-white/80 ${location === '/admin' ? 'font-bold underline' : ''}`}
                >
                  Admin Panel
                </Link>
              )}
              
              <Button 
                variant="secondary" 
                className="bg-white/20 hover:bg-white/30 text-white"
                onClick={() => signOut()}
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link 
                href="/login"
                className={`hover:text-white/80 ${location === '/login' ? 'font-bold underline' : ''}`}
              >
                Login
              </Link>
              
              <Button 
                variant="secondary" 
                className="bg-white/20 hover:bg-white/30 text-white"
                onClick={() => window.location.href = '/register'}
              >
                Register
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}