import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { getPool } from '../db';
import { ApiResponse, HttpStatusCode, ValidationAppError } from '../types/common';

// Utility to normalize column names for exclusion matching
function normalizeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

const EXCLUDED_COL_NORMALIZED = new Set([
  normalizeName('account type'),
  normalizeName('account typeDesc'),
]);

function isExcludedColumn(colName: string): boolean {
  return EXCLUDED_COL_NORMALIZED.has(normalizeName(colName));
}

export class DbController {
  // Handle validation errors from express-validator
  private static handleValidationErrors(req: Request): void {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const validationErrors = errors.array().map(error => ({
        field: (error as any).type === 'field' ? (error as any).path : 'unknown',
        message: (error as any).msg,
        value: (error as any).type === 'field' ? (error as any).value : undefined
      }));
      throw new ValidationAppError('Validation failed', validationErrors);
    }
  }

  // GET /api/db/tables
  static async listTables(req: Request, res: Response): Promise<void> {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT s.name AS schemaName, t.name AS objectName, 'TABLE' AS objectType
      FROM sys.tables t
      JOIN sys.schemas s ON t.schema_id = s.schema_id
      UNION ALL
      SELECT s.name AS schemaName, v.name AS objectName, 'VIEW' AS objectType
      FROM sys.views v
      JOIN sys.schemas s ON v.schema_id = s.schema_id
      ORDER BY schemaName, objectName
    `);

    const data = result.recordset.map((r: any) => ({
      id: `${r.schemaName}.${r.objectName}`,
      schema: r.schemaName,
      name: r.objectName,
      type: r.objectType as 'TABLE' | 'VIEW',
    }));

    const response: ApiResponse = {
      success: true,
      message: 'Tables and views fetched successfully',
      data,
    };
    res.status(HttpStatusCode.OK).json(response);
  }

  // GET /api/db/tables/:tableId/columns  (tableId format: schema.table)
  static async getColumns(req: Request, res: Response): Promise<void> {
    DbController.handleValidationErrors(req);

    const tableId = String(req.params.tableId || '');
    const [schema, table] = tableId.split('.');
    if (!schema || !table) {
      res.status(HttpStatusCode.BAD_REQUEST).json({ success: false, message: 'Invalid table identifier. Use schema.table format' });
      return;
    }

    const pool = await getPool();
    const result = await pool.request()
      .input('schema', schema)
      .input('table', table)
      .query(`
        SELECT c.name AS name,
               TYPE_NAME(c.user_type_id) AS dataType,
               c.max_length AS maxLength,
               c.is_nullable AS isNullable,
               c.column_id AS columnId
        FROM sys.columns c
        JOIN sys.objects o ON c.object_id = o.object_id
        JOIN sys.schemas s ON o.schema_id = s.schema_id
        WHERE s.name = @schema AND o.name = @table
        ORDER BY c.column_id
      `);

    const columns = result.recordset
      .filter((col: any) => !isExcludedColumn(col.name))
      .map((col: any) => ({
        name: col.name,
        dataType: col.dataType,
        maxLength: col.maxLength,
        isNullable: !!col.isNullable,
      }));

    const response: ApiResponse = {
      success: true,
      message: 'Column metadata fetched successfully',
      data: columns,
    };
    res.status(HttpStatusCode.OK).json(response);
  }

  // GET /api/db/tables/:tableId/rows?page=&pageSize=&sort=&order=&search=
  static async getRows(req: Request, res: Response): Promise<void> {
    DbController.handleValidationErrors(req);

    const tableId = String(req.params.tableId || '');
    const [schema, table] = tableId.split('.');
    if (!schema || !table) {
      res.status(HttpStatusCode.BAD_REQUEST).json({ success: false, message: 'Invalid table identifier. Use schema.table format' });
      return;
    }

    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10) || 1);
    const pageSizeRaw = parseInt(String(req.query.pageSize || '25'), 10) || 25;
    const pageSize = Math.min(100, Math.max(1, pageSizeRaw));
    const offset = (page - 1) * pageSize;
    const sort = String(req.query.sort || '').trim();
    const order = String(req.query.order || 'asc').toLowerCase() === 'desc' ? 'DESC' : 'ASC';
    const search = String(req.query.search || '').trim();

    const pool = await getPool();

    // Get allowed columns (and exclude sensitive ones)
    const colsResult = await pool.request()
      .input('schema', schema)
      .input('table', table)
      .query(`
        SELECT c.name AS name, TYPE_NAME(c.user_type_id) AS dataType
        FROM sys.columns c
        JOIN sys.objects o ON c.object_id = o.object_id
        JOIN sys.schemas s ON o.schema_id = s.schema_id
        WHERE s.name = @schema AND o.name = @table
        ORDER BY c.column_id
      `);

    const allColumns: { name: string; dataType: string }[] = colsResult.recordset
      .filter((c: any) => !isExcludedColumn(c.name))
      .map((c: any) => ({ name: c.name, dataType: c.dataType }));

    if (allColumns.length === 0) {
      res.status(HttpStatusCode.OK).json({ success: true, message: 'No columns available', data: { rows: [], total: 0 } });
      return;
    }

    const searchableTypes = new Set(['nvarchar', 'varchar', 'nchar', 'char', 'text', 'ntext']);
    const textColumns = allColumns.filter(c => searchableTypes.has(c.dataType?.toLowerCase?.()));

    const selectCols = allColumns.map(c => `[${c.name.replace(/]/g, ']]')}]`).join(', ');

    // Validate sort column against allowed columns
    const sortColumn = allColumns.find(c => c.name === sort)?.name || allColumns[0].name;

    // Build WHERE clause for search
    let whereClause = '';
    const request = pool.request();
    if (search && textColumns.length > 0) {
      request.input('search', `%${search}%`);
      const likeParts = textColumns.map(c => `[${c.name.replace(/]/g, ']]')}] LIKE @search`);
      whereClause = `WHERE ${likeParts.join(' OR ')}`;
    }

    const tableFullName = `[${schema.replace(/]/g, ']]')}].[${table.replace(/]/g, ']]')}]`;

    // Count total
    const countQuery = `SELECT COUNT(*) AS total FROM ${tableFullName} ${whereClause}`;
    const countResult = await request.query(countQuery);
    const total: number = countResult.recordset?.[0]?.total || 0;

    // Rows query with OFFSET-FETCH
    const rowsQuery = `
      SELECT ${selectCols}
      FROM ${tableFullName}
      ${whereClause}
      ORDER BY [${sortColumn.replace(/]/g, ']]')}] ${order}
      OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY
    `;

    // Need a separate request because previous one consumed by count
    const rowsResult = await pool.request()
      .input('search', search && textColumns.length > 0 ? `%${search}%` : undefined as any)
      .query(rowsQuery);

    const response: ApiResponse = {
      success: true,
      message: 'Rows fetched successfully',
      data: {
        rows: rowsResult.recordset,
        total,
      },
    };
    res.status(HttpStatusCode.OK).json(response);
  }
}