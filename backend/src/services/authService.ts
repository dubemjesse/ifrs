import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { executeQuery } from '../db';
import { User, CreateUserRequest, LoginRequest, UserResponse, AuthResponse, JWTPayload } from '../models/User';
import { PasswordResetToken, CreatePasswordResetRequest, ResetPasswordRequest } from '../models/PasswordReset';
import { AppError, HttpStatusCode } from '../types/common';

const JWT_SECRET: string = process.env.JWT_SECRET || 'your-fallback-secret-key';
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '24h';
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12');

export class AuthService {
  // Hash password using bcrypt
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
  }

  // Verify password against hash
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Generate JWT token
  static generateToken(payload: JWTPayload): string {
    return jwt.sign(
      { userId: payload.userId, email: payload.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
    );
  }

  // Verify JWT token
  static verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
      throw new AppError('Invalid or expired token', HttpStatusCode.UNAUTHORIZED);
    }
  }

  // Generate secure random token for password reset
  static generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Convert User to UserResponse (remove sensitive data)
  static toUserResponse(user: User): UserResponse {
    const { password_hash, ...userResponse } = user;
    return userResponse;
  }

  // Register new user
  static async register(userData: CreateUserRequest): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUserResult = await executeQuery(
        'SELECT id FROM Users WHERE email = @email',
        { email: userData.email }
      );

      if (existingUserResult.recordset.length > 0) {
        throw new AppError('User with this email already exists', HttpStatusCode.CONFLICT);
      }

      // Hash password
      const passwordHash = await this.hashPassword(userData.password);

      // Insert new user
      const insertResult = await executeQuery(`
        INSERT INTO Users (email, password_hash, first_name, last_name, email_verified)
        OUTPUT INSERTED.*
        VALUES (@email, @password_hash, @first_name, @last_name, 0)
      `, {
        email: userData.email,
        password_hash: passwordHash,
        first_name: userData.firstName,
        last_name: userData.lastName
      });

      const newUser = insertResult.recordset[0] as User;
      const userResponse = this.toUserResponse(newUser);

      // Generate JWT token
      const token = this.generateToken({
        userId: newUser.id,
        email: newUser.email
      });

      return {
        user: userResponse,
        token,
        expiresIn: JWT_EXPIRES_IN
      };
    } catch (error) {
      console.error('Registration error details:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Registration failed', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  // Login user
  static async login(loginData: LoginRequest): Promise<AuthResponse> {
    try {
      // Find user by email
      const userResult = await executeQuery(
        'SELECT * FROM Users WHERE email = @email AND is_active = 1',
        { email: loginData.email }
      );

      if (userResult.recordset.length === 0) {
        throw new AppError('Invalid email or password', HttpStatusCode.UNAUTHORIZED);
      }

      const user = userResult.recordset[0] as User;

      // Verify password
      const isPasswordValid = await this.verifyPassword(loginData.password, user.password_hash);
      if (!isPasswordValid) {
        throw new AppError('Invalid email or password', HttpStatusCode.UNAUTHORIZED);
      }

      // Update last login
      await executeQuery(
        'UPDATE Users SET last_login = GETUTCDATE() WHERE id = @id',
        { id: user.id }
      );

      const userResponse = this.toUserResponse(user);
      userResponse.last_login = new Date(); // Update the response with current login time

      // Generate JWT token
      const token = this.generateToken({
        userId: user.id,
        email: user.email
      });

      return {
        user: userResponse,
        token,
        expiresIn: JWT_EXPIRES_IN
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Login failed', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  // Get user by ID
  static async getUserById(userId: number): Promise<UserResponse | null> {
    try {
      const userResult = await executeQuery(
        'SELECT * FROM Users WHERE id = @id AND is_active = 1',
        { id: userId }
      );

      if (userResult.recordset.length === 0) {
        return null;
      }

      const user = userResult.recordset[0] as User;
      return this.toUserResponse(user);
    } catch (error) {
      throw new AppError('Failed to fetch user', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  // Request password reset
  static async requestPasswordReset(email: string): Promise<{ message: string; token?: string }> {
    try {
      // Find user by email
      const userResult = await executeQuery(
        'SELECT id FROM Users WHERE email = @email AND is_active = 1',
        { email }
      );

      if (userResult.recordset.length === 0) {
        // Don't reveal if email exists or not for security
        return { message: 'If the email exists, a password reset link has been sent.' };
      }

      const userId = userResult.recordset[0].id;

      // Generate reset token
      const resetToken = this.generateResetToken();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

      // Invalidate any existing tokens for this user
      await executeQuery(
        'UPDATE PasswordResetTokens SET used = 1 WHERE user_id = @user_id AND used = 0',
        { user_id: userId }
      );

      // Insert new reset token
      await executeQuery(`
        INSERT INTO PasswordResetTokens (user_id, token, expires_at)
        VALUES (@user_id, @token, @expires_at)
      `, {
        user_id: userId,
        token: resetToken,
        expires_at: expiresAt
      });

      // In production, you would send an email here
      // For development, return the token
      return {
        message: 'Password reset link has been sent to your email.',
        token: process.env.NODE_ENV === 'development' ? resetToken : undefined
      };
    } catch (error) {
      throw new AppError('Failed to process password reset request', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  // Reset password using token
  static async resetPassword(resetData: ResetPasswordRequest): Promise<{ message: string }> {
    try {
      // Find valid reset token
      const tokenResult = await executeQuery(`
        SELECT prt.*, u.id as user_id, u.email
        FROM PasswordResetTokens prt
        INNER JOIN Users u ON prt.user_id = u.id
        WHERE prt.token = @token 
          AND prt.used = 0 
          AND prt.expires_at > GETUTCDATE()
          AND u.is_active = 1
      `, { token: resetData.token });

      if (tokenResult.recordset.length === 0) {
        throw new AppError('Invalid or expired reset token', HttpStatusCode.BAD_REQUEST);
      }

      const tokenData = tokenResult.recordset[0];
      const userId = tokenData.user_id;

      // Hash new password
      const newPasswordHash = await this.hashPassword(resetData.new_password);

      // Update user password
      await executeQuery(
        'UPDATE Users SET password_hash = @password_hash, updated_at = GETUTCDATE() WHERE id = @id',
        { password_hash: newPasswordHash, id: userId }
      );

      // Mark token as used
      await executeQuery(
        'UPDATE PasswordResetTokens SET used = 1 WHERE id = @id',
        { id: tokenData.id }
      );

      return { message: 'Password has been reset successfully.' };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to reset password', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  // Validate token and get user
  static async validateTokenAndGetUser(token: string): Promise<UserResponse> {
    const payload = this.verifyToken(token);
    const user = await this.getUserById(payload.userId);
    
    if (!user) {
      throw new AppError('User not found', HttpStatusCode.UNAUTHORIZED);
    }
    
    return user;
  }
}