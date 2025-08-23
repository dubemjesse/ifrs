// Base API configuration
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3333/api";

// Types and Interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

// API Error class
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errors?: Record<string, string[]>;

  constructor(
    statusCode: number,
    message: string,
    errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

// Token management
class TokenManager {
  private static readonly TOKEN_KEY = "auth_token";
  private static readonly REFRESH_TOKEN_KEY = "refresh_token";

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  static clearTokens(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
}

// HTTP client
class HttpClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = TokenManager.getToken();

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          response.status,
          data.message || "An error occurred",
          data.errors
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, "Network error occurred");
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

// Create HTTP client instance
const httpClient = new HttpClient();

// Authentication service
export class AuthService {
  static async register(
    userData: RegisterRequest
  ): Promise<ApiResponse<AuthResponse>> {
    const response = await httpClient.post<AuthResponse>(
      "/auth/register",
      userData
    );

    if (response.success && response.data) {
      TokenManager.setToken(response.data.token);
      if (response.data.refreshToken) {
        TokenManager.setRefreshToken(response.data.refreshToken);
      }
    }

    return response;
  }

  static async login(
    credentials: LoginRequest
  ): Promise<ApiResponse<AuthResponse>> {
    const response = await httpClient.post<AuthResponse>(
      "/auth/login",
      credentials
    );

    if (response.success && response.data) {
      TokenManager.setToken(response.data.token);
      if (response.data.refreshToken) {
        TokenManager.setRefreshToken(response.data.refreshToken);
      }
    }

    return response;
  }

  static async logout(): Promise<void> {
    try {
      await httpClient.post("/auth/logout");
    } catch (error) {
      console.warn("Logout API call failed:", error);
    } finally {
      TokenManager.clearTokens();
    }
  }

  static async getProfile(): Promise<ApiResponse<User>> {
    return httpClient.get<User>("/auth/profile");
  }

  static async forgotPassword(email: string): Promise<ApiResponse<void>> {
    return httpClient.post<void>("/auth/forgot-password", { email });
  }

  static async resetPassword(
    data: ResetPasswordRequest
  ): Promise<ApiResponse<void>> {
    return httpClient.post<void>("/auth/reset-password", data);
  }

  static async verifyToken(): Promise<
    ApiResponse<{ valid: boolean; user?: User }>
  > {
    const token = TokenManager.getToken();
    if (!token) {
      return { success: false, message: "No token found" };
    }

    return httpClient.post<{ valid: boolean; user?: User }>(
      "/auth/verify-token",
      { token }
    );
  }

  static isAuthenticated(): boolean {
    const token = TokenManager.getToken();
    return token !== null && !TokenManager.isTokenExpired(token);
  }

  static getCurrentUser(): User | null {
    const token = TokenManager.getToken();
    if (!token || TokenManager.isTokenExpired(token)) {
      return null;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return {
        id: payload.userId,
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        isActive: true,
        createdAt: payload.iat
          ? new Date(payload.iat * 1000).toISOString()
          : "",
        updatedAt: payload.iat
          ? new Date(payload.iat * 1000).toISOString()
          : "",
      };
    } catch {
      return null;
    }
  }

  static clearAuth(): void {
    TokenManager.clearTokens();
  }
}

// Export additional utilities
export { TokenManager };
export { httpClient };
