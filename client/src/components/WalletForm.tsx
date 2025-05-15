import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { WalletAddressSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, Search, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

type WalletFormProps = {
  onSubmit: (address: string) => void;
  isLoading: boolean;
};

export default function WalletForm({ onSubmit, isLoading }: WalletFormProps) {
  const formSchema = WalletAddressSchema;
  const [focus, setFocus] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: "",
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values.address);
  };

  return (
    <div className="mb-8">
      <motion.div 
        className="bg-white shadow-lg rounded-xl p-8 hover-scale"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        whileHover={{ boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.1), 0 8px 10px -6px rgba(99, 102, 241, 0.1)" }}
      >
        <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
          <span className="text-gradient">Analyze</span> a Monad testnet wallet
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
                    Analyzing Wallet...
                  </span>
                ) : (
                  "Analyze Wallet"
                )}
              </Button>
            </motion.div>
            {!isLoading && (
              <p className="text-xs text-center text-gray-500 mt-3">
                Enter any Ethereum-compatible wallet address to analyze its activity on Monad testnet
              </p>
            )}
          </form>
        </Form>
      </motion.div>
    </div>
  );
}
