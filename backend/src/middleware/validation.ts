import { body, param, query, ValidationChain } from 'express-validator';

export class AuthValidation {
  // Validation for user registration
  static register(): ValidationChain[] {
    return [
      body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
      
      body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
      
      body('firstName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('First name can only contain letters and spaces'),
      
      body('lastName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Last name can only contain letters and spaces')
    ];
  }

  // Validation for user login
  static login(): ValidationChain[] {
    return [
      body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
      
      body('password')
        .notEmpty()
        .withMessage('Password is required')
    ];
  }

  // Validation for password reset request
  static requestPasswordReset(): ValidationChain[] {
    return [
      body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address')
    ];
  }

  // Validation for password reset
  static resetPassword(): ValidationChain[] {
    return [
      body('token')
        .notEmpty()
        .withMessage('Reset token is required')
        .isLength({ min: 32, max: 128 })
        .withMessage('Invalid reset token format'),
      
      body('new_password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
    ];
  }

  // Validation for updating user profile
  static updateProfile(): ValidationChain[] {
    return [
      body('first_name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('First name can only contain letters and spaces'),
      
      body('last_name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Last name can only contain letters and spaces'),
      
      body('email')
        .optional()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address')
    ];
  }

  // Validation for changing password
  static changePassword(): ValidationChain[] {
    return [
      body('current_password')
        .notEmpty()
        .withMessage('Current password is required'),
      
      body('new_password')
        .isLength({ min: 8 })
        .withMessage('New password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
      
      body('confirm_password')
        .custom((value, { req }) => {
          if (value !== req.body.new_password) {
            throw new Error('Password confirmation does not match new password');
          }
          return true;
        })
    ];
  }
}

// DB Explorer validation
export class DbValidation {
  static getColumns(): ValidationChain[] {
    return [
      param('tableId')
        .isString()
        .withMessage('tableId is required')
        .matches(/^[A-Za-z0-9_]+\.[A-Za-z0-9_]+$/)
        .withMessage('tableId must be in schema.table format with alphanumeric or underscore characters only'),
    ];
  }

  static getRows(): ValidationChain[] {
    return [
      param('tableId')
        .isString()
        .withMessage('tableId is required')
        .matches(/^[A-Za-z0-9_]+\.[A-Za-z0-9_]+$/)
        .withMessage('tableId must be in schema.table format with alphanumeric or underscore characters only'),
      query('page')
        .optional()
        .toInt()
        .isInt({ min: 1 })
        .withMessage('page must be a positive integer'),
      query('pageSize')
        .optional()
        .toInt()
        .isInt({ min: 1, max: 100 })
        .withMessage('pageSize must be between 1 and 100'),
      query('sort')
        .optional()
        .isString()
        .trim()
        .isLength({ max: 128 })
        .withMessage('sort must be a string up to 128 characters'),
      query('order')
        .optional()
        .isString()
        .trim()
        .customSanitizer((v) => (typeof v === 'string' ? v.toLowerCase() : v))
        .isIn(['asc', 'desc'])
        .withMessage('order must be either asc or desc'),
      query('search')
        .optional()
        .isString()
        .trim()
        .isLength({ max: 200 })
        .withMessage('search must be a string up to 200 characters'),
    ];
  }
}