import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { WalletAddressSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

type WalletFormProps = {
  onSubmit: (address: string) => void;
  isLoading: boolean;
};

export default function WalletForm({ onSubmit, isLoading }: WalletFormProps) {
  const formSchema = WalletAddressSchema;
  
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
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Enter a Monad testnet wallet address</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <FormControl>
                      <Input
                        placeholder="0x..."
                        {...field}
                        className={form.formState.errors.address ? "border-red-500 pr-10" : ""}
                      />
                    </FormControl>
                    {form.formState.errors.address && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      </div>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Analyzing..." : "Analyze Wallet"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
