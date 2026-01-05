// File: controllers/taskController.js

import { pool } from "../server.js";

// --- Create Task Logic ---
export const createTask = async (req, res) => {
  const {
    project_id,
    title,
    description,
    assigned_to_id,
    priority,
    status,
    due_date,
  } = req.body;

  if (!project_id || !title || !assigned_to_id) {
    return res
      .status(400)
      .json({ error: "Project ID, title, and assigned user are required." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO tasks (project_id, title, description, assigned_to_id, priority, status, due_date)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING task_id, title, project_id, assigned_to_id`,
      [
        project_id,
        title,
        description,
        assigned_to_id,
        priority,
        status,
        due_date,
      ]
    );

    res.status(201).json({
      message: "Task created successfully.",
      task: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Server error while creating the task." });
  }
};

// --- Get All Tasks Logic ---
export const getAllTasks = async (req, res) => {
  const { project_id, assigned_to_id } = req.query;
  let query = `
        SELECT 
            t.task_id, t.assigned_to_id,t.title, t.description, t.priority, t.status, t.due_date, t.created_at,
            p.name AS project_name,
            u.first_name AS assigned_first_name, 
            u.last_name AS assigned_last_name
        FROM tasks t
        JOIN projects p ON t.project_id = p.project_id
        LEFT JOIN users u ON t.assigned_to_id = u.user_id
    `;
  const params = [];
  const conditions = [];

  if (project_id) {
    conditions.push(`t.project_id = $${params.length + 1}`);
    params.push(project_id);
  }
  if (assigned_to_id) {
    conditions.push(`t.assigned_to_id = $${params.length + 1}`);
    params.push(assigned_to_id);
  }

  if (conditions.length > 0) {
    query += ` WHERE ` + conditions.join(" AND ");
  }

  query += ` ORDER BY t.due_date, t.priority DESC`;

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Server error while fetching tasks." });
  }
};

// --- Get Single Task Logic ---
export const getTaskById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`SELECT * FROM tasks WHERE task_id = $1`, [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found." });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({ error: "Server error while fetching task." });
  }
};

// --- Update Task Logic ---
export const updateTask = async (req, res) => {
  const { id } = req.params;
  const allowedFields = [
    "project_id",
    "title",
    "description",
    "assigned_to_id",
    "priority",
    "status",
    "due_date",
  ];
  const updates = [];
  const params = [];

  allowedFields.forEach((field, idx) => {
    if (req.body[field] !== undefined) {
      updates.push(`${field} = $${params.length + 1}`);
      params.push(req.body[field]);
    }
  });

  if (updates.length === 0) {
    return res.status(400).json({ error: "No valid fields provided for update." });
  }

  params.push(id);

  try {
    const result = await pool.query(
      `UPDATE tasks 
         SET ${updates.join(", ")}
         WHERE task_id = $${params.length}
         RETURNING task_id, title, status, priority`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found for update." });
    }

    res.json({ message: "Task updated successfully.", task: result.rows[0] });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Server error while updating the task." });
  }
};

// --- Delete Task Logic ---
export const deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM tasks 
             WHERE task_id = $1
             RETURNING task_id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found for deletion." });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: "Server error while deleting the task." });
  }
};
