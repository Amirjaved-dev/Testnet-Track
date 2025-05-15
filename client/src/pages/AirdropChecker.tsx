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
import { Link } from "wouter";

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
              <span className="text-gradient">Monad Airdrop</span> Checker
            </h1>
          </motion.div>
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link href="/" className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors">
              Wallet Analyzer
            </Link>
            <span className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 rounded-full shadow-sm">
              Unofficial
            </span>
          </motion.div>
        </div>
      </header>

      <main className="flex-1 relative z-10 max-w-4xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
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

        {/* Search form */}
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
                <div className="flex items-start bg-gray-50 p-4 rounded-lg">
                  <div className="flex-shrink-0 mr-3">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold">1</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium">Ethereum Mainnet Activity</h4>
                    <p className="text-sm text-gray-600">At least 10 transactions on Ethereum Mainnet</p>
                  </div>
                </div>
                
                <div className="flex items-start bg-gray-50 p-4 rounded-lg">
                  <div className="flex-shrink-0 mr-3">
                    <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-bold">2</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium">NADS NFT Ownership</h4>
                    <p className="text-sm text-gray-600">
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
                
                <div className="flex items-start bg-gray-50 p-4 rounded-lg">
                  <div className="flex-shrink-0 mr-3">
                    <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold">3</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium">MON Token Balance</h4>
                    <p className="text-sm text-gray-600">At least 10 MON tokens on Monad testnet</p>
                  </div>
                </div>
                
                <div className="flex items-start bg-gray-50 p-4 rounded-lg">
                  <div className="flex-shrink-0 mr-3">
                    <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 font-bold">4</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium">Monad Testnet Activity</h4>
                    <p className="text-sm text-gray-600">At least 200 transactions on Monad testnet</p>
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
                      <>
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <h3 className="font-bold text-green-800">Eligible for Airdrop</h3>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-600 mr-2" />
                        <h3 className="font-bold text-red-800">Not Eligible for Airdrop</h3>
                      </>
                    )}
                  </div>
                </div>
                <CardContent className="p-8">
                  {/* Wallet Information */}
                  <div className="mb-6 pb-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="px-3 py-2 bg-gray-100 rounded-lg font-mono text-sm">
                          {formatAddress(walletData.address)}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-indigo-600 hover:text-indigo-800 p-1 rounded-full h-8 w-8 flex items-center justify-center" 
                          onClick={() => copyToClipboard(walletData.address)}
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
                      <div className="flex gap-2">
                        <a
                          href={`https://etherscan.io/address/${walletData.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                        >
                          Etherscan <ExternalLink className="h-3 w-3" />
                        </a>
                        <a
                          href={`https://explorer.testnet.monad.xyz/address/${walletData.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                        >
                          Monad Explorer <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  {/* Status message */}
                  <div className="mb-6">
                    <p className={`text-base ${walletData.airdropEligibility.isEligible ? 'text-green-700' : 'text-red-700'}`}>
                      {walletData.airdropEligibility.message}
                    </p>
                  </div>
                  
                  {/* Criteria Results */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-base mb-4">Criteria Results:</h4>
                    
                    {/* ETH Mainnet Transactions */}
                    <div className={`flex items-center p-4 rounded-lg ${
                      walletData.airdropEligibility.criteria.ethTransactions.isEligible 
                        ? 'bg-green-50 border border-green-100' 
                        : 'bg-red-50 border border-red-100'
                    }`}>
                      <div className="flex-shrink-0 mr-4">
                        {walletData.airdropEligibility.criteria.ethTransactions.isEligible ? (
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        ) : (
                          <XCircle className="h-6 w-6 text-red-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">ETH Mainnet Transactions</p>
                        <p className="text-sm">
                          Required: {walletData.airdropEligibility.criteria.ethTransactions.required} transactions | 
                          Actual: {walletData.airdropEligibility.criteria.ethTransactions.actual} transactions
                        </p>
                      </div>
                    </div>
                    
                    {/* NADS NFT Ownership */}
                    <div className={`flex items-center p-4 rounded-lg ${
                      walletData.airdropEligibility.criteria.nadsNft.isEligible 
                        ? 'bg-green-50 border border-green-100' 
                        : 'bg-red-50 border border-red-100'
                    }`}>
                      <div className="flex-shrink-0 mr-4">
                        {walletData.airdropEligibility.criteria.nadsNft.isEligible ? (
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        ) : (
                          <XCircle className="h-6 w-6 text-red-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">NADS NFT Ownership</p>
                        <p className="text-sm">
                          Required: At least one NFT | 
                          Status: {walletData.airdropEligibility.criteria.nadsNft.actual ? 'Owns NFT' : 'No NFT'}
                        </p>
                      </div>
                    </div>
                    
                    {/* MON Token Balance */}
                    <div className={`flex items-center p-4 rounded-lg ${
                      walletData.airdropEligibility.criteria.monBalance.isEligible 
                        ? 'bg-green-50 border border-green-100' 
                        : 'bg-red-50 border border-red-100'
                    }`}>
                      <div className="flex-shrink-0 mr-4">
                        {walletData.airdropEligibility.criteria.monBalance.isEligible ? (
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        ) : (
                          <XCircle className="h-6 w-6 text-red-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">MON Token Balance</p>
                        <p className="text-sm">
                          Required: {walletData.airdropEligibility.criteria.monBalance.required} | 
                          Actual: {walletData.airdropEligibility.criteria.monBalance.actual}
                        </p>
                      </div>
                    </div>
                    
                    {/* Monad Testnet Transactions */}
                    <div className={`flex items-center p-4 rounded-lg ${
                      walletData.airdropEligibility.criteria.monadTransactions.isEligible 
                        ? 'bg-green-50 border border-green-100' 
                        : 'bg-red-50 border border-red-100'
                    }`}>
                      <div className="flex-shrink-0 mr-4">
                        {walletData.airdropEligibility.criteria.monadTransactions.isEligible ? (
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        ) : (
                          <XCircle className="h-6 w-6 text-red-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Monad Testnet Transactions</p>
                        <p className="text-sm">
                          Required: {walletData.airdropEligibility.criteria.monadTransactions.required} transactions | 
                          Actual: {walletData.airdropEligibility.criteria.monadTransactions.actual} transactions
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {isError && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
              className="mb-8"
            >
              <Card className="bg-white shadow-lg rounded-xl overflow-hidden border border-red-100">
                <div className="bg-red-50 py-2 px-6 border-b border-red-100">
                  <div className="flex items-center text-red-700">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    <span className="font-medium">Error Encountered</span>
                  </div>
                </div>
                <CardContent className="p-8">
                  <div className="text-center">
                    <motion.div 
                      className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-5"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <AlertCircle className="h-8 w-8 text-red-600" />
                    </motion.div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Failed to check eligibility</h3>
                    
                    <div className="mb-6">
                      <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                      >
                        <p className="text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-100 inline-block max-w-md">
                          {(error as Error)?.message || "There was an error processing your request. Please try again."}
                        </p>
                      </motion.div>
                    </div>
                    
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        onClick={handleRetry} 
                        variant="default" 
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-5 px-6 rounded-lg font-medium inline-flex items-center gap-2 shadow-md transition-all duration-300"
                      >
                        <Loader2 className="h-5 w-5" />
                        <span>Try Again</span>
                      </Button>
                    </motion.div>
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