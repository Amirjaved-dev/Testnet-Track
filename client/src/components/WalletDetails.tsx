import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WalletData } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Copy, CheckCircle, Layers, Clock, Code, Wallet, Award, Medal } from "lucide-react";

interface WalletDetailsProps {
  walletData: WalletData;
}

export default function WalletDetails({ walletData }: WalletDetailsProps) {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [countUp, setCountUp] = useState(false);

  // Animation sequencing
  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setCountUp(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

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
    { label: "Total Transactions", value: walletData.totalTransactions, icon: <Layers className="h-5 w-5 text-blue-500" /> },
    { label: "Last Activity", value: walletData.lastActivity, icon: <Clock className="h-5 w-5 text-purple-500" /> },
    { label: "Contracts Interacted", value: walletData.uniqueContracts, icon: <Code className="h-5 w-5 text-indigo-500" /> },
    { label: "MON Balance", value: walletData.balance, icon: <Wallet className="h-5 w-5 text-teal-500" /> },
  ];

  return (
    <div className={`transition-all duration-500 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <Card className="bg-white shadow-lg rounded-xl overflow-hidden border border-indigo-50 card-glow mb-6">
        <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-500"></div>
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold monad-gradient-text">Wallet Analysis</h2>
              <div className="flex items-center mt-1">
                <div className="px-2 py-1 bg-gray-100 rounded-md flex items-center mt-1">
                  <span className="font-mono text-sm text-gray-700">{formatAddress(walletData.address)}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-1 text-indigo-600 hover:text-indigo-800 p-1 h-auto" 
                    onClick={copyToClipboard}
                  >
                    {isCopied ? 
                      <CheckCircle className="h-4 w-4 text-green-500" /> : 
                      <Copy className="h-4 w-4" />
                    }
                  </Button>
                </div>
              </div>
            </div>
            <div className="glass px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm">
              Monad Testnet
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className={`bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-blue-200 transition-all duration-300 
                          transform hover:-translate-y-1 hover:shadow-md 
                          animate-fade-in`} 
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center mb-2">
                  {stat.icon}
                  <p className="text-sm font-medium text-gray-600 ml-1.5">{stat.label}</p>
                </div>
                <p className="text-2xl font-bold text-gray-800">
                  {typeof stat.value === 'number' && countUp ? (
                    <span 
                      className="counter" 
                      style={{ "--target-count": stat.value } as React.CSSProperties}
                    >{stat.value}</span>
                  ) : stat.value}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-4 mt-6">
            <div 
              className={`flex items-center p-5 bg-gray-50 rounded-xl border border-gray-100 
                        hover:shadow-md transition-all duration-300 animate-fade-in`}
              style={{ animationDelay: '400ms' }}
            >
              <div className="flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center">
                {walletData.hasNft ? (
                  <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-full">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                ) : (
                  <div className="p-2 bg-gray-200 rounded-full">
                    <Award className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="ml-4 flex-1">
                <h3 className="font-semibold text-gray-800">NFT Status</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {walletData.hasNft ? (
                    <span className="badge badge-nft flex w-fit items-center px-3 py-1">
                      <CheckCircle className="mr-1 h-3.5 w-3.5" /> Owns required NFT
                    </span>
                  ) : (
                    <span className="text-gray-500">No NFTs from required contract</span>
                  )}
                </p>
              </div>
            </div>

            <div 
              className={`flex items-center p-5 bg-gray-50 rounded-xl border border-gray-100 
                        hover:shadow-md transition-all duration-300 animate-fade-in`}
              style={{ animationDelay: '500ms' }}
            >
              <div className="flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center">
                {walletData.isEarlyAdopter ? (
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full">
                    <Medal className="h-6 w-6 text-white" />
                  </div>
                ) : (
                  <div className="p-2 bg-gray-200 rounded-full">
                    <Medal className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="ml-4 flex-1">
                <h3 className="font-semibold text-gray-800">Badge</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {walletData.isEarlyAdopter ? (
                    <span className="badge badge-early flex w-fit items-center px-3 py-1">
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
    </div>
  );
}
