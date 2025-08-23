import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { AuthValidation } from '../middleware/validation';
import { AuthMiddleware } from '../middleware/auth';
import { ErrorHandler } from '../middleware/errorHandler';

const router = Router();

// Public routes (no authentication required)

// POST /api/auth/register - Register new user
router.post(
  '/register',
  AuthValidation.register(),
  ErrorHandler.asyncHandler(AuthController.register)
);

// POST /api/auth/login - Login user
router.post(
  '/login',
  AuthValidation.login(),
  ErrorHandler.asyncHandler(AuthController.login)
);

// POST /api/auth/forgot-password - Request password reset
router.post(
  '/forgot-password',
  AuthValidation.requestPasswordReset(),
  ErrorHandler.asyncHandler(AuthController.requestPasswordReset)
);

// POST /api/auth/reset-password - Reset password using token
router.post(
  '/reset-password',
  AuthValidation.resetPassword(),
  ErrorHandler.asyncHandler(AuthController.resetPassword)
);

// POST /api/auth/verify-token - Verify if token is valid
router.post(
  '/verify-token',
  ErrorHandler.asyncHandler(AuthController.verifyToken)
);

// Protected routes (authentication required)

// GET /api/auth/profile - Get current user profile
router.get(
  '/profile',
  ErrorHandler.asyncHandler(AuthMiddleware.authenticate),
  ErrorHandler.asyncHandler(AuthController.getProfile)
);

// POST /api/auth/logout - Logout user (mainly for client-side token removal)
router.post(
  '/logout',
  ErrorHandler.asyncHandler(AuthMiddleware.authenticate),
  ErrorHandler.asyncHandler(AuthController.logout)
);

// POST /api/auth/refresh - Refresh token (placeholder for future implementation)
router.post(
  '/refresh',
  ErrorHandler.asyncHandler(AuthController.refreshToken)
);

export default router;