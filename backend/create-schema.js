const sql = require('mssql/msnodesqlv8');
const fs = require('fs');
const path = require('path');

// Database configuration
const config = {
  server: process.env.DB_SERVER || "localhost",
  database: process.env.DB_DATABASE || "IFRS",
  driver: "msnodesqlv8",
  options: {
    trustedConnection: process.env.DB_TRUSTED_CONNECTION === 'true' || true,
    enableArithAbort: true,
    encrypt: false,
    trustServerCertificate: true
  }
};

async function createSchema() {
  try {
    // Read the schema file
    const schemaPath = path.join(__dirname, 'src', 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Connect to database
    const pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log('Connected to database');
    
    // Split schema into individual statements
    const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await pool.request().query(statement);
          console.log('Executed:', statement.substring(0, 50) + '...');
        } catch (err) {
          if (err.message.includes('already exists')) {
            console.log('Table already exists, skipping...');
          } else {
            console.error('Error executing statement:', err.message);
          }
        }
      }
    }
    
    await pool.close();
    console.log('Schema creation completed!');
    
  } catch (err) {
    console.error('Error creating schema:', err);
    process.exit(1);
  }
}

createSchema();