import express from "express";
import authMiddleware, {
    checkRole,
    ADMIN_ROLE_ID,
    PM_ROLE_ID,
    DEV_ROLE_ID,
} from "../middleware/authMiddleware.js";
import {
    createTimeEntryRequest,
    getTimeEntryRequests,
    acceptTimeEntryRequest,
    rejectTimeEntryRequest,
} from "../controllers/requestController.js";

const router = express.Router();

// Create a new time entry request (Developer Only)
router.post(
    "/time-entry",
    authMiddleware,
    checkRole(DEV_ROLE_ID),
    createTimeEntryRequest
);

// Get all time entry requests (Admin & Project Manager Only)
router.get(
    "/time-entry",
    authMiddleware,
    checkRole([ADMIN_ROLE_ID, PM_ROLE_ID]),
    getTimeEntryRequests
);

// Accept a request (Admin & Project Manager Only)
router.post(
    "/time-entry/:id/accept",
    authMiddleware,
    checkRole([ADMIN_ROLE_ID, PM_ROLE_ID]),
    acceptTimeEntryRequest
);

// Reject a request (Admin & Project Manager Only)
router.post(
    "/time-entry/:id/reject",
    authMiddleware,
    checkRole([ADMIN_ROLE_ID, PM_ROLE_ID]),
    rejectTimeEntryRequest
);

export default router;