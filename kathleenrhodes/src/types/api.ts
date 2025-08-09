// API Configuration Types
export interface APIServiceConfig {
  apiKey?: string;
  baseUrl: string;
  accessToken?: string;
  apiSecret?: string;
  accessSecret?: string;
  identifier?: string;
  password?: string;
  id?: string;
}

export interface AIServiceConfig {
  anthropic: {
    apiKey: string;
    baseUrl: string;
  };
  openai: {
    apiKey: string;
    baseUrl: string;
  };
}

export interface SocialMediaConfig {
  instagram: {
    accessToken: string;
    baseUrl: string;
  };
  facebook: {
    accessToken: string;
    baseUrl: string;
  };
  twitter: {
    apiKey: string;
    apiSecret: string;
    accessToken: string;
    accessSecret: string;
    baseUrl: string;
  };
  tiktok: {
    apiKey: string;
    baseUrl: string;
  };
  threads: {
    accessToken: string;
    baseUrl: string;
  };
  bluesky: {
    identifier: string;
    password: string;
    baseUrl: string;
  };
}

export interface ImageGenerationConfig {
  midjourney: {
    apiKey: string;
    baseUrl: string;
  };
  dalle: {
    apiKey: string;
    baseUrl: string;
  };
  stability: {
    apiKey: string;
    baseUrl: string;
  };
}

export interface UnifiedSocialConfig {
  ayrshare: {
    apiKey: string;
    baseUrl: string;
  };
  buffer: {
    accessToken: string;
    baseUrl: string;
  };
  hootsuite: {
    accessToken: string;
    baseUrl: string;
  };
}

export interface AnalyticsConfig {
  googleAnalytics: {
    id: string;
  };
  facebookPixel: {
    id: string;
  };
}

export interface EmailMarketingConfig {
  mailchimp: {
    apiKey: string;
    baseUrl: string;
  };
  convertkit: {
    apiKey: string;
    baseUrl: string;
  };
}

export interface BookSalesConfig {
  amazon: {
    apiKey: string;
    baseUrl: string;
  };
  bookbub: {
    apiKey: string;
    baseUrl: string;
  };
}

// Complete API Configuration Interface
export interface APIConfiguration extends 
  AIServiceConfig, 
  SocialMediaConfig, 
  ImageGenerationConfig, 
  UnifiedSocialConfig, 
  AnalyticsConfig, 
  EmailMarketingConfig, 
  BookSalesConfig {}

// Platform Types
export type SocialPlatform = 'instagram' | 'facebook' | 'twitter' | 'tiktok' | 'threads' | 'bluesky';
export type AIProvider = 'anthropic' | 'openai';
export type ImageProvider = 'midjourney' | 'dalle' | 'stability';
export type UnifiedSocialProvider = 'ayrshare' | 'buffer' | 'hootsuite';

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination?: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

// Social Media Post Types
export interface SocialMediaPostData {
  id: string;
  platform: SocialPlatform;
  content: string;
  mediaUrls?: string[];
  hashtags?: string[];
  engagement?: {
    likes: number;
    shares: number;
    comments: number;
    views?: number;
  };
  scheduledAt?: string;
  publishedAt?: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
}

// AI Generation Types
export interface AIContentRequest {
  prompt: string;
  context?: string;
  tone?: string;
  platform?: SocialPlatform;
  maxLength?: number;
  includeHashtags?: boolean;
  includeImagePrompt?: boolean;
}

export interface AIContentResponse {
  text: string;
  hashtags?: string[];
  imagePrompt?: string;
  metadata?: {
    wordCount: number;
    characterCount: number;
    readingTime: number;
  };
}

export interface AIImageRequest {
  prompt: string;
  style?: string;
  size?: '256x256' | '512x512' | '1024x1024';
  quality?: 'standard' | 'hd';
  count?: number;
}

export interface AIImageResponse {
  imageUrl: string;
  prompt: string;
  size: string;
  createdAt: string;
}

// Analytics Types
export interface AnalyticsData {
  platform: SocialPlatform;
  metrics: {
    impressions: number;
    engagement: number;
    clicks: number;
    shares: number;
    comments: number;
    likes: number;
    followers: number;
  };
  timeRange: {
    start: string;
    end: string;
  };
  posts: SocialMediaPostData[];
}

// Configuration Status Types
export interface ConfigurationStatus {
  service: string;
  configured: boolean;
  missingFields: string[];
  lastChecked: string;
}

export interface ServiceHealth {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime?: number;
  lastCheck: string;
  error?: string;
}

// Error Types
export interface APIError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Webhook Types
export interface WebhookPayload {
  event: string;
  data: any;
  timestamp: string;
  signature?: string;
}

// Scheduling Types
export interface ScheduledPost {
  id: string;
  content: string;
  platforms: SocialPlatform[];
  scheduledFor: string;
  mediaUrls?: string[];
  hashtags?: string[];
  status: 'pending' | 'sent' | 'failed';
  createdAt: string;
  updatedAt: string;
}