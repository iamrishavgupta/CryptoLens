"use client";

import React from "react";
import Link from "next/link";
import { TrendingUp, Twitter, Github, Linkedin, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Product",
      links: [
        { label: "Markets", href: "/markets" },
        { label: "Portfolio", href: "/portfolio" },
        { label: "DeFi", href: "/defi" },
        { label: "NFTs", href: "/nft" },
        { label: "Analytics", href: "/analytics" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Blog", href: "/blog" },
        { label: "News", href: "/news" },
        { label: "Help Center", href: "/help" },
        { label: "API Docs", href: "/api-docs" },
        { label: "Status", href: "/status" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "/about" },
        { label: "Careers", href: "/careers" },
        { label: "Press", href: "/press" },
        { label: "Contact", href: "/contact" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Cookie Policy", href: "/cookies" },
        { label: "Disclaimer", href: "/disclaimer" },
      ],
    },
  ];

  const socialLinks = [
    { icon: Twitter, href: "https://twitter.com/CoinLens", label: "Twitter" },
    { icon: Github, href: "https://github.com/CoinLens", label: "GitHub" },
    {
      icon: Linkedin,
      href: "https://linkedin.com/company/CoinLens",
      label: "LinkedIn",
    },
    { icon: Mail, href: "mailto:contact@CoinLens.com", label: "Email" },
  ];

  return (
    <footer className="border-t bg-background">
      <div className="w-full max-w-[1536px] mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary to-blue-600 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                CoinLens
              </span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Your comprehensive platform for cryptocurrency market data,
              portfolio management, and Web3 integration. Track, analyze, and
              optimize your crypto journey.
            </p>
            <div className="flex space-x-2">
              {socialLinks.map((social) => (
                <Button key={social.href} variant="ghost" size="icon" asChild>
                  <Link
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <social.icon className="h-4 w-4" />
                    <span className="sr-only">{social.label}</span>
                  </Link>
                </Button>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>










        {/* Bottom Section */}
        <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-muted-foreground">
            © {currentYear} CoinLens. All rights reserved.
          </div>
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <span>Market data provided by CoinGecko</span>
            <span>•</span>
            <span>Real-time updates via WebSocket</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
