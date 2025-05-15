import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WalletData } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Copy, CheckCircle } from "lucide-react";

interface WalletDetailsProps {
  walletData: WalletData;
}

export default function WalletDetails({ walletData }: WalletDetailsProps) {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(walletData.address);
    setIsCopied(true);
    toast({
      title: "Address copied!",
      description: "Wallet address copied to clipboard",
    });
    
    setTimeout(() => setIsCopied(false), 2000);
  };

  const stats = [
    { label: "Total Transactions", value: walletData.totalTransactions },
    { label: "Last Activity", value: walletData.lastActivity },
    { label: "Contracts Interacted With", value: walletData.uniqueContracts },
    { label: "MON Balance", value: walletData.balance },
  ];

  return (
    <Card className="bg-white shadow mb-4">
      <CardContent className="p-6">
        <div className="border-b border-gray-200 pb-4 mb-4">
          <h2 className="text-lg font-medium">Wallet Summary</h2>
          <p className="text-sm text-gray-500 mt-1 flex items-center">
            <span className="font-mono">{formatAddress(walletData.address)}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-2 text-indigo-600 hover:text-indigo-800 p-1 h-auto" 
              onClick={copyToClipboard}
            >
              {isCopied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-semibold">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="font-medium">NFT Status</h3>
              <p className="text-sm text-gray-500">
                {walletData.hasNft ? (
                  <span className="text-green-500 flex items-center">
                    <CheckCircle className="mr-1 h-4 w-4" /> Owns required NFT
                  </span>
                ) : (
                  <span className="text-gray-500">No NFTs from the required contract</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-xl">🏅</span>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="font-medium">Badge</h3>
              <p className="text-sm text-gray-500">
                {walletData.isEarlyAdopter ? (
                  <span className="text-indigo-500 flex items-center">
                    🏅 Early Adopter
                  </span>
                ) : (
                  <span className="text-gray-500">No badges earned yet</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
