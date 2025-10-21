import { httpService } from '@/core/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  linkedinUrl: string;
}

export interface AuthResponse {
  jwt: string;
  user: {
    id: number;
    username: string;
    email: string;
    [key: string]: any;
  };
}

/**
 * Authentication service for handling login, registration, and logout
 */
class AuthService {
  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await httpService.post<AuthResponse>('/auth/local', {
      identifier: credentials.email,
      password: credentials.password
    });
    
    this.setAuthData(response.data);
    return response.data;
  }

  /**
   * Register a new user
   * Note: Does not return JWT - account must be activated by admin first
   */
  async register(data: RegisterData): Promise<any> {
    const response = await httpService.post<any>('/auth/local/register', {
      username: data.username,
      email: data.email,
      password: data.password,
      linkedinUrl: data.linkedinUrl
    });
    
    // Don't set auth data - user needs activation
    return response.data;
  }

  /**
   * Logout the current user
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  /**
   * Get current user data
   */
  getCurrentUser(): any {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Fetch current user profile
   */
  async fetchCurrentUser(): Promise<any> {
    const response = await httpService.get('/users/me');
    const user = response.data;
    
    // Update local storage with fresh user data
    localStorage.setItem('user', JSON.stringify(user));
    
    return user;
  }

  /**
   * Set authentication data in local storage
   */
  private setAuthData(authData: AuthResponse): void {
    localStorage.setItem('token', authData.jwt);
    localStorage.setItem('user', JSON.stringify(authData.user));
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;
