"use client";

import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "dots" | "pulse" | "bars";
  className?: string;
  text?: string;
}

export function LoadingSpinner({
  size = "md",
  variant = "default",
  className,
  text,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  const spinnerSize = sizeClasses[size];

  if (variant === "dots") {
    return (
      <div
        className={cn("flex items-center justify-center space-x-1", className)}
      >
        <div
          className={cn(
            "rounded-full bg-primary animate-bounce",
            size === "sm" ? "w-2 h-2" : size === "lg" ? "w-4 h-4" : "w-3 h-3"
          )}
          style={{ animationDelay: "0ms" }}
        />
        <div
          className={cn(
            "rounded-full bg-primary animate-bounce",
            size === "sm" ? "w-2 h-2" : size === "lg" ? "w-4 h-4" : "w-3 h-3"
          )}
          style={{ animationDelay: "150ms" }}
        />
        <div
          className={cn(
            "rounded-full bg-primary animate-bounce",
            size === "sm" ? "w-2 h-2" : size === "lg" ? "w-4 h-4" : "w-3 h-3"
          )}
          style={{ animationDelay: "300ms" }}
        />
        {text && (
          <span className="ml-2 text-sm text-muted-foreground">{text}</span>
        )}
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <div
          className={cn("rounded-full bg-primary animate-pulse", spinnerSize)}
        />
        {text && (
          <span className="ml-2 text-sm text-muted-foreground">{text}</span>
        )}
      </div>
    );
  }

  if (variant === "bars") {
    return (
      <div
        className={cn("flex items-center justify-center space-x-1", className)}
      >
        <div
          className={cn(
            "bg-primary animate-pulse",
            size === "sm" ? "w-1 h-3" : size === "lg" ? "w-2 h-6" : "w-1.5 h-4"
          )}
          style={{ animationDelay: "0ms" }}
        />
        <div
          className={cn(
            "bg-primary animate-pulse",
            size === "sm" ? "w-1 h-4" : size === "lg" ? "w-2 h-8" : "w-1.5 h-6"
          )}
          style={{ animationDelay: "100ms" }}
        />
        <div
          className={cn(
            "bg-primary animate-pulse",
            size === "sm" ? "w-1 h-3" : size === "lg" ? "w-2 h-6" : "w-1.5 h-4"
          )}
          style={{ animationDelay: "200ms" }}
        />
        <div
          className={cn(
            "bg-primary animate-pulse",
            size === "sm" ? "w-1 h-5" : size === "lg" ? "w-2 h-10" : "w-1.5 h-7"
          )}
          style={{ animationDelay: "300ms" }}
        />
        <div
          className={cn(
            "bg-primary animate-pulse",
            size === "sm" ? "w-1 h-3" : size === "lg" ? "w-2 h-6" : "w-1.5 h-4"
          )}
          style={{ animationDelay: "400ms" }}
        />
        {text && (
          <span className="ml-2 text-sm text-muted-foreground">{text}</span>
        )}
      </div>
    );
  }

  // Default spinner
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-primary border-t-transparent",
          spinnerSize
        )}
      />
      {text && (
        <span className="ml-2 text-sm text-muted-foreground">{text}</span>
      )}
    </div>
  );
}

// Page loading component
export function PageLoading({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <LoadingSpinner size="lg" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

// Card loading skeleton
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse", className)}>
      <div className="bg-muted rounded-lg p-6 space-y-4">
        <div className="h-4 bg-muted-foreground/20 rounded w-1/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-muted-foreground/20 rounded"></div>
          <div className="h-4 bg-muted-foreground/20 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  );
}

// Table loading skeleton
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-muted rounded w-1/4"></div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-muted rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-3 bg-muted rounded w-1/3"></div>
            </div>
            <div className="w-16 h-4 bg-muted rounded"></div>
            <div className="w-20 h-4 bg-muted rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Chart loading skeleton
export function ChartSkeleton({ height = 200 }: { height?: number }) {
  return (
    <div className="animate-pulse">
      <div className="mb-4 space-y-2">
        <div className="h-6 bg-muted rounded w-1/3"></div>
        <div className="h-4 bg-muted rounded w-1/4"></div>
      </div>
      <div
        className="bg-muted rounded-lg flex items-end justify-between px-4 pb-4 pt-8 space-x-2"
        style={{ height }}
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="bg-muted-foreground/30 rounded-t"
            style={{
              height: `${20 + Math.random() * 60}%`,
              width: "8px",
            }}
          />
        ))}
      </div>
    </div>
  );
}
