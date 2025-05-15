import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WalletData } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Copy, CheckCircle, ExternalLink, TrendingUp, Calendar, Code, Wallet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface WalletDetailsProps {
  walletData: WalletData;
}

export default function WalletDetails({ walletData }: WalletDetailsProps) {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 1500);
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
    { 
      label: "Total Transactions", 
      value: walletData.totalTransactions, 
      icon: <TrendingUp className="h-5 w-5 text-indigo-500" />,
      color: "from-indigo-50 to-purple-50"
    },
    { 
      label: "Last Activity", 
      value: walletData.lastActivity, 
      icon: <Calendar className="h-5 w-5 text-blue-500" />,
      color: "from-blue-50 to-indigo-50"
    },
    { 
      label: "Contracts Interacted", 
      value: walletData.uniqueContracts, 
      icon: <Code className="h-5 w-5 text-purple-500" />,
      color: "from-purple-50 to-indigo-50"
    },
    { 
      label: "MON Balance", 
      value: walletData.balance, 
      icon: <Wallet className="h-5 w-5 text-green-500" />,
      color: "from-green-50 to-teal-50"
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="animate-slide-up"
    >
      <Card className="bg-white shadow-lg rounded-xl overflow-hidden mb-6 hover-scale">
        <CardContent className="p-8">
          <div className="border-b border-gray-200 pb-6 mb-6">
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-xl font-bold mb-3 flex items-center">
                <span className="text-gradient">Wallet</span> Analysis Results
              </h2>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="px-3 py-2 bg-gray-100 rounded-lg font-mono text-sm">
                    {formatAddress(walletData.address)}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-indigo-600 hover:text-indigo-800 p-1 rounded-full h-8 w-8 flex items-center justify-center" 
                    onClick={copyToClipboard}
                  >
                    <AnimatePresence>
                      {isCopied ? (
                        <motion.div
                          key="check"
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.5, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="copy"
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.5, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Copy className="h-4 w-4" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                </div>
                <a
                  href={`https://explorer.testnet.monad.xyz/address/${walletData.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                >
                  View on Explorer <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className={`bg-gradient-to-br ${stat.color} p-5 rounded-xl shadow-sm`}
              >
                <div className="flex items-center mb-2 text-gray-500">
                  {stat.icon}
                  <p className="text-sm ml-2">{stat.label}</p>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          <div className="space-y-5">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex items-center p-5 bg-gradient-to-r from-gray-50 to-white rounded-xl shadow-sm border border-gray-100"
            >
              <div className={`
                flex-shrink-0 h-12 w-12 rounded-full 
                flex items-center justify-center shadow-inner
                ${walletData.hasNft 
                  ? 'bg-gradient-to-br from-green-100 to-emerald-50' 
                  : 'bg-gradient-to-br from-gray-100 to-gray-50'}
              `}>
                <AnimatePresence>
                  {animationComplete && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 10 }}
                    >
                      {walletData.hasNft ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : (
                        <svg className="h-6 w-6 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M15 4H18C19.1046 4 20 4.89543 20 6V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V6C4 4.89543 4.89543 4 6 4H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          <path d="M12 12C13.1046 12 14 11.1046 14 10C14 8.89543 13.1046 8 12 8C10.8954 8 10 8.89543 10 10C10 11.1046 10.8954 12 12 12Z" stroke="currentColor" strokeWidth="2" />
                          <path d="M8 16.8571C8 14.6057 9.79086 12.8571 12 12.8571C14.2091 12.8571 16 14.6057 16 16.8571" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="ml-5 flex-1">
                <h3 className="font-semibold text-gray-800">NFT Status</h3>
                <p className="text-sm mt-1">
                  {walletData.hasNft ? (
                    <span className="text-green-600 font-medium flex items-center">
                      <CheckCircle className="mr-1 h-4 w-4" /> Owns NFT from the required contract
                    </span>
                  ) : (
                    <span className="text-gray-500">No NFTs from the required contract</span>
                  )}
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex items-center p-5 bg-gradient-to-r from-gray-50 to-white rounded-xl shadow-sm border border-gray-100"
            >
              <div className={`
                flex-shrink-0 h-12 w-12 rounded-full 
                flex items-center justify-center shadow-inner
                ${walletData.isEarlyAdopter 
                  ? 'bg-gradient-to-br from-indigo-100 to-purple-50' 
                  : 'bg-gradient-to-br from-gray-100 to-gray-50'}
              `}>
                <AnimatePresence>
                  {animationComplete && (
                    <motion.div
                      initial={{ scale: 0, rotateZ: -45, opacity: 0 }}
                      animate={{ scale: 1, rotateZ: 0, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.1 }}
                    >
                      <span className="text-xl">🏅</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="ml-5 flex-1">
                <h3 className="font-semibold text-gray-800">User Status</h3>
                <p className="text-sm mt-1">
                  {walletData.isEarlyAdopter ? (
                    <span className="text-indigo-600 font-medium flex items-center">
                      🏅 Early Adopter (active before Feb 26, 2025)
                    </span>
                  ) : (
                    <span className="text-gray-500">No badges earned yet</span>
                  )}
                </p>
              </div>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
