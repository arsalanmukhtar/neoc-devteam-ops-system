// File: routes/projectRoutes.js

import express from "express";
import authMiddleware, {
  checkRole,
  ADMIN_ROLE_ID,
} from "../middleware/authMiddleware.js";
import {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from "../controllers/projectController.js"; // <-- NEW

const router = express.Router();

// Create Project (Admin Only)
router.post("/create", authMiddleware, checkRole(ADMIN_ROLE_ID), createProject);

// Get All Projects (Authenticated)
router.get("/list", authMiddleware, getAllProjects);

// Get Single Project (Authenticated)
router.get("/view/:id", authMiddleware, getProjectById);

// Update Project (Admin Only)
router.put("/update/:id", authMiddleware, checkRole(ADMIN_ROLE_ID), updateProject);

// Delete Project (Admin Only)
router.delete("/delete/:id", authMiddleware, checkRole(ADMIN_ROLE_ID), deleteProject);

export default router;
