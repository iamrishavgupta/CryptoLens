// Navigation items
export const NAVIGATION_ITEMS = [
  {
    label: "Market",
    href: "/market",
    icon: "TrendingUp",
  },
  {
    label: "Portfolio",
    href: "/portfolio",
    icon: "Wallet",
  },
  {
    label: "DeFi",
    href: "/defi",
    icon: "Coins",
  },
  {
    label: "NFT",
    href: "/nft",
    icon: "Image",
  },
  {
    label: "News",
    href: "/news",
    icon: "Newspaper",
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: "BarChart3",
  },
  {
    label: "Education",
    href: "/education",
    icon: "BookOpen",
  },
] as const;

// Dashboard navigation
export const DASHBOARD_ITEMS = [
  {
    label: "Watchlist",
    href: "/watchlist",
    icon: "Eye",
  },
  {
    label: "Alerts",
    href: "/alerts",
    icon: "Bell",
  },
  {
    label: "Portfolio",
    href: "/portfolio",
    icon: "PieChart",
  },
  {
    label: "Transactions",
    href: "/transactions",
    icon: "Receipt",
  },
] as const;

// Footer links
export const FOOTER_LINKS = {
  company: [
    { label: "About", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Blog", href: "/blog" },
    { label: "Press", href: "/press" },
  ],
  product: [
    { label: "Features", href: "/features" },
    { label: "API", href: "/api-docs" },
    { label: "Pricing", href: "/pricing" },
    { label: "Changelog", href: "/changelog" },
  ],
  support: [
    { label: "Help Center", href: "/help" },
    { label: "Contact", href: "/contact" },
    { label: "Status", href: "/status" },
    { label: "Bug Report", href: "/bug-report" },
  ],
  legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Security", href: "/security" },
    { label: "Disclaimer", href: "/disclaimer" },
  ],
} as const;
