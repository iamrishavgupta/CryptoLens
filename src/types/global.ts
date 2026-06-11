export interface AppState {
  theme: "light" | "dark" | "system";
  currency: string;
  language: string;
  sidebarCollapsed: boolean;
  notifications: Notification[];
  loading: boolean;
  error: string | null;

  setTheme: (theme: "light" | "dark" | "system") => void;
  setCurrency: (currency: string) => void;
  setLanguage: (language: string) => void;
  toggleSidebar: () => void;
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp">
  ) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: NotificationAction;
}

export interface NotificationAction {
  label: string;
  onClick: () => void;
}

export interface NavigationItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
  children?: NavigationItem[];
  roles?: string[];
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag?: string;
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag?: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

export interface ApiError {
  message: string;
  code?: string | number;
  status?: number;
  details?: Record<string, unknown>;
}

export interface PaginatedData<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface SortConfig {
  key: string;
  direction: "asc" | "desc";
}

export interface FilterConfig {
  [key: string]: string | number | boolean | undefined | null | unknown;
}

export interface SearchConfig {
  query: string;
  filters: FilterConfig;
  sort: SortConfig;
}

export interface TableColumn<T = unknown> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: unknown, item: T) => React.ReactNode;
  className?: string;
  width?: string;
}

export interface ChartConfig {
  type: "line" | "candlestick" | "bar" | "area";
  timeframe: string;
  indicators: string[];
  theme: "light" | "dark";
  height: number;
  responsive: boolean;
}

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  description?: string;
  rolloutPercentage?: number;
  targetUsers?: string[];
  environment?: "development" | "staging" | "production";
}

export interface Analytics {
  pageViews: number;
  uniqueVisitors: number;
  bounceRate: number;
  averageSessionDuration: number;
  topPages: Array<{
    path: string;
    views: number;
  }>;
  topCountries: Array<{
    country: string;
    visitors: number;
  }>;
  deviceTypes: Array<{
    type: string;
    percentage: number;
  }>;
}

export interface Performance {
  loadTime: number;
  ttfb: number; // Time to First Byte
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
}

export interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  canonicalUrl?: string;
  robots?: string;
  structuredData?: Record<string, unknown>;
}

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface Modal {
  id: string;
  component: React.ComponentType<Record<string, unknown>>;
  props?: Record<string, unknown>;
  options?: {
    dismissible?: boolean;
    size?: "sm" | "md" | "lg" | "xl" | "full";
    blur?: boolean;
  };
}

export interface FormField {
  name: string;
  label: string;
  type:
    | "text"
    | "email"
    | "password"
    | "number"
    | "select"
    | "checkbox"
    | "radio"
    | "textarea"
    | "date"
    | "file";
  placeholder?: string;
  required?: boolean;
  validation?: import("zod").ZodSchema<unknown>; // Zod schema
  options?: Array<{ label: string; value: unknown }>;
  disabled?: boolean;
  hidden?: boolean;
}

export interface FormConfig {
  fields: FormField[];
  submitLabel?: string;
  resetLabel?: string;
  onSubmit: (data: Record<string, unknown>) => Promise<void> | void;
  onReset?: () => void;
  loading?: boolean;
  className?: string;
}
