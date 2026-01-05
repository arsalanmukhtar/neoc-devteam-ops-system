// File: routes/authRoutes.js

import express from "express";
import { register, login, getMe } from "../controllers/authController.js"; // <-- NEW
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Route definitions are clean, calling the controller functions
router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, getMe);

export default router;
