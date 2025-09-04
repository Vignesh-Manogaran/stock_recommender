import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import type { APIResponse, APIError } from '@/types';

// Create axios instance for general API calls
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.example.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create axios instance for OpenRouter AI API
const openRouterClient: AxiosInstance = axios.create({
  baseURL: 'https://openrouter.ai/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
    'HTTP-Referer': window.location.origin,
    'X-Title': import.meta.env.VITE_APP_NAME || 'StockSense India',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add timestamp to prevent caching
    config.params = {
      ...config.params,
      _t: Date.now(),
    };
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    const apiError: APIError = {
      code: error.response?.status?.toString() || 'NETWORK_ERROR',
      message: error.response?.data?.message || error.message || 'An error occurred',
      details: error.response?.data,
    };
    
    console.error('API Error:', apiError);
    return Promise.reject(apiError);
  }
);

// Similar interceptor for OpenRouter
openRouterClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    const apiError: APIError = {
      code: error.response?.status?.toString() || 'AI_API_ERROR',
      message: error.response?.data?.error?.message || error.message || 'AI API error occurred',
      details: error.response?.data,
    };
    
    console.error('OpenRouter API Error:', apiError);
    return Promise.reject(apiError);
  }
);

// Generic API methods
export const apiService = {
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<APIResponse<T>> => {
    const response = await apiClient.get<APIResponse<T>>(url, config);
    return response.data;
  },

  post: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<APIResponse<T>> => {
    const response = await apiClient.post<APIResponse<T>>(url, data, config);
    return response.data;
  },

  put: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<APIResponse<T>> => {
    const response = await apiClient.put<APIResponse<T>>(url, data, config);
    return response.data;
  },

  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<APIResponse<T>> => {
    const response = await apiClient.delete<APIResponse<T>>(url, config);
    return response.data;
  },
};

// OpenRouter AI API methods
export const aiService = {
  chat: async (messages: any[], model?: string): Promise<any> => {
    const response = await openRouterClient.post('/chat/completions', {
      model: model || import.meta.env.VITE_DEFAULT_MODEL || 'anthropic/claude-3-sonnet',
      messages,
      max_tokens: 1000,
      temperature: 0.7,
      stream: false,
    });
    return response.data;
  },

  streamChat: async (messages: any[], model?: string, onChunk?: (chunk: string) => void): Promise<void> => {
    const response = await openRouterClient.post('/chat/completions', {
      model: model || import.meta.env.VITE_DEFAULT_MODEL || 'anthropic/claude-3-sonnet',
      messages,
      max_tokens: 1000,
      temperature: 0.7,
      stream: true,
    }, {
      responseType: 'stream'
    });

    // Handle streaming response
    const reader = response.data.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;
          
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content && onChunk) {
              onChunk(content);
            }
          } catch (e) {
            console.warn('Failed to parse streaming chunk:', e);
          }
        }
      }
    }
  },
};

// Rate limiting utility
class RateLimiter {
  private requests: number[] = [];
  private maxRequests: number;
  private timeWindow: number;

  constructor(maxRequests: number = 10, timeWindowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindowMs;
  }

  async checkLimit(): Promise<void> {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.timeWindow);

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.timeWindow - (now - oldestRequest);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.requests.push(now);
  }
}

export const rateLimiter = new RateLimiter(10, 60000); // 10 requests per minute

// Export the clients for direct use if needed
export { apiClient, openRouterClient };

// Health check function
export const healthCheck = async (): Promise<boolean> => {
  try {
    await apiClient.get('/health', { timeout: 5000 });
    return true;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
};

// AI API health check
export const aiHealthCheck = async (): Promise<boolean> => {
  try {
    await openRouterClient.get('/models', { timeout: 5000 });
    return true;
  } catch (error) {
    console.error('AI API health check failed:', error);
    return false;
  }
};