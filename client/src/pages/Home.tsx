import { useState, useEffect } from "react";
import WalletForm from "@/components/WalletForm";
import WalletDetails from "@/components/WalletDetails";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import { useQuery } from "@tanstack/react-query";
import type { WalletData } from "@shared/schema";
import { CircleHelp, ExternalLink, Github } from "lucide-react";

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);

  // Page load animation
  useEffect(() => {
    setPageLoaded(true);
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
    // Scroll down to results when form is submitted
    setTimeout(() => {
      window.scrollTo({
        top: 300,
        behavior: 'smooth'
      });
    }, 100);
  };

  const handleRetry = () => {
    setIsFormSubmitted(false);
  };

  return (
    <div className={`min-h-screen flex flex-col transition-opacity duration-500 ${pageLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <header className="bg-white shadow-md relative z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-blue-500/5"></div>
        <div className="max-w-5xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between relative">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-indigo-600 to-blue-500 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold shadow-md">
              <span className="text-xl">M</span>
            </div>
            <h1 className="text-2xl font-bold monad-gradient-text">Monad Wallet Analyzer</h1>
          </div>
          <div className="flex items-center space-x-3">
            <a 
              href="https://github.com/monad-xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
            <span className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-full shadow-sm">
              Testnet
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-5xl">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold mb-3 monad-gradient-text">
              Blockchain Wallet Analysis
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Analyze and explore wallet activity on the Monad testnet. 
              Enter any Ethereum-compatible address to view detailed analytics, including transaction history, 
              NFT ownership verification, and early adopter status.
            </p>
          </div>
          
          <WalletForm onSubmit={handleSubmit} isLoading={isLoading} />

          {isLoading && <LoadingState />}
          
          {!isLoading && !isError && walletData && (
            <WalletDetails walletData={walletData} />
          )}
          
          {isError && (
            <ErrorState 
              error={error as Error} 
              onRetry={handleRetry} 
            />
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-gradient-to-br from-indigo-600/90 to-blue-500/90 rounded-full w-6 h-6 flex items-center justify-center text-white shadow-sm">
                  <span className="text-sm">M</span>
                </div>
                <h4 className="text-lg font-semibold">Monad Wallet Analyzer</h4>
              </div>
              <p className="text-sm text-gray-500 max-w-md">
                A tool for blockchain explorers to analyze wallet activity on the Monad testnet.
                Easily verify transaction history, NFT ownership, and early adopter status.
              </p>
            </div>
            
            <div className="flex flex-col md:items-end">
              <div className="flex items-center mb-3">
                <CircleHelp className="h-4 w-4 mr-2 text-indigo-500" />
                <span className="text-sm font-medium">Resources</span>
              </div>
              <div className="flex flex-col space-y-2">
                <a
                  href="https://testnet-rpc.monad.xyz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                  Monad Testnet RPC
                </a>
                <a
                  href="https://testnet-rpc.monad.xyz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                  Documentation
                </a>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-center text-xs text-gray-500">
              © {new Date().getFullYear()} Monad Wallet Analyzer. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
