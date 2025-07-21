// API Configuration
export const API_CONFIG = {
  // AI Services
  anthropic: {
    apiKey: process.env.REACT_APP_ANTHROPIC_API_KEY || '',
    baseUrl: 'https://api.anthropic.com/v1',
  },
  openai: {
    apiKey: process.env.REACT_APP_OPENAI_API_KEY || '',
    baseUrl: 'https://api.openai.com/v1',
  },

  // Social Media APIs
  instagram: {
    accessToken: process.env.REACT_APP_INSTAGRAM_ACCESS_TOKEN || '',
    baseUrl: 'https://graph.instagram.com/v17.0',
  },
  facebook: {
    accessToken: process.env.REACT_APP_FACEBOOK_ACCESS_TOKEN || '',
    baseUrl: 'https://graph.facebook.com/v17.0',
  },
  twitter: {
    apiKey: process.env.REACT_APP_TWITTER_API_KEY || '',
    apiSecret: process.env.REACT_APP_TWITTER_API_SECRET || '',
    accessToken: process.env.REACT_APP_TWITTER_ACCESS_TOKEN || '',
    accessSecret: process.env.REACT_APP_TWITTER_ACCESS_SECRET || '',
    baseUrl: 'https://api.twitter.com/2',
  },
  tiktok: {
    apiKey: process.env.REACT_APP_TIKTOK_API_KEY || '',
    baseUrl: 'https://open-api.tiktok.com/v1.3',
  },
  threads: {
    accessToken: process.env.REACT_APP_THREADS_ACCESS_TOKEN || '',
    baseUrl: 'https://graph.threads.net/v1.0',
  },
  bluesky: {
    identifier: process.env.REACT_APP_BLUESKY_IDENTIFIER || '',
    password: process.env.REACT_APP_BLUESKY_PASSWORD || '',
    baseUrl: 'https://bsky.social/xrpc',
  },

  // Image Generation APIs
  midjourney: {
    apiKey: process.env.REACT_APP_MIDJOURNEY_API_KEY || '',
    baseUrl: 'https://api.midjourney.com/v1',
  },
  dalle: {
    apiKey: process.env.REACT_APP_DALL_E_API_KEY || '',
    baseUrl: 'https://api.openai.com/v1',
  },
  stability: {
    apiKey: process.env.REACT_APP_STABILITY_API_KEY || '',
    baseUrl: 'https://api.stability.ai/v1',
  },

  // Unified Social Media Services
  ayrshare: {
    apiKey: process.env.REACT_APP_AYRSHARE_API_KEY || '',
    baseUrl: 'https://app.ayrshare.com/api',
  },
  buffer: {
    accessToken: process.env.REACT_APP_BUFFER_ACCESS_TOKEN || '',
    baseUrl: 'https://api.bufferapp.com/1',
  },
  hootsuite: {
    accessToken: process.env.REACT_APP_HOOTSUITE_ACCESS_TOKEN || '',
    baseUrl: 'https://platform.hootsuite.com/v1',
  },

  // Analytics APIs
  googleAnalytics: {
    id: process.env.REACT_APP_GOOGLE_ANALYTICS_ID || '',
  },
  facebookPixel: {
    id: process.env.REACT_APP_FACEBOOK_PIXEL_ID || '',
  },

  // Email Marketing
  mailchimp: {
    apiKey: process.env.REACT_APP_MAILCHIMP_API_KEY || '',
    baseUrl: 'https://us1.api.mailchimp.com/3.0', // Update datacenter as needed
  },
  convertkit: {
    apiKey: process.env.REACT_APP_CONVERTKIT_API_KEY || '',
    baseUrl: 'https://api.convertkit.com/v3',
  },

  // Book Sales APIs
  amazon: {
    apiKey: process.env.REACT_APP_AMAZON_API_KEY || '',
    baseUrl: 'https://webservices.amazon.com/paapi5',
  },
  bookbub: {
    apiKey: process.env.REACT_APP_BOOKBUB_API_KEY || '',
    baseUrl: 'https://partners.bookbub.com/api/v1',
  },
};

// Helper function to check if API keys are configured
export const isConfigured = (service: keyof typeof API_CONFIG): boolean => {
  const config = API_CONFIG[service];
  if (!config) return false;
  
  // Check if any required key is missing
  return Object.values(config).some(value => value !== '');
};

// Helper function to get missing configurations
export const getMissingConfigs = (): string[] => {
  const missing: string[] = [];
  
  Object.entries(API_CONFIG).forEach(([service, config]) => {
    const hasValidConfig = Object.values(config).some(value => value !== '');
    if (!hasValidConfig) {
      missing.push(service);
    }
  });
  
  return missing;
};