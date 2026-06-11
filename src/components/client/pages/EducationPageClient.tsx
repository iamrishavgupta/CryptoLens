"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Clock, Star, Search, Play, Users, ExternalLink } from "lucide-react";

const courses = [
  {
    id: 1,
    title: "Crypto Basics — Binance Academy",
    description: "Free beginner-friendly courses covering blockchain, Bitcoin, Ethereum and more.",
    level: "Beginner",
    duration: "Self-paced",
    rating: 4.9,
    enrolled: 2000000,
    category: "basics",
    url: "https://academy.binance.com/en/start-here",
    source: "Binance Academy",
  },
  {
    id: 2,
    title: "Bitcoin & Cryptocurrency Technologies",
    description: "Free Princeton University course covering cryptography, Bitcoin mining, and blockchain.",
    level: "Intermediate",
    duration: "12 weeks",
    rating: 4.8,
    enrolled: 500000,
    category: "basics",
    url: "https://www.coursera.org/learn/cryptocurrency",
    source: "Coursera (Princeton)",
  },
  {
    id: 3,
    title: "DeFi & Web3 — Finematics",
    description: "Visual explanations of DeFi protocols, AMMs, yield farming, and Web3 concepts.",
    level: "Intermediate",
    duration: "Self-paced",
    rating: 4.9,
    enrolled: 800000,
    category: "defi",
    url: "https://www.youtube.com/@Finematics",
    source: "YouTube",
  },
  {
    id: 4,
    title: "Ethereum Development — ethereum.org",
    description: "Official Ethereum learning hub with tutorials for developers and non-developers.",
    level: "Beginner",
    duration: "Self-paced",
    rating: 5.0,
    enrolled: 3000000,
    category: "basics",
    url: "https://ethereum.org/en/learn/",
    source: "Ethereum.org",
  },
  {
    id: 5,
    title: "Technical Analysis for Crypto",
    description: "Free course on reading charts, candlesticks, RSI, MACD and trading strategies.",
    level: "Intermediate",
    duration: "6 hours",
    rating: 4.7,
    enrolled: 300000,
    category: "trading",
    url: "https://academy.binance.com/en/articles/a-complete-guide-to-cryptocurrency-trading-for-beginners",
    source: "Binance Academy",
  },
  {
    id: 6,
    title: "Blockchain & Money — MIT",
    description: "Free MIT OpenCourseWare course by Prof. Gary Gensler on blockchain and finance.",
    level: "Advanced",
    duration: "24 lectures",
    rating: 4.8,
    enrolled: 1000000,
    category: "basics",
    url: "https://ocw.mit.edu/courses/15-s12-blockchain-and-money-fall-2018/",
    source: "MIT OpenCourseWare",
  },
  {
    id: 7,
    title: "Smart Contract Security",
    description: "Learn how to write secure Solidity smart contracts and avoid common vulnerabilities.",
    level: "Advanced",
    duration: "Self-paced",
    rating: 4.8,
    enrolled: 150000,
    category: "defi",
    url: "https://www.cyfrin.io/updraft",
    source: "Cyfrin Updraft",
  },
  {
    id: 8,
    title: "CoinGecko Learn",
    description: "Free research reports, articles and beginner guides on crypto markets and trends.",
    level: "Beginner",
    duration: "Self-paced",
    rating: 4.7,
    enrolled: 500000,
    category: "basics",
    url: "https://www.coingecko.com/learn",
    source: "CoinGecko",
  },
  {
    id: 9,
    title: "NFT & Web3 Gaming Fundamentals",
    description: "Understand NFTs, digital ownership, play-to-earn gaming and the metaverse.",
    level: "Beginner",
    duration: "3 hours",
    rating: 4.6,
    enrolled: 200000,
    category: "nft",
    url: "https://academy.binance.com/en/articles/what-are-nfts",
    source: "Binance Academy",
  },
];

