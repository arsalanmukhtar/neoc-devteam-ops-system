// File: controllers/projectController.js

import { pool } from "../server.js";

// --- Create Project Logic ---
export const createProject = async (req, res) => {
  const { name, description, manager_id, status, start_date, due_date } =
    req.body;

  if (!name || !manager_id) {
    return res
      .status(400)
      .json({ error: "Project name and manager ID are required." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO projects (name, description, manager_id, status, start_date, due_date)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING project_id, name, manager_id, status`,
      [name, description, manager_id, status, start_date, due_date]
    );

    res.status(201).json({
      message: "Project created successfully.",
      project: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ error: "Server error while creating the project." });
  }
};

// --- Get All Projects Logic ---
export const getAllProjects = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
                p.project_id, p.name, p.description, p.status, p.start_date, p.due_date,
                u.first_name AS manager_first_name, 
                u.last_name AS manager_last_name
             FROM projects p
             JOIN users u ON p.manager_id = u.user_id
             ORDER BY p.created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Server error while fetching projects." });
  }
};

// --- Get Single Project Logic ---
export const getProjectById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM projects WHERE project_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Project not found." });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ error: "Server error while fetching project." });
  }
};

// --- Update Project Logic ---
export const updateProject = async (req, res) => {
  const { id } = req.params;
  const { name, description, manager_id, status, start_date, due_date } =
    req.body;

  if (!name || !manager_id) {
    return res
      .status(400)
      .json({ error: "Project name and manager ID are required for update." });
  }

  try {
    const result = await pool.query(
      `UPDATE projects 
             SET name = $1, description = $2, manager_id = $3, status = $4, start_date = $5, due_date = $6
             WHERE project_id = $7
             RETURNING project_id, name, status`,
      [name, description, manager_id, status, start_date, due_date, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Project not found for update." });
    }

    res.json({
      message: "Project updated successfully.",
      project: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ error: "Server error while updating the project." });
  }
};

// --- Delete Project Logic ---
export const deleteProject = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM projects 
             WHERE project_id = $1
             RETURNING project_id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Project not found for deletion." });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ error: "Server error while deleting the project." });
  }
};
