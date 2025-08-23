import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { AppError, HttpStatusCode, ApiResponse } from '../types/common';

// Extend Request interface to include user data
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        email: string;
      };
    }
  }
}

export class AuthMiddleware {
  // Main authentication middleware
  static async authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        throw new AppError('Access token is required', HttpStatusCode.UNAUTHORIZED);
      }

      if (!authHeader.startsWith('Bearer ')) {
        throw new AppError('Invalid token format. Use Bearer <token>', HttpStatusCode.UNAUTHORIZED);
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      
      if (!token) {
        throw new AppError('Access token is required', HttpStatusCode.UNAUTHORIZED);
      }

      // Verify token and get user data
      const payload = AuthService.verifyToken(token);
      
      // Verify user still exists and is active
      const user = await AuthService.getUserById(payload.userId);
      
      if (!user) {
        throw new AppError('User not found or inactive', HttpStatusCode.UNAUTHORIZED);
      }

      // Add user data to request object
      req.user = {
        userId: user.id,
        email: user.email
      };

      next();
    } catch (error) {
      if (error instanceof AppError) {
        const response: ApiResponse = {
          success: false,
          message: 'Authentication failed',
          error: error.message
        };
        res.status(error.statusCode).json(response);
      } else {
        const response: ApiResponse = {
          success: false,
          message: 'Authentication failed',
          error: 'Invalid or expired token'
        };
        res.status(HttpStatusCode.UNAUTHORIZED).json(response);
      }
    }
  }

  // Optional authentication middleware (doesn't fail if no token)
  static async optionalAuthenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // No token provided, continue without authentication
        return next();
      }

      const token = authHeader.substring(7);
      
      if (!token) {
        return next();
      }

      // Try to verify token
      const payload = AuthService.verifyToken(token);
      const user = await AuthService.getUserById(payload.userId);
      
      if (user) {
        req.user = {
          userId: user.id,
          email: user.email
        };
      }

      next();
    } catch (error) {
      // If token is invalid, continue without authentication
      next();
    }
  }

  // Middleware to check if user is authenticated (use after authenticate middleware)
  static requireAuth(req: Request, res: Response, next: NextFunction): void {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        message: 'Authentication required',
        error: 'You must be logged in to access this resource'
      };
      res.status(HttpStatusCode.UNAUTHORIZED).json(response);
      return;
    }
    next();
  }

  // Middleware to check if user has specific role (for future role-based access)
  static requireRole(roles: string[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          message: 'Authentication required',
          error: 'You must be logged in to access this resource'
        };
        res.status(HttpStatusCode.UNAUTHORIZED).json(response);
        return;
      }

      // For now, we don't have roles implemented
      // This is a placeholder for future role-based access control
      next();
    };
  }

  // Middleware to extract user info from token without requiring authentication
  static async extractUserInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        
        if (token) {
          try {
            const payload = AuthService.verifyToken(token);
            const user = await AuthService.getUserById(payload.userId);
            
            if (user) {
              req.user = {
                userId: user.id,
                email: user.email
              };
            }
          } catch (error) {
            // Ignore token errors in this middleware
          }
        }
      }
      
      next();
    } catch (error) {
      next();
    }
  }
}