const articles = [
  {
    id: 1,
    title: "What is Bitcoin? A Beginner's Guide",
    description: "Everything you need to know about Bitcoin — how it works, why it matters, and how to get started.",
    readTime: "8 min",
    category: "basics",
    tags: ["Bitcoin", "Blockchain", "Beginner"],
    url: "https://www.coindesk.com/learn/what-is-bitcoin/",
    source: "CoinDesk",
  },
  {
    id: 2,
    title: "How Ethereum Works",
    description: "A deep dive into Ethereum's architecture, smart contracts, and the EVM.",
    readTime: "10 min",
    category: "basics",
    tags: ["Ethereum", "Smart Contracts", "EVM"],
    url: "https://ethereum.org/en/what-is-ethereum/",
    source: "Ethereum.org",
  },
  {
    id: 3,
    title: "DeFi Explained — The Complete Guide",
    description: "What is DeFi, how does it work, and what are the risks and opportunities?",
    readTime: "12 min",
    category: "defi",
    tags: ["DeFi", "Yield Farming", "Liquidity"],
    url: "https://finematics.com/defi-explained/",
    source: "Finematics",
  },
  {
    id: 4,
    title: "How to Read Crypto Charts",
    description: "Learn candlestick patterns, support/resistance levels, and key trading indicators.",
    readTime: "15 min",
    category: "trading",
    tags: ["Trading", "Technical Analysis", "Charts"],
    url: "https://academy.binance.com/en/articles/how-to-read-candlestick-charts",
    source: "Binance Academy",
  },
  {
    id: 5,
    title: "What Are NFTs and How Do They Work?",
    description: "A clear explanation of non-fungible tokens, their use cases, and how to evaluate them.",
    readTime: "7 min",
    category: "nft",
    tags: ["NFT", "Digital Art", "Web3"],
    url: "https://www.coindesk.com/learn/what-are-nfts/",
    source: "CoinDesk",
  },
  {
    id: 6,
    title: "Understanding Crypto Wallets",
    description: "Hot wallets vs cold wallets, seed phrases, and how to keep your crypto safe.",
    readTime: "6 min",
    category: "basics",
    tags: ["Wallets", "Security", "Self-custody"],
    url: "https://academy.binance.com/en/articles/crypto-wallet-types-explained",
    source: "Binance Academy",
  },
  {
    id: 7,
    title: "What is a DEX?",
    description: "How decentralized exchanges like Uniswap work and how they differ from centralized exchanges.",
    readTime: "8 min",
    category: "defi",
    tags: ["DEX", "Uniswap", "AMM"],
    url: "https://www.coingecko.com/learn/what-is-a-decentralized-exchange-dex",
    source: "CoinGecko",
  },
  {
    id: 8,
    title: "Crypto Tax Guide 2024",
    description: "How crypto is taxed, what counts as a taxable event, and how to stay compliant.",
    readTime: "10 min",
    category: "trading",
    tags: ["Tax", "Regulation", "Trading"],
    url: "https://www.coindesk.com/learn/crypto-taxes/",
    source: "CoinDesk",
  },
  {
    id: 9,
    title: "Layer 2 Solutions Explained",
    description: "What are rollups, sidechains, and Layer 2 networks and why do they matter?",
    readTime: "9 min",
    category: "basics",
    tags: ["Layer 2", "Rollups", "Scaling"],
    url: "https://ethereum.org/en/layer-2/",
    source: "Ethereum.org",
  },
];

const glossary = [
  { term: "Blockchain", definition: "A distributed ledger that records transactions across many computers so that the record cannot be altered retroactively." },
  { term: "Bitcoin (BTC)", definition: "The first and largest cryptocurrency by market cap, created by Satoshi Nakamoto in 2009 as a peer-to-peer electronic cash system." },
  { term: "Ethereum (ETH)", definition: "A decentralized platform that enables smart contracts and decentralized applications (dApps) to be built and run without downtime or fraud." },
  { term: "Smart Contract", definition: "Self-executing contracts with the terms of the agreement directly written into code. They automatically execute when predefined conditions are met." },
  { term: "DeFi", definition: "Decentralized Finance — financial services built on blockchain that operate without traditional intermediaries like banks." },
  { term: "NFT", definition: "Non-Fungible Token — a unique digital asset verified using blockchain technology, representing ownership of a specific item or piece of content." },
  { term: "Wallet", definition: "Software or hardware that stores your private keys, allowing you to send and receive cryptocurrency." },
  { term: "Private Key", definition: "A secret number that allows you to spend cryptocurrency. Never share your private key with anyone." },
  { term: "Seed Phrase", definition: "A 12-24 word backup phrase that can restore your wallet. Anyone with your seed phrase has full access to your funds." },
  { term: "Gas Fee", definition: "A fee paid to network validators for processing transactions on the Ethereum blockchain. Higher fees = faster processing." },
  { term: "DEX", definition: "Decentralized Exchange — a peer-to-peer marketplace where users trade cryptocurrencies directly from their wallets." },
  { term: "AMM", definition: "Automated Market Maker — a protocol that uses liquidity pools and algorithms (instead of order books) to price and execute trades." },
  { term: "Liquidity Pool", definition: "A collection of funds locked in a smart contract that provides liquidity for decentralized trading and earns fees for liquidity providers." },
  { term: "Yield Farming", definition: "The practice of staking or lending crypto assets to generate returns or rewards in the form of additional cryptocurrency." },
  { term: "Staking", definition: "Locking up cryptocurrency to support a blockchain network's operations in exchange for rewards." },
  { term: "TVL", definition: "Total Value Locked — the total amount of assets deposited in a DeFi protocol, used as a measure of its size and adoption." },
  { term: "Market Cap", definition: "The total market value of a cryptocurrency, calculated by multiplying its current price by its circulating supply." },
  { term: "HODL", definition: "A misspelling of 'hold' that became a crypto term meaning to hold onto your cryptocurrency rather than selling it." },
  { term: "FUD", definition: "Fear, Uncertainty, and Doubt — negative sentiment spread about a cryptocurrency, often to manipulate its price." },
  { term: "FOMO", definition: "Fear Of Missing Out — the anxiety that others are profiting from a price move and you're missing out." },
  { term: "Whale", definition: "An individual or entity that holds a large amount of cryptocurrency, capable of influencing market prices." },
  { term: "Altcoin", definition: "Any cryptocurrency other than Bitcoin. Includes Ethereum, Solana, BNB, and thousands of others." },
  { term: "Layer 2", definition: "A secondary framework built on top of an existing blockchain to improve its speed and reduce transaction costs." },
  { term: "Bridge", definition: "A protocol that allows tokens and data to be transferred between different blockchain networks." },
  { term: "DAO", definition: "Decentralized Autonomous Organization — an organization governed by smart contracts and token holders rather than a central authority." },
];

