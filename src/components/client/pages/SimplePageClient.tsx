"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

interface SimplePageClientProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function SimplePageClient({
  title,
  description,
  children,
}: SimplePageClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header
        variant="simplified"
        isMobileMenuOpen={sidebarOpen}
        setIsMobileMenuOpen={setSidebarOpen}
      />
      <div className="container mx-auto px-4">
        <div className="w-full max-w-[1536px] mx-auto flex">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="flex-1 p-5">
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold">{title}</h1>
                {description && (
                  <p className="text-muted-foreground mt-1">{description}</p>
                )}
              </div>
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
