"use client";

import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="container mx-auto max-w-2xl px-4 py-16">
      <Card className="p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-2">Something went wrong!</h2>
            <p className="text-muted-foreground mb-6">
              We encountered an error while loading your dashboard. Don't worry,
              your data is safe.
            </p>
          </div>

          {error.message && (
            <Card className="p-4 bg-muted/50 w-full">
              <p className="text-sm text-muted-foreground font-mono break-words">
                {error.message}
              </p>
            </Card>
          )}

          <div className="flex gap-3 mt-4">
            <Button onClick={reset} variant="default">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Link href="/">
              <Button variant="outline">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </Link>
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            If this problem persists, please contact support.
          </p>
        </div>
      </Card>
    </div>
  );
}