const categories = ["all", "basics", "trading", "defi", "nft"];

export default function EducationPageClient() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [glossarySearch, setGlossarySearch] = useState("");

  const filteredCourses = courses.filter(
    (course) =>
      (selectedCategory === "all" || course.category === selectedCategory) &&
      course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredArticles = articles.filter(
    (article) =>
      (selectedCategory === "all" || article.category === selectedCategory) &&
      article.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGlossary = glossary.filter(
    (item) =>
      item.term.toLowerCase().includes(glossarySearch.toLowerCase()) ||
      item.definition.toLowerCase().includes(glossarySearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header
        variant="simplified"
        isMobileMenuOpen={sidebarOpen}
        setIsMobileMenuOpen={setSidebarOpen}
      />
      <div className="flex container mx-auto px-4">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 min-w-0">
          <div className="container mx-auto px-4 py-5">
            <div className="space-y-8">

              {/* Header */}
              <div>
                <h1 className="text-4xl font-bold flex items-center gap-2">
                  <BookOpen className="h-8 w-8 text-blue-500" />
                  Crypto Education
                </h1>
                <p className="text-muted-foreground">
                  Learn about cryptocurrency, blockchain, and DeFi — all free resources
                </p>
              </div>

              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search courses and articles..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-border rounded-md bg-background"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === "all" ? "All Categories" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <Tabs defaultValue="courses" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="courses">Courses</TabsTrigger>
                  <TabsTrigger value="articles">Articles</TabsTrigger>
                  <TabsTrigger value="glossary">Glossary</TabsTrigger>
                </TabsList>

                {/* Courses */}
                <TabsContent value="courses" className="space-y-6 mt-6">
                  {filteredCourses.length === 0 ? (
                    <p className="text-center text-muted-foreground py-12">No courses found.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredCourses.map((course) => (
                        <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                          <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <Play className="h-12 w-12 text-white" />
                          </div>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <Badge variant="outline">{course.level}</Badge>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm">{course.rating}</span>
                              </div>
                            </div>
                            <CardTitle className="text-lg">{course.title}</CardTitle>
                            <CardDescription>{course.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {course.duration}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  {course.enrolled >= 1e6
                                    ? `${(course.enrolled / 1e6).toFixed(1)}M`
                                    : `${(course.enrolled / 1e3).toFixed(0)}K`}
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Source: <span className="font-medium">{course.source}</span>
                              </div>
                              <Button
                                className="w-full"
                                onClick={() => window.open(course.url, "_blank")}
                              >
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Start Course (Free)
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Articles */}
                <TabsContent value="articles" className="space-y-6 mt-6">
                  {filteredArticles.length === 0 ? (
                    <p className="text-center text-muted-foreground py-12">No articles found.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredArticles.map((article) => (
                        <Card key={article.id} className="hover:shadow-lg transition-shadow">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <Badge variant="outline">{article.category}</Badge>
                              <span className="text-sm text-muted-foreground">{article.readTime}</span>
                            </div>
                            <CardTitle className="text-lg">{article.title}</CardTitle>
                            <CardDescription>{article.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex flex-wrap gap-1">
                                {article.tags.map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                                ))}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Source: <span className="font-medium">{article.source}</span>
                              </div>
                              <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => window.open(article.url, "_blank")}
                              >
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Read Article
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Glossary */}
                <TabsContent value="glossary" className="space-y-4 mt-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search glossary terms..."
                      className="pl-10"
                      value={glossarySearch}
                      onChange={(e) => setGlossarySearch(e.target.value)}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">{filteredGlossary.length} terms</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredGlossary.map((item, index) => (
                      <Card key={index}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{item.term}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{item.definition}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}