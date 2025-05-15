import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface ErrorStateProps {
  error: Error;
  onRetry: () => void;
}

export default function ErrorState({ error, onRetry }: ErrorStateProps) {
  const errorMessage = error?.message || "There was an error processing your request. Please try again.";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
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
            
            <h3 className="text-xl font-bold text-gray-900 mb-3">Something went wrong</h3>
            
            <div className="mb-6">
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <p className="text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-100 inline-block max-w-md">
                  {errorMessage}
                </p>
              </motion.div>
            </div>
            
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                onClick={onRetry} 
                variant="default" 
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-5 px-6 rounded-lg font-medium inline-flex items-center gap-2 shadow-md transition-all duration-300"
              >
                <RefreshCw className="h-5 w-5" />
                <span>Try Again</span>
              </Button>
            </motion.div>
            
            <p className="text-xs text-gray-500 mt-6">
              If the issue persists, please try with a different wallet address or check your network connection.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
