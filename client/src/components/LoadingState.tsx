import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function LoadingState() {
  return (
    <Card className="bg-white shadow-lg rounded-xl mb-6 overflow-hidden">
      <CardContent className="p-8">
        <div className="flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full h-10 w-10 flex items-center justify-center bg-indigo-100">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="h-6 w-6 text-indigo-500" />
                </motion.div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-6 w-48 animate-shimmer" />
                <Skeleton className="h-4 w-32 animate-shimmer" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className="bg-gray-50 p-4 rounded-lg"
              >
                <Skeleton className="h-4 w-24 mb-2 animate-shimmer" />
                <Skeleton className="h-8 w-full animate-shimmer" />
              </motion.div>
            ))}
          </div>

          <div className="space-y-4 pt-2">
            {[1, 2].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.6 + i * 0.2 }}
                className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-shrink-0">
                  <Skeleton className="h-10 w-10 rounded-full animate-shimmer" />
                </div>
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32 animate-shimmer" />
                  <Skeleton className="h-4 w-48 animate-shimmer" />
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="flex justify-center pt-4">
            <div className="text-indigo-500 text-sm font-medium flex items-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="h-4 w-4" />
              </motion.div>
              <span>Fetching wallet data from Monad testnet...</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
