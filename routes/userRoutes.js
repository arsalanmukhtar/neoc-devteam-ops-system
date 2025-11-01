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

// GET /api/users/all - Get all users
router.get('/all', authMiddleware, checkRole(ADMIN_ROLE_ID), getAllUsers);

// GET /api/users/single/:id - Get a single user
router.get('/view/:id', authMiddleware, checkRole(ADMIN_ROLE_ID), getUserById);

// PUT /api/users/update/:id - Update user details (role, status, name)
router.put('/update/:id', authMiddleware, checkRole(ADMIN_ROLE_ID), updateUser);

// DELETE /api/users/:id - Deactivate user (Soft Delete)
router.delete('/delete/:id', authMiddleware, checkRole(ADMIN_ROLE_ID), deactivateUser);

export default router;