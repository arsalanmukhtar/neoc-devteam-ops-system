// File: routes/taskRoutes.js

import express from "express";
// Import the new isAdminOrPM middleware along with the main auth middleware
import authMiddleware, { isAdminOrPM } from "../middleware/authMiddleware.js";
import {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from "../controllers/taskController.js";

const router = express.Router();

// --- NOTE: The isAdminOrPM function definition is NO LONGER here. ---

// Create Task (Admin or PM Only)
router.post("/create", authMiddleware, isAdminOrPM, createTask);

// Get All Tasks (Authenticated)
router.get("/list", authMiddleware, getAllTasks);

// Get Single Task (Authenticated)
router.get("/view/:id", authMiddleware, getTaskById);

// Update Task (Admin or PM Only)
router.put("/update/:id", authMiddleware, isAdminOrPM, updateTask);

// Delete Task (Admin or PM Only)
router.delete("/delete/:id", authMiddleware, isAdminOrPM, deleteTask);

export default router;
