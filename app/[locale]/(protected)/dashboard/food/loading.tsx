import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function FoodLoading() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card className="p-4">
          <Skeleton className="h-12 w-full" />
        </Card>
        <Card className="p-4">
          <Skeleton className="h-12 w-full" />
        </Card>
      </div>

      {/* Meal List */}
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <Skeleton className="h-6 w-48 mb-3" />
            <Card className="p-4 mb-3">
              <Skeleton className="h-16 w-full" />
            </Card>
            <div className="space-y-3">
              {[1, 2, 3].map((j) => (
                <Card key={j} className="p-5">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
