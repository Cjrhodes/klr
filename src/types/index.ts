// Re-export all types for easy importing
export * from './api';

// Additional common types that might be used across the application
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'author' | 'admin' | 'editor';
  preferences: {
    defaultPlatforms: string[];
    timezone: string;
    notifications: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string[];
  description: string;
  publishedDate: string;
  isbn?: string;
  coverImageUrl?: string;
  salesData?: {
    totalSales: number;
    monthlyTrend: number;
    platforms: {
      platform: string;
      sales: number;
    }[];
  };
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  bookId: string;
  startDate: string;
  endDate: string;
  platforms: string[];
  posts: string[];
  budget?: number;
  status: 'draft' | 'active' | 'paused' | 'completed';
  metrics?: {
    impressions: number;
    engagement: number;
    clicks: number;
    conversions: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ContentTemplate {
  id: string;
  name: string;
  type: 'quote' | 'behind_scenes' | 'book_promo' | 'author_life' | 'horror_tips' | 'interactive';
  title: string;
  description: string;
  template: string;
  platforms: string[];
  variables?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsReport {
  id: string;
  title: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  dateRange: {
    start: string;
    end: string;
  };
  platforms: string[];
  metrics: {
    [key: string]: number;
  };
  insights: string[];
  recommendations: string[];
  generatedAt: string;
}

// Utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

// Event types for real-time updates
export interface EventMessage {
  type: string;
  data: any;
  timestamp: string;
  userId?: string;
}

// Configuration types
export interface AppConfig {
  apiKeys: {
    [key: string]: string;
  };
  features: {
    [key: string]: boolean;
  };
  limits: {
    maxPostsPerDay: number;
    maxImagesPerMonth: number;
    maxAIRequests: number;
  };
  defaultSettings: {
    timezone: string;
    dateFormat: string;
    theme: 'light' | 'dark';
  };
}