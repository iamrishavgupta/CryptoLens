"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Shield,
  Key,
  Wallet,
  CheckCircle,
  Bitcoin,
  TrendingUp,
} from "lucide-react";

interface AuthLoaderProps {
  type?: "login" | "register" | "oauth";
  provider?: "google" | "github" | "email";
  className?: string;
}

const loadingMessages = {
  login: [
    "Verifying credentials...",
    "Establishing secure connection...",
    "Accessing your portfolio...",
    "Almost there...",
  ],
  register: [
    "Creating your account...",
    "Setting up security protocols...",
    "Initializing portfolio...",
    "Welcome aboard!",
  ],
  oauth: {
    google: [
      "Connecting to Google...",
      "Verifying identity...",
      "Syncing profile data...",
      "Getting you in...",
    ],
    github: [
      "Connecting to GitHub...",
      "Authenticating developer account...",
      "Importing profile info...",
      "Access granted!",
    ],
  },
};

export function AuthLoader({
  type = "login",
  provider,
  className,
}: AuthLoaderProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentMessage, setCurrentMessage] = useState("");

  useEffect(() => {
    let messages: string[];

    if (type === "oauth" && provider && provider in loadingMessages.oauth) {
      messages =
        loadingMessages.oauth[provider as keyof typeof loadingMessages.oauth];
    } else if (type === "login" || type === "register") {
      messages = loadingMessages[type];
    } else {
      messages = loadingMessages.login; // fallback
    }

    setCurrentMessage(messages[0]);

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        const next = (prev + 1) % messages.length;
        setCurrentMessage(messages[next]);
        return next;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [type, provider]);

  const getStepIcon = (step: number, isActive: boolean) => {
    const icons = [
      Shield,
      Key,
      type === "register" ? Wallet : Bitcoin,
      CheckCircle,
    ];

    const Icon = icons[step];
    return (
      <div
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300",
          isActive
            ? "bg-primary text-primary-foreground scale-110"
            : step <= currentStep
            ? "bg-green-500 text-white"
            : "bg-muted text-muted-foreground"
        )}
      >
        <Icon className="w-4 h-4" />
      </div>
    );
  };

  return (
    <div className={cn("flex flex-col items-center space-y-6 py-8", className)}>
      {/* Animated crypto logo */}
      <div className="relative">
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center animate-pulse">
          <TrendingUp className="w-8 h-8 text-white" />
        </div>
        <div className="absolute -inset-2 rounded-full border-2 border-primary/30 animate-spin" />
        <div className="absolute -inset-4 rounded-full border border-primary/20 animate-ping" />
      </div>

      {/* Progress steps */}
      <div className="flex items-center space-x-4">
        {[0, 1, 2, 3].map((step) => (
          <React.Fragment key={step}>
            {getStepIcon(step, step === currentStep)}
            {step < 3 && (
              <div
                className={cn(
                  "w-8 h-0.5 transition-all duration-300",
                  step < currentStep ? "bg-green-500" : "bg-muted"
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Loading message */}
      <div className="text-center space-y-2">
        <p className="text-sm font-medium text-foreground animate-fade-in">
          {currentMessage}
        </p>
        <div className="flex justify-center space-x-1">
          {[0, 1, 2].map((dot) => (
            <div
              key={dot}
              className={cn(
                "w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
              )}
              style={{
                animationDelay: `${dot * 0.1}s`,
                animationDuration: "0.6s",
              }}
            />
          ))}
        </div>
      </div>

      {/* Provider-specific styling */}
      {type === "oauth" && provider && (
        <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-muted/50">
          {provider === "google" && (
            <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-yellow-500 rounded-full" />
          )}
          {provider === "github" && (
            <div className="w-4 h-4 bg-gray-900 rounded-full" />
          )}
          <span className="text-xs text-muted-foreground capitalize">
            {provider} Authentication
          </span>
        </div>
      )}
    </div>
  );
}

// Quick inline loader for buttons
export function AuthButtonLoader({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <div
      className={cn("flex items-center justify-center space-x-2", className)}
    >
      {/* Crypto-themed spinner */}
      <div className="relative w-4 h-4">
        <div className="absolute inset-0 border-2 border-primary/30 rounded-full" />
        <div className="absolute inset-0 border-2 border-transparent border-t-primary rounded-full animate-spin" />
        <div className="absolute inset-1 border border-primary/50 rounded-full animate-pulse" />
      </div>
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
}

// Full-screen overlay loader for page transitions
export function AuthOverlayLoader({
  type = "login",
  provider,
  onComplete,
}: AuthLoaderProps & { onComplete?: () => void }) {
  useEffect(() => {
    if (onComplete) {
      const timer = setTimeout(onComplete, 3200); // Complete after all steps
      return () => clearTimeout(timer);
    }
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card border rounded-lg shadow-lg p-8 mx-4 max-w-md w-full">
        <AuthLoader type={type} provider={provider} />

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Securing your crypto experience...
          </p>
        </div>
      </div>
    </div>
  );
}
