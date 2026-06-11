import { NextRequest, NextResponse } from "next/server";

// Mock portfolio data - in a real app, this would come from a database
const mockPortfolios = [
  {
    id: "portfolio-1",
    userId: "user-1",
    name: "Main Portfolio",
    description: "My primary investment portfolio",
    isPublic: false,
    holdings: [
      {
        coinId: "bitcoin",
        symbol: "BTC",
        name: "Bitcoin",
        amount: 0.5,
        averagePrice: 40000,
        currentPrice: 43250,
        firstPurchaseDate: new Date().toISOString(),
      },
      {
        coinId: "ethereum",
        symbol: "ETH",
        name: "Ethereum",
        amount: 5,
        averagePrice: 2200,
        currentPrice: 2385,
        firstPurchaseDate: new Date().toISOString(),
      },
    ],
    performance: {
      totalValue: 33553.58,
      totalCost: 31000,
      unrealizedPnL: 2553.58,
      realizedPnL: 0,
      roi: 8.24,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export async function GET(request: NextRequest) {
  try {
    // In a real app, you would:
    // 1. Authenticate the user
    // 2. Get portfolios from database
    // 3. Calculate current values using live price data

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    // Filter portfolios by user if userId is provided
    let portfolios = mockPortfolios;
    if (userId) {
      portfolios = mockPortfolios.filter((p) => p.userId === userId);
    }

    // Calculate current portfolio values
    const updatedPortfolios = portfolios.map((portfolio) => ({
      ...portfolio,
      performance: {
        ...portfolio.performance,
        totalValue: portfolio.holdings.reduce(
          (total, holding) => total + holding.amount * holding.currentPrice,
          0
        ),
      },
    }));

    return NextResponse.json({
      success: true,
      data: updatedPortfolios,
      count: updatedPortfolios.length,
    });
  } catch (error) {
    console.error("Portfolio API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch portfolios",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, userId } = body;

    if (!name || !userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
          message: "Name and userId are required",
        },
        { status: 400 }
      );
    }

    // In a real app, you would save to database
    const newPortfolio = {
      id: `portfolio-${Date.now()}`,
      userId,
      name,
      description: description || "",
      isPublic: false,
      holdings: [],
      performance: {
        totalValue: 0,
        totalCost: 0,
        unrealizedPnL: 0,
        realizedPnL: 0,
        roi: 0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockPortfolios.push(newPortfolio);

    return NextResponse.json(
      {
        success: true,
        data: newPortfolio,
        message: "Portfolio created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Portfolio creation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create portfolio",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
