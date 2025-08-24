export interface User {
  id: number;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: Date;
  updated_at: Date;
  last_login: Date | null;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date | null;
}

export interface AuthResponse {
  user: UserResponse;
  token: string;
  refreshToken?: string;
  expiresIn: string;
}

export interface JWTPayload {
  userId: number;
  email: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  userId: number;
  tokenVersion: number;
  iat?: number;
  exp?: number;
}