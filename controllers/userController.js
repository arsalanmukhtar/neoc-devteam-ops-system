// File: controllers/userController.js
import bcrypt from "bcrypt";
import { pool } from "../server.js";
// Note: We're not importing bcrypt/jwt here because registration/login are in authController.js

// --- Get All Users Logic (Admin Only) ---
export const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
                u.user_id, u.first_name, u.last_name, u.email, u.is_active, u.role_id, r.role_name
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
  const { first_name, last_name, email, role_id, is_active, password } = req.body;

  // Build update fields
  const fields = [];
  const values = [];
  let idx = 1;

  if (first_name) { fields.push(`first_name = $${idx++}`); values.push(first_name); }
  if (last_name) { fields.push(`last_name = $${idx++}`); values.push(last_name); }
  if (email) { fields.push(`email = $${idx++}`); values.push(email); }
  if (role_id) { fields.push(`role_id = $${idx++}`); values.push(role_id); }
  if (is_active !== undefined) { fields.push(`is_active = $${idx++}`); values.push(is_active); }
  if (password) {
    const hash = await bcrypt.hash(password, 10);
    fields.push(`password_hash = $${idx++}`);
    values.push(hash);
  }

  if (fields.length === 0) return res.status(400).json({ error: 'No fields to update.' });

  values.push(id);

  const query = `UPDATE users SET ${fields.join(', ')} WHERE user_id = $${idx} RETURNING *`;

  try {
    const result = await pool.query(query, values);
    res.json({ message: 'User updated.', user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Update failed.' });
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
