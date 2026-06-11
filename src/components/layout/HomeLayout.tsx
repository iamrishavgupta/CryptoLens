"use client";

import React, { useState } from "react";
import { Header } from "./Header";
import Sidebar from "./Sidebar";
import { Footer } from "./Footer";

interface HomeLayoutProps {
  children: React.ReactNode;
}

export default function HomeLayout({ children }: HomeLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSidebarClose = () => {
    console.log("Closing sidebar, current state:", sidebarOpen);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        variant="full"
        isMobileMenuOpen={sidebarOpen}
        setIsMobileMenuOpen={setSidebarOpen}
      />
      <div className="flex-1">
        <div className="container mx-auto px-4">
          <div className="w-full max-w-[1536px] mx-auto flex">
            <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
            <main className="flex-1 p-5">{children}</main>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
