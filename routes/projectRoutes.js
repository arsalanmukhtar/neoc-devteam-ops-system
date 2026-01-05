// File: routes/projectRoutes.js

import express from "express";
import authMiddleware, {
  checkRole,
  isAdminOrPM,
  ADMIN_ROLE_ID,
} from "../middleware/authMiddleware.js";
import {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from "../controllers/projectController.js";

const router = express.Router();

// Create Project (Admin or PM)
router.post("/create", authMiddleware, isAdminOrPM, createProject);

// Get All Projects (Authenticated)
router.get("/list", authMiddleware, getAllProjects);

// Get Single Project (Authenticated)
router.get("/view/:id", authMiddleware, getProjectById);

// Update Project (Admin or PM)
router.put("/update/:id", authMiddleware, isAdminOrPM, updateProject);

// Delete Project (Admin Only)
router.delete("/delete/:id", authMiddleware, checkRole(ADMIN_ROLE_ID), deleteProject);

export default router;