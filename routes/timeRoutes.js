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
router.post("/", authMiddleware, createTimeEntry);

// Get All Time Entries (Authenticated, user's own)
router.get("/", authMiddleware, getAllTimeEntries);

// Update Time Entry (Authenticated, user's own)
router.put("/:id", authMiddleware, updateTimeEntry);

// Delete Time Entry (Authenticated, user's own)
router.delete("/:id", authMiddleware, deleteTimeEntry);

export default router;
