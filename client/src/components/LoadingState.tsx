import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingState() {
  return (
    <div className="animate-fade-in">
      <Card className="bg-white shadow-lg rounded-xl border border-indigo-50 mb-6 overflow-hidden card-glow">
        <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-500 shimmer"></div>
        <CardContent className="p-6">
          <div className="flex flex-col space-y-6">
            <div className="flex items-center">
              <Skeleton className="h-12 w-12 rounded-full mr-3" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-50 p-4 rounded-xl border border-gray-100 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10 shimmer"></div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </div>
              ))}
            </div>
            
            <div className="flex flex-col space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                <div className="space-y-2 flex-grow">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                <div className="space-y-2 flex-grow">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </div>
            
            <div className="flex justify-center animate-pulse-slow opacity-70">
              <div className="flex items-center text-sm text-gray-500">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Fetching data from Monad blockchain...
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
