import { cn } from "@/lib/utils";
import { TrendingUp } from "lucide-react";
import Link from "next/link";
import React from "react";

const Logo = ({ className }: { className?: string }) => {
  return (
    <Link href="/" className={cn("flex items-center space-x-2", className)}>
      <div className="h-8 w-8 rounded-lg bg-coingecko-green-500 flex items-center justify-center">
        <TrendingUp className="h-5 w-5 text-white" />
      </div>
      <span className="text-xl font-bold text-foreground">CoinLens</span>
    </Link>
  );
};

export default Logo;
