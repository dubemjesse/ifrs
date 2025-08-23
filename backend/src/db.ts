import * as sql from "mssql/msnodesqlv8";

const config = {
  server: "localhost", // you said it's just localhost
  database: "IFRS", // your target database
  driver: "msnodesqlv8",
  options: {
    trustedConnection: true, // use Windows Authentication
  },
};

export async function connect(): Promise<sql.ConnectionPool> {
  try {
    const pool = await sql.connect(config);
    console.log("✅ Connected to IFRS database on localhost");
    return pool;
  } catch (err) {
    console.error("❌ Database connection error:", err);
    throw err;
  }
}
