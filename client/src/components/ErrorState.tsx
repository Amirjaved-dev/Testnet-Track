import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  error: Error;
  onRetry: () => void;
}

export default function ErrorState({ error, onRetry }: ErrorStateProps) {
  const errorMessage = error?.message || "There was an error processing your request. Please try again.";

  return (
    <Card className="bg-white shadow rounded-lg">
      <CardContent className="p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="mt-2 text-lg font-medium text-gray-900">Error</h3>
          <div className="mt-2">
            <p className="text-sm text-gray-500">{errorMessage}</p>
          </div>
          <div className="mt-4">
            <Button 
              onClick={onRetry} 
              variant="default" 
              className="inline-flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
