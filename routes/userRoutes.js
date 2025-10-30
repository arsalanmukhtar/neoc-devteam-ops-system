// File: routes/userRoutes.js

import express from 'express';
import authMiddleware, { checkRole, ADMIN_ROLE_ID } from '../middleware/authMiddleware.js';
import { 
    getAllUsers, 
    getUserById, 
    updateUser, 
    deactivateUser 
} from '../controllers/userController.js'; // <-- NEW

const router = express.Router();

// All routes here are restricted to Administrators (role_id 1)

// GET /api/users/management - Get all users
router.get('/management', authMiddleware, checkRole(ADMIN_ROLE_ID), getAllUsers);

// GET /api/users/management/:id - Get a single user
router.get('/management/:id', authMiddleware, checkRole(ADMIN_ROLE_ID), getUserById);

// PUT /api/users/management/:id - Update user details (role, status, name)
router.put('/management/:id', authMiddleware, checkRole(ADMIN_ROLE_ID), updateUser);

// DELETE /api/users/management/:id - Deactivate user (Soft Delete)
router.delete('/management/:id', authMiddleware, checkRole(ADMIN_ROLE_ID), deactivateUser);

export default router;