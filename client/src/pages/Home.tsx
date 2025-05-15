import { useState, useEffect } from "react";
import WalletForm from "@/components/WalletForm";
import WalletDetails from "@/components/WalletDetails";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import { useQuery } from "@tanstack/react-query";
import type { WalletData } from "@shared/schema";
import { motion } from "framer-motion";

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [showBackground, setShowBackground] = useState(false);

  // Animate background after initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBackground(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const { 
    data: walletData, 
    error, 
    isLoading, 
    isError, 
    refetch 
  } = useQuery<WalletData>({
    queryKey: [walletAddress ? `/api/wallet/${walletAddress}` : null],
    enabled: !!walletAddress && isFormSubmitted,
  });

  const handleSubmit = (address: string) => {
    setWalletAddress(address);
    setIsFormSubmitted(true);
  };

  const handleRetry = () => {
    setIsFormSubmitted(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Animated background pattern */}
      <div 
        className={`fixed inset-0 z-0 opacity-10 pointer-events-none transition-opacity duration-1000 ${
          showBackground ? 'opacity-20' : 'opacity-0'
        }`}
        style={{
          backgroundImage: 'radial-gradient(circle at 25px 25px, #6366f1 2px, transparent 0), radial-gradient(circle at 75px 75px, #8b5cf6 2px, transparent 0)',
          backgroundSize: '100px 100px'
        }}
      />

      <header className="relative z-10 bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-5 sm:px-6 lg:px-8 flex items-center justify-between">
          <motion.div 
            className="flex items-center space-x-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold shadow-md animate-pulse-shadow">
              <span className="text-xl">M</span>
            </div>
            <h1 className="text-2xl font-bold">
              <span className="text-gradient">Monad Wallet</span> Analyzer
            </h1>
          </motion.div>
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <a href="/airdrop" className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors">
              Airdrop Checker
            </a>
            <span className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 rounded-full shadow-sm">
              Testnet
            </span>
          </motion.div>
        </div>
      </header>

      <main className="flex-1 relative z-10 max-w-4xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <WalletForm onSubmit={handleSubmit} isLoading={isLoading} />
        </motion.div>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <LoadingState />
          </motion.div>
        )}
        
        {!isLoading && !isError && walletData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <WalletDetails walletData={walletData} />
          </motion.div>
        )}
        
        {isError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <ErrorState 
              error={error as Error} 
              onRetry={handleRetry} 
            />
          </motion.div>
        )}
      </main>

      <footer className="relative z-10 bg-white border-t border-gray-200 mt-10">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <p className="text-center text-sm text-gray-500">
              Connected to <span className="font-medium">Monad Testnet</span> •{" "}
              <a
                href="https://testnet-rpc.monad.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                https://testnet-rpc.monad.xyz
              </a>
            </p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
