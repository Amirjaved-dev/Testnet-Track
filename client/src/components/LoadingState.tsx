import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingState() {
  return (
    <Card className="bg-white shadow rounded-lg mb-4">
      <CardContent className="p-6">
        <div className="animate-pulse flex flex-col space-y-4">
          <Skeleton className="h-6 w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-16 rounded" />
            <Skeleton className="h-16 rounded" />
            <Skeleton className="h-16 rounded" />
            <Skeleton className="h-16 rounded" />
          </div>
          <Skeleton className="h-12 rounded" />
          <Skeleton className="h-12 rounded" />
        </div>
      </CardContent>
    </Card>
  );
}
