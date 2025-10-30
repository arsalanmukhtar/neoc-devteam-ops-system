// File: controllers/userController.js

import { pool } from "../server.js";
// Note: We're not importing bcrypt/jwt here because registration/login are in authController.js

// --- Get All Users Logic (Admin Only) ---
export const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
                u.user_id, u.first_name, u.last_name, u.email, u.is_active, r.role_name
             FROM users u
             JOIN roles r ON u.role_id = r.role_id
             ORDER BY u.last_name`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ error: "Server error while fetching users." });
  }
};

// --- Get Single User Logic (Admin Only) ---
export const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT 
                u.user_id, u.first_name, u.last_name, u.email, u.is_active, u.role_id, r.role_name
             FROM users u
             JOIN roles r ON u.role_id = r.role_id
             WHERE u.user_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Server error while fetching user." });
  }
};

// --- Update User Logic (Admin Only - for role, status, name) ---
export const updateUser = async (req, res) => {
  const { id } = req.params;
  // Allow updating name, role_id, and is_active status
  const { first_name, last_name, role_id, is_active } = req.body;

  // Basic validation
  if (!first_name || !last_name || !role_id || is_active === undefined) {
    return res
      .status(400)
      .json({
        error:
          "All fields (first_name, last_name, role_id, is_active) are required for user update.",
      });
  }

  try {
    const result = await pool.query(
      `UPDATE users 
             SET first_name = $1, last_name = $2, role_id = $3, is_active = $4
             WHERE user_id = $5
             RETURNING user_id, email, is_active, role_id`,
      [first_name, last_name, role_id, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found for update." });
    }

    res.json({ message: "User updated successfully.", user: result.rows[0] });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Server error while updating the user." });
  }
};

// --- Delete/Deactivate User Logic (Admin Only) ---
// Note: We implement deletion by setting is_active to FALSE for safety.
export const deactivateUser = async (req, res) => {
  const { id } = req.params;

  try {
    // Set is_active to FALSE instead of hard DELETE
    const result = await pool.query(
      `UPDATE users 
             SET is_active = FALSE 
             WHERE user_id = $1
             RETURNING user_id, is_active`,
      [id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "User not found for deactivation." });
    }

    res.json({
      message: "User deactivated successfully.",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Error deactivating user:", error);
    res
      .status(500)
      .json({ error: "Server error while deactivating the user." });
  }
};
