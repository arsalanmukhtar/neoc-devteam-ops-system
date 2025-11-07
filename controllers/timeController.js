// File: controllers/timeController.js

import { pool } from "../server.js";

// --- Create Time Entry Logic ---
export const createTimeEntry = async (req, res) => {
  const user_id = req.user.user_id;
  const { task_id, start_time, end_time, notes } = req.body;

  if (!task_id || !start_time || !end_time) {
    return res
      .status(400)
      .json({ error: "Task ID, start time, and end time are required." });
  }

  if (new Date(start_time) >= new Date(end_time)) {
    return res
      .status(400)
      .json({ error: "Start time must be before end time." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO time_entries (user_id, task_id, start_time, end_time, notes)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING entry_id, task_id, start_time, end_time, duration`,
      [user_id, task_id, start_time, end_time, notes]
    );

    res.status(201).json({
      message: "Time entry logged successfully.",
      entry: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating time entry:", error);
    res.status(500).json({ error: "Server error while logging time." });
  }
};

// --- Get All Time Entries Logic (User's own) ---
export const getAllTimeEntries = async (req, res) => {
  const { task_id, start_date, end_date } = req.query;
  const user_id = req.user.user_id;
  const role_id = req.user.role_id;

  let query = `
    SELECT 
      te.entry_id, 
      te.task_id, 
      t.title AS task_title, 
      te.start_time, 
      te.end_time, 
      te.duration, 
      te.notes, 
      te.created_at,
      u.first_name AS user_first_name,
      u.last_name AS user_last_name
    FROM time_entries te
    JOIN tasks t ON te.task_id = t.task_id
    JOIN users u ON te.user_id = u.user_id
  `;

  // Role-based filtering
  let where = [];
  let params = [];
  let paramCount = 1;

  if (role_id === 3) {
    where.push(`te.user_id = $${paramCount++}`);
    params.push(user_id);
  }

  if (task_id) {
    where.push(`te.task_id = $${paramCount++}`);
    params.push(task_id);
  }
  if (start_date) {
    where.push(`te.start_time >= $${paramCount++}`);
    params.push(start_date);
  }
  if (end_date) {
    where.push(`te.end_time <= $${paramCount++}`);
    params.push(end_date);
  }

  if (where.length) {
    query += " WHERE " + where.join(" AND ");
  }

  query += " ORDER BY te.start_time DESC";

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching time entries:", error);
    res
      .status(500)
      .json({ error: "Server error while fetching time entries." });
  }
};

// --- Update Time Entry Logic (User's own) ---
export const updateTimeEntry = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.user_id;
  let { task_id, start_time, end_time, notes } = req.body;

  // If only end_time or notes are sent, fetch the rest from DB
  if (!task_id || !start_time) {
    const result = await pool.query(
      `SELECT task_id, start_time FROM time_entries WHERE entry_id = $1 AND user_id = $2`,
      [id, user_id]
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({
          error:
            "Time entry not found or you do not have permission to update it.",
        });
    }
    task_id = result.rows[0].task_id;
    start_time = result.rows[0].start_time;
  }

  if (!task_id || !start_time || !end_time) {
    return res.status(400).json({
      error: "Task ID, start time, and end time are required for update.",
    });
  }

  try {
    const result = await pool.query(
      `UPDATE time_entries 
             SET task_id = $1, start_time = $2, end_time = $3, notes = $4
             WHERE entry_id = $5 AND user_id = $6
             RETURNING entry_id, task_id, duration, notes`,
      [task_id, start_time, end_time, notes, id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error:
          "Time entry not found or you do not have permission to update it.",
      });
    }

    res.json({
      message: "Time entry updated successfully.",
      entry: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating time entry:", error);
    res
      .status(500)
      .json({ error: "Server error while updating the time entry." });
  }
};

// --- Delete Time Entry Logic (User's own) ---
export const deleteTimeEntry = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.user_id;

  try {
    const result = await pool.query(
      `DELETE FROM time_entries 
             WHERE entry_id = $1 AND user_id = $2
             RETURNING entry_id`,
      [id, user_id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({
          error:
            "Time entry not found or you do not have permission to delete it.",
        });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting time entry:", error);
    res
      .status(500)
      .json({ error: "Server error while deleting the time entry." });
  }
};
