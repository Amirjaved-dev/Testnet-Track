import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, XOctagon } from "lucide-react";

interface ErrorStateProps {
  error: Error;
  onRetry: () => void;
}

export default function ErrorState({ error, onRetry }: ErrorStateProps) {
  const errorMessage = error?.message || "There was an error processing your request. Please try again.";

  return (
    <div className="animate-fade-in">
      <Card className="bg-white shadow-lg rounded-xl border border-red-100 mb-6 overflow-hidden">
        <div className="h-2 w-full bg-gradient-to-r from-red-500 via-orange-500 to-red-500"></div>
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 relative">
              <div className="absolute inset-0 bg-red-100 rounded-full animate-pulse-slow opacity-70"></div>
              <div className="relative mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                <XOctagon className="h-8 w-8 text-red-600" />
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">Connection Error</h3>
            
            <div className="mb-6 max-w-md">
              <p className="text-gray-600">{errorMessage}</p>
              <p className="text-sm text-gray-500 mt-2">
                This might be due to network connectivity or blockchain RPC limitations.
              </p>
            </div>
            
            <Button 
              onClick={onRetry} 
              variant="default" 
              className="bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white shadow-md 
                         transition-all hover:shadow-lg hover:scale-105 duration-300 inline-flex items-center gap-2 px-6 py-2"
            >
              <RefreshCw className="h-4 w-4 animate-spin-slow" />
              Try Again
            </Button>
            
            <div className="w-full mt-6 pt-6 border-t border-gray-100">
              <div className="flex justify-center items-center">
                <div className="p-2 bg-red-50 rounded-full">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
                <p className="text-xs text-gray-500 ml-2">
                  If the problem persists, try again with a different wallet address.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
