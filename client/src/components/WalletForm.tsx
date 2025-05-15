import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { WalletAddressSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, Search, ArrowRight, Loader2 } from "lucide-react";

type WalletFormProps = {
  onSubmit: (address: string) => void;
  isLoading: boolean;
};

export default function WalletForm({ onSubmit, isLoading }: WalletFormProps) {
  const formSchema = WalletAddressSchema;
  const [focused, setFocused] = useState(false);
  
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
    <div className="mb-8 animate-fade-in">
      <div className={`bg-white shadow-lg rounded-xl p-8 border border-indigo-50 transition-all duration-300 ${focused ? 'card-glow' : ''}`}>
        <div className="flex items-center mb-4">
          <div className="p-2 bg-gradient-to-r from-indigo-100 to-blue-100 rounded-full mr-3">
            <Search className="h-5 w-5 text-indigo-600" />
          </div>
          <h2 className="text-xl font-bold monad-gradient-text">
            Monad Testnet Wallet Analyzer
          </h2>
        </div>
        
        <p className="text-gray-600 mb-6">
          Enter any Ethereum-compatible wallet address to view its activity on the Monad testnet.
        </p>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <div className="relative">
                    <FormControl>
                      <Input
                        placeholder="0x1234..."
                        {...field}
                        className={`pl-4 pr-10 py-3 text-base rounded-xl bg-gray-50 border 
                                  ${form.formState.errors.address 
                                    ? "border-red-300 focus:border-red-500 focus:ring-red-500" 
                                    : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"} 
                                  transition-all duration-200 shadow-sm`}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                      />
                    </FormControl>
                    {form.formState.errors.address && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      </div>
                    )}
                  </div>
                  {form.formState.errors.address && (
                    <FormMessage className="text-red-500 ml-1 mt-1 flex items-center">
                      <AlertCircle className="h-3.5 w-3.5 mr-1" />
                      {form.formState.errors.address.message}
                    </FormMessage>
                  )}
                  {!form.formState.errors.address && (
                    <p className="text-xs text-gray-500 ml-1 mt-1">
                      Example: 0x1234567890123456789012345678901234567890
                    </p>
                  )}
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 
                       rounded-xl transition-all duration-300 hover:shadow-lg hover:translate-y-[-1px] transform
                       font-medium text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Analyzing Blockchain Data...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  Analyze Wallet
                  <ArrowRight className="h-5 w-5 ml-2" />
                </span>
              )}
            </Button>
          </form>
        </Form>
        
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Connected to Monad Testnet - Secure and private analysis
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
