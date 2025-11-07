// Change: Use import for modules
import "dotenv/config"; // The 'dotenv/config' import handles loading env variables automatically
import express from "express";
import pkg from "pg";
import cors from "cors";

// 1. Import the new authentication routes
import authRoutes from './routes/authRoutes.js';
import authMiddleware from "./middleware/authMiddleware.js";
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import timeRoutes from "./routes/timeRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import requestRoutes from './routes/requestRoutes.js';

const { Pool } = pkg;

// The rest of your code remains largely the same
const app = express();
const PORT = process.env.PORT || 3000;

// --- CORS Configuration ---
const corsOptions = {
  // Allow requests from your Vite development server
  origin: 'http://localhost:5173', 
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};

app.use(cors(corsOptions)); // <-- NEW MIDDLEWARE

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

// --- Simple Test Route (NOW PROTECTED) ---
// Note: You must now provide a valid JWT in the 'Authorization: Bearer <token>' header
app.get('/api/status', authMiddleware, (req, res) => { // <-- MODIFIED
  // The route handler now has access to the user data
  console.log('Access granted to user:', req.user.user_id); 
  res.json({ 
    message: 'Internal Ops System API is running successfully and protected.',
    user: req.user // Show the attached user data
  });
});

// 2. Use the authentication routes with a specific prefix
app.use('/api/auth', authRoutes);

// 3. Use the project routes
app.use('/api/projects', projectRoutes);

// 4. Use the task routes
app.use('/api/tasks', taskRoutes);

// 5. Use the time tracking routes
app.use('/api/time', timeRoutes);

// 6. Use the user management routes
app.use('/api/users', userRoutes);

// 7. Use the request routes
app.use('/api/requests', requestRoutes);

// --- Server Startup ---
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
  console.log(`Access at: http://localhost:${PORT}/api/status`);
});

// Change: Use export for modules
export { pool };
