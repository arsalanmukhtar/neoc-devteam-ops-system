// File: routes/authRoutes.js

import express from "express";
import { register, login } from "../controllers/authController.js"; // <-- NEW

const router = express.Router();

// Route definitions are clean, calling the controller functions
router.post("/register", register);
router.post("/login", login);

export default router;
