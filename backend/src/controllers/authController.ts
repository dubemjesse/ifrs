import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AuthService } from '../services/authService';
import { CreateUserRequest, LoginRequest } from '../models/User';
import { ResetPasswordRequest } from '../models/PasswordReset';
import { ApiResponse, AppError, HttpStatusCode, ValidationAppError } from '../types/common';

export class AuthController {
  // Helper method to handle validation errors
  private static handleValidationErrors(req: Request): void {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const validationErrors = errors.array().map(error => ({
        field: error.type === 'field' ? (error as any).path : 'unknown',
        message: error.msg,
        value: error.type === 'field' ? (error as any).value : undefined
      }));
      throw new ValidationAppError('Validation failed', validationErrors);
    }
  }

  // Helper method to send success response
  private static sendSuccessResponse<T>(
    res: Response,
    data: T,
    message: string = 'Success',
    statusCode: number = HttpStatusCode.OK
  ): void {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data
    };
    res.status(statusCode).json(response);
  }

  // Helper method to send error response
  private static sendErrorResponse(
    res: Response,
    error: string,
    message: string = 'An error occurred',
    statusCode: number = HttpStatusCode.INTERNAL_SERVER_ERROR,
    errors?: any[]
  ): void {
    const response: ApiResponse = {
      success: false,
      message,
      error,
      errors
    };
    res.status(statusCode).json(response);
  }

  // Register new user
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      AuthController.handleValidationErrors(req);

      const userData: CreateUserRequest = {
        email: req.body.email,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName
      };

      const authResponse = await AuthService.register(userData);
      
      AuthController.sendSuccessResponse(
        res,
        authResponse,
        'User registered successfully',
        HttpStatusCode.CREATED
      );
    } catch (error) {
      next(error);
    }
  }

  // Login user
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      AuthController.handleValidationErrors(req);

      const loginData: LoginRequest = {
        email: req.body.email,
        password: req.body.password
      };

      const authResponse = await AuthService.login(loginData);
      
      AuthController.sendSuccessResponse(
        res,
        authResponse,
        'Login successful'
      );
    } catch (error) {
      next(error);
    }
  }

  // Get current user profile
  static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // User ID should be available from auth middleware
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        throw new AppError('User not authenticated', HttpStatusCode.UNAUTHORIZED);
      }

      const user = await AuthService.getUserById(userId);
      
      if (!user) {
        throw new AppError('User not found', HttpStatusCode.NOT_FOUND);
      }

      AuthController.sendSuccessResponse(
        res,
        user,
        'Profile retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  // Request password reset
  static async requestPasswordReset(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      AuthController.handleValidationErrors(req);

      const { email } = req.body;
      const result = await AuthService.requestPasswordReset(email);
      
      AuthController.sendSuccessResponse(
        res,
        result,
        'Password reset request processed'
      );
    } catch (error) {
      next(error);
    }
  }

  // Reset password using token
  static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      AuthController.handleValidationErrors(req);

      const resetData: ResetPasswordRequest = {
        token: req.body.token,
        new_password: req.body.new_password
      };

      const result = await AuthService.resetPassword(resetData);
      
      AuthController.sendSuccessResponse(
        res,
        result,
        'Password reset successful'
      );
    } catch (error) {
      next(error);
    }
  }

  // Verify token (useful for frontend to check if token is still valid)
  static async verifyToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AppError('No token provided', HttpStatusCode.UNAUTHORIZED);
      }

      const token = authHeader.substring(7);
      const user = await AuthService.validateTokenAndGetUser(token);
      
      AuthController.sendSuccessResponse(
        res,
        { user, valid: true },
        'Token is valid'
      );
    } catch (error) {
      next(error);
    }
  }

  // Logout (for stateless JWT, this is mainly for client-side token removal)
  static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // In a stateless JWT system, logout is handled client-side
      // But we can still provide an endpoint for consistency
      AuthController.sendSuccessResponse(
        res,
        { message: 'Logged out successfully' },
        'Logout successful'
      );
    } catch (error) {
      next(error);
    }
  }

  // Refresh token (if implementing refresh token logic)
  static async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // This would be implemented if using refresh tokens
      // For now, return a not implemented response
      throw new AppError('Refresh token not implemented', HttpStatusCode.NOT_FOUND);
    } catch (error) {
      next(error);
    }
  }
}