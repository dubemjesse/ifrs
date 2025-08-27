import { Router } from 'express';
import { DbController } from '../controllers/dbController';
import { ErrorHandler } from '../middleware/errorHandler';
import { AuthMiddleware } from '../middleware/auth';
import { DbValidation } from '../middleware/validation';

const router = Router();

// Protect all DB explorer endpoints
router.use(ErrorHandler.asyncHandler(AuthMiddleware.authenticate));

// GET /api/db/tables - list all tables and views
router.get('/tables', ErrorHandler.asyncHandler(DbController.listTables));

// GET /api/db/tables/:tableId/columns - get columns for table (schema.table)
router.get('/tables/:tableId/columns', DbValidation.getColumns(), ErrorHandler.asyncHandler(DbController.getColumns));

// GET /api/db/tables/:tableId/rows - get rows with pagination, sorting, search
router.get('/tables/:tableId/rows', DbValidation.getRows(), ErrorHandler.asyncHandler(DbController.getRows));

export default router;