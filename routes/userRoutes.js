// File: routes/userRoutes.js

import express from 'express';
import authMiddleware, { checkRole, isAdminOrPM, ADMIN_ROLE_ID } from '../middleware/authMiddleware.js';
import {
    getAllUsers,
    getAllManagers,
    getAllTeamMembers,
    getUserById,
    updateUser,
    deactivateUser
} from '../controllers/userController.js';

const router = express.Router();

// Get All Users (Admin Only)
router.get('/all', authMiddleware, checkRole(ADMIN_ROLE_ID), getAllUsers);

// Get All Managers (Admin or PM)
router.get('/managers', authMiddleware, isAdminOrPM, getAllManagers);

// Get All Team Members for task assignment (Admin or PM)
router.get('/team', authMiddleware, isAdminOrPM, getAllTeamMembers);

// Get Single User (Admin Only)
router.get('/view/:id', authMiddleware, checkRole(ADMIN_ROLE_ID), getUserById);

// Update User (Admin Only)
router.put('/update/:id', authMiddleware, checkRole(ADMIN_ROLE_ID), updateUser);

// Delete/Deactivate User (Admin Only)
router.delete('/delete/:id', authMiddleware, checkRole(ADMIN_ROLE_ID), deactivateUser);

export default router;