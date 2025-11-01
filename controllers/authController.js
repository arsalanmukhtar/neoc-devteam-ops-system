// File: controllers/authController.js

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../server.js";

const saltRounds = 10;
const JWT_SECRET = "YOUR_SUPER_SECURE_JWT_SECRET"; // Use .env for this!

// --- Register User Logic ---
export const register = async (req, res) => {
  const { first_name, last_name, email, password, role_id } = req.body;

  if (!email || !password || !first_name || !last_name) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const password_hash = await bcrypt.hash(password, saltRounds);
    const default_role_id = role_id || 3;

    const result = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, role_id) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING user_id, first_name, email`,
      [first_name, last_name, email, password_hash, default_role_id]
    );

    res.status(201).json({
      message: "User registered successfully.",
      user: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ error: "Email already exists" });
    }
    console.error("Registration error:", error);
    res.status(500).json({ error: "Server error during registration." });
  }
};

// --- Login User Logic ---
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const result = await pool.query(
      `SELECT user_id, password_hash, role_id, is_active 
             FROM users 
             WHERE email = $1`,
      [email]
    );

    const user = result.rows[0];

    if (!user || !user.is_active) {
      return res
        .status(401)
        .json({ error: "Invalid credentials or inactive account." });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const token = jwt.sign(
      { user_id: user.user_id, role_id: user.role_id },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful.",
      token: token,
      user_id: user.user_id,
      role_id: user.role_id
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error during login." });
  }
};
