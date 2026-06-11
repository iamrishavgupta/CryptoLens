import { z } from "zod";

// Auth validation schemas
export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const signUpSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/\d/, "Password must contain at least one number")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string(),
    displayName: z
      .string()
      .min(2, "Display name must be at least 2 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .min(2, "Display name must be at least 2 characters")
    .optional(),
  avatar: z.string().url("Invalid URL").optional(),
  preferences: z
    .object({
      theme: z.enum(["light", "dark", "system"]).optional(),
      currency: z.string().optional(),
      language: z.string().optional(),
      notifications: z
        .object({
          email: z.boolean().optional(),
          push: z.boolean().optional(),
          priceAlerts: z.boolean().optional(),
          portfolioUpdates: z.boolean().optional(),
          newsUpdates: z.boolean().optional(),
          marketUpdates: z.boolean().optional(),
        })
        .optional(),
      privacy: z.enum(["public", "private"]).optional(),
    })
    .optional(),
});

// Portfolio validation schemas
export const createPortfolioSchema = z.object({
  name: z
    .string()
    .min(1, "Portfolio name is required")
    .max(50, "Name must be less than 50 characters"),
  description: z
    .string()
    .max(200, "Description must be less than 200 characters")
    .optional(),
  isPublic: z.boolean().default(false),
  isDefault: z.boolean().default(false),
});

export const addTransactionSchema = z.object({
  portfolioId: z.string().min(1, "Portfolio ID is required"),
  type: z.enum([
    "buy",
    "sell",
    "transfer_in",
    "transfer_out",
    "dividend",
    "staking_reward",
  ]),
  coinId: z.string().min(1, "Coin ID is required"),
  symbol: z.string().min(1, "Symbol is required"),
  name: z.string().min(1, "Coin name is required"),
  amount: z.number().positive("Amount must be positive"),
  price: z.number().positive("Price must be positive"),
  total: z.number().positive("Total must be positive"),
  fee: z.number().min(0, "Fee cannot be negative").default(0),
  feeCurrency: z.string().default("USD"),
  exchange: z.string().optional(),
  wallet: z.string().optional(),
  notes: z
    .string()
    .max(500, "Notes must be less than 500 characters")
    .optional(),
  tags: z.array(z.string()).default([]),
  timestamp: z.date().default(() => new Date()),
});

export const updateTransactionSchema = addTransactionSchema
  .partial()
  .omit({ portfolioId: true });

// Watchlist validation schemas
export const createWatchlistSchema = z.object({
  name: z
    .string()
    .min(1, "Watchlist name is required")
    .max(50, "Name must be less than 50 characters"),
  description: z
    .string()
    .max(200, "Description must be less than 200 characters")
    .optional(),
  isPublic: z.boolean().default(false),
  isDefault: z.boolean().default(false),
});

export const addCoinToWatchlistSchema = z.object({
  coinId: z.string().min(1, "Coin ID is required"),
  symbol: z.string().min(1, "Symbol is required"),
  name: z.string().min(1, "Coin name is required"),
  notes: z
    .string()
    .max(500, "Notes must be less than 500 characters")
    .optional(),
});

// Price alert validation schemas
export const createPriceAlertSchema = z.object({
  coinId: z.string().min(1, "Coin ID is required"),
  coinSymbol: z.string().min(1, "Symbol is required"),
  coinName: z.string().min(1, "Coin name is required"),
  condition: z.enum(["above", "below", "change_up", "change_down"]),
  targetPrice: z.number().positive("Target price must be positive").optional(),
  changePercentage: z.number().min(-100).max(1000).optional(),
  currentPrice: z.number().positive("Current price must be positive"),
  notificationMethods: z
    .array(z.enum(["email", "push", "sms"]))
    .min(1, "At least one notification method is required"),
  repeatInterval: z.enum(["once", "daily", "weekly"]).default("once"),
});

export const updatePriceAlertSchema = createPriceAlertSchema.partial();

// Search validation schemas
export const searchCoinsSchema = z.object({
  query: z
    .string()
    .min(1, "Search query is required")
    .max(100, "Query must be less than 100 characters"),
  limit: z.number().min(1).max(100).default(10),
});

// Market data validation schemas
export const getCoinsSchema = z.object({
  vs_currency: z.string().default("usd"),
  order: z
    .enum([
      "market_cap_desc",
      "market_cap_asc",
      "volume_desc",
      "volume_asc",
      "price_desc",
      "price_asc",
      "percent_change_24h_desc",
      "percent_change_24h_asc",
    ])
    .default("market_cap_desc"),
  per_page: z.number().min(1).max(250).default(100),
  page: z.number().min(1).default(1),
  sparkline: z.boolean().default(false),
  price_change_percentage: z.string().optional(),
  ids: z.string().optional(),
  category: z.string().optional(),
});

export const getCoinHistorySchema = z.object({
  coinId: z.string().min(1, "Coin ID is required"),
  vs_currency: z.string().default("usd"),
  days: z.union([z.number().min(1), z.literal("max")]).default(7),
  interval: z.enum(["minutely", "hourly", "daily"]).optional(),
});

// News validation schemas
export const getNewsSchema = z.object({
  category: z.string().optional(),
  query: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z
    .enum(["publishedAt", "relevancy", "popularity"])
    .default("publishedAt"),
});

// DeFi validation schemas
export const getDeFiProtocolsSchema = z.object({
  category: z.string().optional(),
  chain: z.string().optional(),
  minTvl: z.number().min(0).optional(),
  maxTvl: z.number().min(0).optional(),
  sortBy: z.enum(["tvl", "change_1d", "change_7d", "name"]).default("tvl"),
  order: z.enum(["asc", "desc"]).default("desc"),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(50),
});

// Form validation schemas
export const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(1000, "Message must be less than 1000 characters"),
});

export const feedbackFormSchema = z.object({
  type: z.enum(["bug", "feature", "improvement", "other"]),
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must be less than 1000 characters"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  attachments: z.array(z.string()).default([]),
});

// Export types for TypeScript inference
export type SignInForm = z.infer<typeof signInSchema>;
export type SignUpForm = z.infer<typeof signUpSchema>;
export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileForm = z.infer<typeof updateProfileSchema>;
export type CreatePortfolioForm = z.infer<typeof createPortfolioSchema>;
export type AddTransactionForm = z.infer<typeof addTransactionSchema>;
export type UpdateTransactionForm = z.infer<typeof updateTransactionSchema>;
export type CreateWatchlistForm = z.infer<typeof createWatchlistSchema>;
export type AddCoinToWatchlistForm = z.infer<typeof addCoinToWatchlistSchema>;
export type CreatePriceAlertForm = z.infer<typeof createPriceAlertSchema>;
export type UpdatePriceAlertForm = z.infer<typeof updatePriceAlertSchema>;
export type SearchCoinsForm = z.infer<typeof searchCoinsSchema>;
export type GetCoinsParams = z.infer<typeof getCoinsSchema>;
export type GetCoinHistoryParams = z.infer<typeof getCoinHistorySchema>;
export type GetNewsParams = z.infer<typeof getNewsSchema>;
export type GetDeFiProtocolsParams = z.infer<typeof getDeFiProtocolsSchema>;
export type ContactForm = z.infer<typeof contactFormSchema>;
export type FeedbackForm = z.infer<typeof feedbackFormSchema>;
