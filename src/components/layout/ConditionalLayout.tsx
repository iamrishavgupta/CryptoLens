"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { useState } from "react";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({
  children,
}: ConditionalLayoutProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Don't show header on login, signup, and home page (home has its own header in HomeLayout)
  const hideHeader =
    pathname === "/login" || pathname === "/register" || pathname === "/";

  if (hideHeader) {
    return <>{children}</>;
  }

  return (
    <>
      <Header
        variant="simplified"
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      {children}
    </>
  );
}
