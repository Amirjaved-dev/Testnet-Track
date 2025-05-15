import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { WalletAddressSchema } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import type { WalletData } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, CheckCircle, XCircle, Search, Loader2, ExternalLink, AlertTriangle, Copy, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import AdvertisementDisplay from "@/components/Advertisement";

export default function AirdropChecker() {
  const { toast } = useToast();
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [showBackground, setShowBackground] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Animate background after initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBackground(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const formSchema = WalletAddressSchema;
  const [focus, setFocus] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: "",
    },
  });

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

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    setWalletAddress(values.address);
    setIsFormSubmitted(true);
  };

  const handleRetry = () => {
    setIsFormSubmitted(false);
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const copyToClipboard = (address: string) => {
    navigator.clipboard.writeText(address);
    setIsCopied(true);
    toast({
      title: "Address copied!",
      description: "Wallet address copied to clipboard",
    });
    
    setTimeout(() => setIsCopied(false), 2000);
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
              <span className="text-gradient animate-glow">Monad Airdrop</span> Checker
            </h1>
          </motion.div>
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <a href="/" className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors">
              Wallet Analyzer
            </a>
            <span className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 rounded-full shadow-sm">
              Unofficial
            </span>
          </motion.div>
        </div>
      </header>

      <main className="flex-1 relative z-10 max-w-4xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Top section with note and ad */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            {/* Note card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="p-4">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                    <div className="text-sm text-yellow-700">
                      <p className="font-medium mb-1">Important Note</p>
                      <p>
                        This is an <strong>unofficial</strong> airdrop eligibility checker created by developers of this tool, not by Monad team. 
                        The criteria used here are speculative and not officially confirmed. Results should be considered for informational purposes only.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          
          {/* Advertisement area */}
          <div className="md:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <AdvertisementDisplay placement="airdrop" className="mb-4" />
            </motion.div>
          </div>
        </div>

        {/* Search form section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="md:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="bg-white shadow-lg rounded-xl p-8 hover-scale mb-8">
                <CardContent className="p-0">
                  <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
                    <span className="text-gradient">Check</span> your airdrop eligibility
                  </h2>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <div 
                              className={`mt-1 relative rounded-lg shadow-sm transition-all duration-300 ${
                                focus ? 'ring-2 ring-indigo-300' : ''
                              } ${form.formState.errors.address ? 'ring-2 ring-red-300' : ''}`}
                            >
                              <FormControl>
                                <Input
                                  placeholder="Enter Ethereum wallet address (0x...)"
                                  {...field}
                                  className={`text-base py-6 border-2 rounded-lg ${
                                    form.formState.errors.address ? "border-red-400 pr-10" : "border-gray-200"
                                  } focus:border-indigo-400 transition-colors duration-200`}
                                  onFocus={() => setFocus(true)}
                                  onBlur={() => setFocus(false)}
                                />
                              </FormControl>
                              {form.formState.errors.address ? (
                                <motion.div 
                                  className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <AlertCircle className="h-5 w-5 text-red-500" />
                                </motion.div>
                              ) : (
                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                                  <Search className="h-5 w-5" />
                                </div>
                              )}
                            </div>
                            <FormMessage className="text-red-500 mt-2 text-sm" />
                          </FormItem>
                        )}
                      />
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button 
                          type="submit" 
                          className={`w-full py-6 rounded-lg text-white font-medium text-lg shadow transition-all duration-300 ${
                            isLoading ? 'bg-indigo-400' : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'
                          }`}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                              <Loader2 className="h-5 w-5 animate-spin" />
                              Checking Eligibility...
                            </span>
                          ) : (
                            "Check Airdrop Eligibility"
                          )}
                        </Button>
                      </motion.div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          
          {/* Ad on the side for desktop */}
          <div className="md:col-span-1 hidden md:block">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <AdvertisementDisplay placement="airdrop-side" className="mb-4" />
            </motion.div>
          </div>
        </div>

        {/* Airdrop criteria information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-white shadow-lg rounded-xl overflow-hidden">
            <CardContent className="p-8">
              <h3 className="text-lg font-bold mb-5">Airdrop Eligibility Criteria</h3>
              
              <div className="space-y-4">
                <div className="flex items-start bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg hover:shadow-md transition-shadow duration-300">
                  <div className="flex-shrink-0 mr-3">
                    <div className="h-8 w-8 bg-blue-100 border border-blue-200 rounded-full flex items-center justify-center shadow-inner">
                      <span className="text-blue-600 font-bold">1</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-800">Ethereum Mainnet Activity</h4>
                    <p className="text-sm text-blue-600">At least 10 transactions on Ethereum Mainnet</p>
                  </div>
                </div>
                
                <div className="flex items-start bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg hover:shadow-md transition-shadow duration-300">
                  <div className="flex-shrink-0 mr-3">
                    <div className="h-8 w-8 bg-purple-100 border border-purple-200 rounded-full flex items-center justify-center shadow-inner">
                      <span className="text-purple-600 font-bold">2</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-purple-800">NADS NFT Ownership</h4>
                    <p className="text-sm text-purple-600">
                      Own at least one NADS NFT 
                      <a 
                        href="https://testnet.monvision.io/token/0x922dA3512e2BEBBe32bccE59adf7E6759fB8CEA2" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 inline-flex items-center ml-1"
                      >
                        (View on Explorer <ExternalLink className="h-3 w-3 ml-0.5" />)
                      </a>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg hover:shadow-md transition-shadow duration-300">
                  <div className="flex-shrink-0 mr-3">
                    <div className="h-8 w-8 bg-green-100 border border-green-200 rounded-full flex items-center justify-center shadow-inner">
                      <span className="text-green-600 font-bold">3</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-green-800">MON Token Balance</h4>
                    <p className="text-sm text-green-600">At least 10 MON tokens on Monad testnet</p>
                  </div>
                </div>
                
                <div className="flex items-start bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg hover:shadow-md transition-shadow duration-300">
                  <div className="flex-shrink-0 mr-3">
                    <div className="h-8 w-8 bg-orange-100 border border-orange-200 rounded-full flex items-center justify-center shadow-inner">
                      <span className="text-orange-600 font-bold">4</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-orange-800">Monad Testnet Activity</h4>
                    <p className="text-sm text-orange-600">At least 200 transactions on Monad testnet</p>
                  </div>
                </div>
                
                <div className="flex items-start bg-gradient-to-r from-indigo-50 to-indigo-100 p-4 rounded-lg hover:shadow-md transition-shadow duration-300">
                  <div className="flex-shrink-0 mr-3">
                    <div className="h-8 w-8 bg-indigo-100 border border-indigo-200 rounded-full flex items-center justify-center shadow-inner">
                      <span className="text-indigo-600 font-bold">5</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-indigo-800">Early Adopter Status</h4>
                    <p className="text-sm text-indigo-600">Had transactions on Monad testnet before February 26, 2025</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results Section */}
        <AnimatePresence>
          {!isLoading && !isError && isFormSubmitted && walletData && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-white shadow-lg rounded-xl overflow-hidden mb-8">
                <div className={`px-8 py-4 ${walletData.airdropEligibility.isEligible ? 'bg-green-50 border-b border-green-100' : 'bg-red-50 border-b border-red-100'}`}>
                  <div className="flex items-center">
                    {walletData.airdropEligibility.isEligible ? (
                      <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-500 mr-3" />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold">
                        {walletData.airdropEligibility.isEligible 
                          ? "Eligible for Airdrop" 
                          : "Not Eligible for Airdrop"}
                      </h3>
                      <div className="flex items-center mt-1">
                        <span className="text-sm text-gray-600 mr-2">Wallet:</span>
                        <span className="text-sm font-medium">{formatAddress(walletAddress)}</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => copyToClipboard(walletAddress)}
                                className="ml-2 text-indigo-500 hover:text-indigo-700"
                              >
                                {isCopied ? (
                                  <CheckCircle className="h-4 w-4" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Copy address</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-lg mb-3">Criteria Check Results</h4>
                    
                    <div className="grid grid-cols-1 gap-3">
                      {Object.entries(walletData.airdropEligibility.criteria).map(([key, value], index) => {
                        const criteriaLabel = {
                          'ethereumActivity': 'Ethereum Mainnet Activity',
                          'nftOwnership': 'NADS NFT Ownership',
                          'tokenBalance': 'MON Token Balance',
                          'monadActivity': 'Monad Testnet Activity',
                          'earlyAdopter': 'Early Adopter Status',
                        }[key] || key;
                        
                        const criteriaDescription = {
                          'ethereumActivity': 'At least 10 transactions on Ethereum Mainnet',
                          'nftOwnership': 'Own at least one NADS NFT',
                          'tokenBalance': 'At least 10 MON tokens on Monad testnet',
                          'monadActivity': 'At least 200 transactions on Monad testnet',
                          'earlyAdopter': 'Had transactions on Monad testnet before February 26, 2025',
                        }[key] || '';
                        
                        return (
                          <div 
                            key={key}
                            className={`flex items-center p-4 rounded-lg ${
                              value ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'
                            }`}
                          >
                            <div className={`flex-shrink-0 mr-3 h-8 w-8 rounded-full flex items-center justify-center ${
                              value ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                              {value ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-600" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{criteriaLabel}</div>
                              <div className="text-sm text-gray-600">{criteriaDescription}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="pt-4 border-t border-gray-100 mt-6">
                      <Button 
                        onClick={handleRetry}
                        variant="outline"
                        className="border-indigo-200 hover:bg-indigo-50 text-indigo-700"
                      >
                        Check Another Wallet
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
          
          {!isLoading && isError && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-white shadow-lg rounded-xl overflow-hidden mb-8 border-red-200">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center py-4">
                    <div className="bg-red-100 rounded-full p-3 mb-4">
                      <AlertCircle className="h-8 w-8 text-red-500" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Error Checking Wallet</h3>
                    <p className="text-gray-600 mb-6 max-w-md">
                      We couldn't retrieve information for the provided wallet address. 
                      This could be due to network issues or the address may not be valid on Monad testnet.
                    </p>
                    <Button 
                      onClick={handleRetry}
                      className="border-2 border-red-200 bg-red-50 hover:bg-red-100 text-red-600"
                    >
                      Try Again
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="relative z-10 bg-white border-t border-gray-200 mt-10">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <p className="text-center text-sm text-gray-500">
              <span className="font-medium">DISCLAIMER:</span> This is an unofficial tool for checking potential Monad airdrop eligibility.
              This tool does not guarantee any airdrop rewards. Connected to <span className="font-medium">Monad Testnet</span> •{" "}
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