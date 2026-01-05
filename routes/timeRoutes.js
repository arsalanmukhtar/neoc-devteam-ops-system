// File: routes/timeRoutes.js

import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createTimeEntry,
  getAllTimeEntries,
  updateTimeEntry,
  deleteTimeEntry,
} from "../controllers/timeController.js"; // <-- NEW

const router = express.Router();

// Create Time Entry (Authenticated)
router.post("/create", authMiddleware, createTimeEntry);

// Get All Time Entries (Authenticated, user's own)
router.get("/list", authMiddleware, getAllTimeEntries);

// Update Time Entry (Authenticated, user's own)
router.put("/update/:id", authMiddleware, updateTimeEntry);

// Delete Time Entry (Authenticated, user's own)
router.delete("/delete/:id", authMiddleware, deleteTimeEntry);

export default router;
