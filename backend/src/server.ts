import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import helmet from "helmet";
import dotenv from "dotenv";
import { connect } from "./db";
import authRoutes from "./routes/auth";
import { ErrorHandler } from "./middleware/errorHandler";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3333;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

connect()
  .then(async (pool) => {
    console.log("Connected to IFRS DB successfully");

    // Test query to fetch first 5 records from ifrs_trial_balance
    try {
      const result = await pool
        .request()
        .query("SELECT TOP 5 * FROM ifrs_trial_balance");
      console.log("First 5 records from ifrs_trial_balance:");
      console.log(result.recordset);
    } catch (queryErr) {
      console.log("Error querying ifrs_trial_balance:");
      console.log(queryErr);
    }
  })
  .catch((err) => {
    console.log("Error connecting to the database");
    console.log(err);
  });

// Health check endpoint
app.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "IFRS Backend API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

// API routes
app.use("/api/auth", authRoutes);

// 404 handler for undefined routes
app.use(ErrorHandler.notFound);

// Global error handler (must be last)
app.use(ErrorHandler.handle);

app.listen(port, () => {
  console.log(`IFRS app listening on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});
