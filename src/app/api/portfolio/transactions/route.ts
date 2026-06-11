import { NextRequest, NextResponse } from "next/server";

// Mock transaction data
const mockTransactions = [
  {
    id: "tx-1",
    userId: "user-1",
    portfolioId: "portfolio-1",
    type: "buy",
    coinId: "bitcoin",
    symbol: "BTC",
    amount: 0.5,
    price: 40000,
    fee: 25,
    exchange: "Coinbase",
    notes: "Initial Bitcoin purchase",
    timestamp: new Date("2024-01-15").toISOString(),
    createdAt: new Date("2024-01-15").toISOString(),
  },
  {
    id: "tx-2",
    userId: "user-1",
    portfolioId: "portfolio-1",
    type: "buy",
    coinId: "ethereum",
    symbol: "ETH",
    amount: 5,
    price: 2200,
    fee: 15,
    exchange: "Binance",
    notes: "Ethereum DCA purchase",
    timestamp: new Date("2024-01-20").toISOString(),
    createdAt: new Date("2024-01-20").toISOString(),
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const portfolioId = searchParams.get("portfolioId");
    const userId = searchParams.get("userId");
    const type = searchParams.get("type");
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");

    let transactions = [...mockTransactions];

    // Filter by portfolio ID
    if (portfolioId) {
      transactions = transactions.filter(
        (tx) => tx.portfolioId === portfolioId
      );
    }

    // Filter by user ID
    if (userId) {
      transactions = transactions.filter((tx) => tx.userId === userId);
    }

    // Filter by transaction type
    if (type) {
      transactions = transactions.filter((tx) => tx.type === type);
    }

    // Sort by timestamp (newest first)
    transactions.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Apply pagination
    const limitNum = limit ? parseInt(limit) : 50;
    const offsetNum = offset ? parseInt(offset) : 0;
    const paginatedTransactions = transactions.slice(
      offsetNum,
      offsetNum + limitNum
    );

    // Calculate summary statistics
    const summary = {
      totalTransactions: transactions.length,
      totalVolume: transactions.reduce(
        (sum, tx) => sum + tx.amount * tx.price,
        0
      ),
      totalFees: transactions.reduce((sum, tx) => sum + tx.fee, 0),
      typeBreakdown: {
        buy: transactions.filter((tx) => tx.type === "buy").length,
        sell: transactions.filter((tx) => tx.type === "sell").length,
        transfer_in: transactions.filter((tx) => tx.type === "transfer_in")
          .length,
        transfer_out: transactions.filter((tx) => tx.type === "transfer_out")
          .length,
      },
    };

    return NextResponse.json({
      success: true,
      data: paginatedTransactions,
      summary,
      pagination: {
        total: transactions.length,
        limit: limitNum,
        offset: offsetNum,
        hasMore: offsetNum + limitNum < transactions.length,
      },
    });
  } catch (error) {
    console.error("Transactions API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch transactions",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      portfolioId,
      type,
      coinId,
      symbol,
      amount,
      price,
      fee = 0,
      exchange,
      notes,
      timestamp,
    } = body;

    // Validate required fields
    const requiredFields = [
      "userId",
      "portfolioId",
      "type",
      "coinId",
      "symbol",
      "amount",
      "price",
    ];
    const missingFields = requiredFields.filter((field) => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
          message: `Required fields: ${missingFields.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validate transaction type
    const validTypes = ["buy", "sell", "transfer_in", "transfer_out"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid transaction type",
          message: `Valid types: ${validTypes.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validate amounts
    if (amount <= 0 || price <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid amounts",
          message: "Amount and price must be positive numbers",
        },
        { status: 400 }
      );
    }

    // Create new transaction
    const newTransaction = {
      id: `tx-${Date.now()}`,
      userId,
      portfolioId,
      type,
      coinId,
      symbol: symbol.toUpperCase(),
      amount: parseFloat(amount),
      price: parseFloat(price),
      fee: parseFloat(fee),
      exchange: exchange || null,
      notes: notes || null,
      timestamp: timestamp || new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    // In a real app, you would:
    // 1. Save transaction to database
    // 2. Update portfolio holdings
    // 3. Recalculate portfolio performance
    mockTransactions.push(newTransaction);

    return NextResponse.json(
      {
        success: true,
        data: newTransaction,
        message: "Transaction recorded successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Transaction creation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to record transaction",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
