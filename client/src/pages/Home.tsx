import { useState } from "react";
import WalletForm from "@/components/WalletForm";
import WalletDetails from "@/components/WalletDetails";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import { useQuery } from "@tanstack/react-query";
import type { WalletData } from "@shared/schema";

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);

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
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-500 rounded-full w-8 h-8 flex items-center justify-center text-white font-bold">
              M
            </div>
            <h1 className="text-xl font-semibold">Monad Wallet Analyzer</h1>
          </div>
          <span className="px-3 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
            Testnet
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
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
      </main>

      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            Connected to Monad Testnet •{" "}
            <a
              href="https://testnet-rpc.monad.xyz"
              target="_blank"
              className="text-indigo-600 hover:text-indigo-800"
            >
              https://testnet-rpc.monad.xyz
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
