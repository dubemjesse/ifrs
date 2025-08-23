import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationAppError, ApiResponse, HttpStatusCode } from '../types/common';

export class ErrorHandler {
  // Main error handling middleware
  static handle(error: Error, req: Request, res: Response, next: NextFunction): void {
    console.error('Error occurred:', {
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString()
    });

    // Handle validation errors
    if (error instanceof ValidationAppError) {
      const response: ApiResponse = {
        success: false,
        message: error.message,
        error: 'Validation failed',
        errors: error.errors
      };
      res.status(error.statusCode).json(response);
      return;
    }

    // Handle application errors
    if (error instanceof AppError) {
      const response: ApiResponse = {
        success: false,
        message: error.message,
        error: error.message
      };
      res.status(error.statusCode).json(response);
      return;
    }

    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
      const response: ApiResponse = {
        success: false,
        message: 'Invalid token',
        error: 'Authentication failed'
      };
      res.status(HttpStatusCode.UNAUTHORIZED).json(response);
      return;
    }

    if (error.name === 'TokenExpiredError') {
      const response: ApiResponse = {
        success: false,
        message: 'Token expired',
        error: 'Authentication token has expired'
      };
      res.status(HttpStatusCode.UNAUTHORIZED).json(response);
      return;
    }

    // Handle database errors
    if (error.message.includes('UNIQUE constraint failed') || error.message.includes('duplicate key')) {
      const response: ApiResponse = {
        success: false,
        message: 'Resource already exists',
        error: 'Duplicate entry'
      };
      res.status(HttpStatusCode.CONFLICT).json(response);
      return;
    }

    // Handle database connection errors
    if (error.message.includes('connection') || error.message.includes('ECONNREFUSED')) {
      const response: ApiResponse = {
        success: false,
        message: 'Database connection error',
        error: 'Service temporarily unavailable'
      };
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(response);
      return;
    }

    // Handle generic errors
    const response: ApiResponse = {
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    };
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(response);
  }

  // 404 handler for undefined routes
  static notFound(req: Request, res: Response, next: NextFunction): void {
    const response: ApiResponse = {
      success: false,
      message: 'Route not found',
      error: `Cannot ${req.method} ${req.originalUrl}`
    };
    res.status(HttpStatusCode.NOT_FOUND).json(response);
  }

  // Async error wrapper to catch async errors in route handlers
  static asyncHandler(fn: Function) {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  // Rate limiting error handler
  static rateLimitHandler(req: Request, res: Response): void {
    const response: ApiResponse = {
      success: false,
      message: 'Too many requests',
      error: 'Rate limit exceeded. Please try again later.'
    };
    res.status(429).json(response);
  }
}