// Change: Use import for modules
import "dotenv/config"; // The 'dotenv/config' import handles loading env variables automatically
import express from "express";
import pkg from "pg";


// 1. Import the new authentication routes
import authRoutes from './routes/authRoutes.js';


const { Pool } = pkg;

// The rest of your code remains largely the same
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// --- Database Configuration (using the .env file) ---
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// --- Test Database Connection ---
pool.connect((err, client, release) => {
  if (err) {
    return console.error("Error acquiring client", err.stack);
  }
  console.log("Successfully connected to PostgreSQL database!");
  client.release(); // Release the client back to the pool
});

// --- Simple Test Route ---
app.get("/api/status", (req, res) => {
  res.json({ message: "Internal Ops System API is running successfully." });
});

// 2. Use the authentication routes with a specific prefix
app.use('/api/users', authRoutes);

// --- Server Startup ---
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
  console.log(`Access at: http://localhost:${PORT}/api/status`);
});

// Change: Use export for modules
export { pool };
