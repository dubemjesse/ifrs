import * as sql from "mssql/msnodesqlv8";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const config: sql.config = {
  server: process.env.DB_SERVER || "localhost",
  database: process.env.DB_DATABASE || "IFRS",
  driver: "msnodesqlv8",
  options: {
    trustedConnection: process.env.DB_TRUSTED_CONNECTION === 'true',
    enableArithAbort: true,
    encrypt: false, // Set to true if using Azure SQL
    trustServerCertificate: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
    acquireTimeoutMillis: 60000,
    createTimeoutMillis: 60000,
    destroyTimeoutMillis: 5000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 200
  }
};

let pool: sql.ConnectionPool | null = null;

export async function getPool(): Promise<sql.ConnectionPool> {
  if (!pool) {
    try {
      pool = new sql.ConnectionPool(config);
      await pool.connect();
      console.log("✅ Connected to IFRS database with connection pool");
      
      // Handle pool errors
      pool.on('error', (err) => {
        console.error('❌ Database pool error:', err);
        pool = null;
      });
      
    } catch (err) {
      console.error("❌ Database connection error:", err);
      pool = null;
      throw err;
    }
  }
  return pool;
}

export async function closePool(): Promise<void> {
  if (pool) {
    try {
      await pool.close();
      pool = null;
      console.log("✅ Database connection pool closed");
    } catch (err) {
      console.error("❌ Error closing database pool:", err);
    }
  }
}

// Legacy function for backward compatibility
export async function connect(): Promise<sql.ConnectionPool> {
  return getPool();
}

// Helper function to execute queries with proper error handling
export async function executeQuery<T = any>(query: string, params?: any): Promise<sql.IResult<T>> {
  const pool = await getPool();
  const request = pool.request();
  
  // Add parameters if provided
  if (params) {
    Object.keys(params).forEach(key => {
      request.input(key, params[key]);
    });
  }
  
  return request.query(query);
}

// Helper function for stored procedures
export async function executeProcedure<T = any>(procedureName: string, params?: any): Promise<sql.IProcedureResult<T>> {
  const pool = await getPool();
  const request = pool.request();
  
  // Add parameters if provided
  if (params) {
    Object.keys(params).forEach(key => {
      request.input(key, params[key]);
    });
  }
  
  return request.execute(procedureName);
}
