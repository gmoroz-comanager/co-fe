import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * HTTP service for making API requests
 * Handles common configuration, authentication, and error handling
 */
class HttpService {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.VUE_APP_API_URL || 'http://localhost:1337/api';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Normalize data from Strapi responses
   * Handles both v4 (with attributes) and v5 (direct properties) formats
   * @param item Data item to normalize
   * @returns Normalized data item
   */
  private normalizeData(item: any): any {
    // If the item doesn't have attributes, it's already in the right format
    if (!item || !item.attributes) {
      return item;
    }

    // For Strapi v4 responses with attributes, flatten the structure
    const result = { ...item };
    
    // Copy all properties from attributes to the root level
    Object.assign(result, item.attributes);
    
    // Remove the attributes property to avoid duplication
    delete result.attributes;
    
    return result;
  }

  private setupInterceptors(): void {
    // Request interceptor for adding auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          if (config.headers) {
            config.headers['Authorization'] = `Bearer ${token}`;
          } else {
            config.headers = { 'Authorization': `Bearer ${token}` };
          }
        }

        // Strip service fields from PUT requests to avoid validation errors
        if (config.method === 'put' && config.data?.data) {
          const dataToClean = config.data.data;
          delete dataToClean.id;
          delete dataToClean.documentId;
          delete dataToClean.createdAt;
          delete dataToClean.updatedAt;
          delete dataToClean.publishedAt;
          delete dataToClean.owner; // Owner should not be mutable
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for handling common errors and standardizing Strapi v5 responses
    this.client.interceptors.response.use(
      (response) => {
        // For Strapi responses, ensure consistent format
        if (response.data && response.data.data) {
          // Process arrays of data
          if (Array.isArray(response.data.data)) {
            response.data.data = response.data.data.map((item: any) => this.normalizeData(item));
          } else {
            // Process single data object
            response.data.data = this.normalizeData(response.data.data);
          }
        }
        return response;
      },
      (error) => {
        // Handle authentication errors
        if (error.response && error.response.status === 401) {
          // Clear token and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }

  public async upload<T = any>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Get the base URL (useful for media files)
  public getBaseApiUrl(): string {
    return this.baseURL;
  }

  // Get the base URL without /api suffix
  public getBaseUrl(): string {
    return this.baseURL.replace(/\/api$/, '');
  }
}

// Create singleton instance
const httpService = new HttpService();

export default httpService;
