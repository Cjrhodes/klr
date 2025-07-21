// API Configuration for different environments
const isDevelopment = process.env.NODE_ENV === 'development';
const isLocalhost = window.location.hostname === 'localhost';

export const API_BASE_URL = isDevelopment && isLocalhost 
  ? 'http://localhost:8001' 
  : '/api';

export const API_ENDPOINTS = {
  STATUS: `${API_BASE_URL}/status`,
  CONFIGURE: `${API_BASE_URL}/configure`,
  AGENTS_STATUS: `${API_BASE_URL}/agents`,
  CONTENT_GENERATE: `${API_BASE_URL}/content/generate`,
  IMAGE_GENERATE: `${API_BASE_URL}/image/generate`,
  ANALYTICS: `${API_BASE_URL}/analytics/performance`,
  SOCIAL_POST: `${API_BASE_URL}/social/post`,
  SCHEDULE_TASKS: `${API_BASE_URL}/schedule/tasks`
};

export default API_ENDPOINTS;