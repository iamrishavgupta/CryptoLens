import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="flex flex-col items-center mb-6">
        <TrendingUp className="h-16 w-16 text-coingecko-green-500 mb-4" />
        <h1 className="text-4xl font-bold mb-2">404 - Page Not Found</h1>
        <p className="text-muted-foreground mb-4 max-w-md">
          Oops! The page you are looking for does not exist or has been moved.
          Please check the URL or return to the homepage.
        </p>
        <Button asChild size="lg" className="mt-2">
          <Link href="/">Go to Homepage</Link>
        </Button>
      </div>
      <div className="w-full max-w-md mx-auto">
        <div className="text-6xl opacity-20">🚀</div>
        <p className="text-sm text-muted-foreground mt-4">
          Looks like this page went to the moon!
        </p>
      </div>
    </div>
  );
}
