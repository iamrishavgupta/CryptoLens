import { cn } from "@/lib/utils";
import { TrendingUp } from "lucide-react";
import Link from "next/link";
import React from "react";

const Logo = ({ className }: { className?: string }) => {
  return (
    <Link href="/" className={cn("flex flex-shrink-0 items-center space-x-2", className)}>
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-coingecko-green-500">
        <TrendingUp className="h-5 w-5 text-white" />
      </div>
      <span className="whitespace-nowrap text-lg font-bold text-foreground sm:text-xl">CoinLens</span>
    </Link>
  );
};

export default Logo;
