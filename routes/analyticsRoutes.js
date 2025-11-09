import express from "express";
import authMiddleware, { checkRole, ADMIN_ROLE_ID } from "../middleware/authMiddleware.js";
import {
    userCountByRole,
    activeInactiveUsers,
    usersCreatedPerMonth,
    projectsByStatus,
    projectsPerManager,
    projectsCreatedPerMonth,
    taskDistributionByStatus,
    taskDistributionByPriority,
    tasksAssignedToUsers,
    tasksPerProject,
    hoursLoggedPerUser,
    hoursLoggedPerProject,
    timeSpentPerTask,
    dailyActivityTrend,
    requestsCountByStatus,
    requestsPerUser,
    requestProcessingTime,
    dailyRequestsOverTime,
    underUtilizedMembers,
    overUtilizedMembers,
    neglectedTasksMembers,
    mostlyLowPriorityMembers,
    urgentTaskCandidates,
    highestCompletionRateMembers,
    idleUsers,
    tooManyHighPriorityMembers,
    avgHoursPerTask,
    delayingRequestsMembers,
    urgentRequestsHandledMembers,
    workloadHeatmap
} from "../controllers/analyticsController.js";

const router = express.Router();

// RUBRIC A — USER ANALYTICS
router.get("/user-count-by-role", authMiddleware, checkRole(ADMIN_ROLE_ID), userCountByRole);
router.get("/active-inactive-users", authMiddleware, checkRole(ADMIN_ROLE_ID), activeInactiveUsers);
router.get("/users-created-per-month", authMiddleware, checkRole(ADMIN_ROLE_ID), usersCreatedPerMonth);

// RUBRIC B — PROJECT ANALYTICS
router.get("/projects-by-status", authMiddleware, checkRole(ADMIN_ROLE_ID), projectsByStatus);
router.get("/projects-per-manager", authMiddleware, checkRole(ADMIN_ROLE_ID), projectsPerManager);
router.get("/projects-created-per-month", authMiddleware, checkRole(ADMIN_ROLE_ID), projectsCreatedPerMonth);

// RUBRIC C — TASK ANALYTICS
router.get("/task-distribution-by-status", authMiddleware, checkRole(ADMIN_ROLE_ID), taskDistributionByStatus);
router.get("/task-distribution-by-priority", authMiddleware, checkRole(ADMIN_ROLE_ID), taskDistributionByPriority);
router.get("/tasks-assigned-to-users", authMiddleware, checkRole(ADMIN_ROLE_ID), tasksAssignedToUsers);
router.get("/tasks-per-project", authMiddleware, checkRole(ADMIN_ROLE_ID), tasksPerProject);

// RUBRIC D — TIME ENTRY ANALYTICS
router.get("/hours-logged-per-user", authMiddleware, checkRole(ADMIN_ROLE_ID), hoursLoggedPerUser);
router.get("/hours-logged-per-project", authMiddleware, checkRole(ADMIN_ROLE_ID), hoursLoggedPerProject);
router.get("/time-spent-per-task", authMiddleware, checkRole(ADMIN_ROLE_ID), timeSpentPerTask);
router.get("/daily-activity-trend", authMiddleware, checkRole(ADMIN_ROLE_ID), dailyActivityTrend);

// RUBRIC E — REQUESTS ANALYTICS
router.get("/requests-count-by-status", authMiddleware, checkRole(ADMIN_ROLE_ID), requestsCountByStatus);
router.get("/requests-per-user", authMiddleware, checkRole(ADMIN_ROLE_ID), requestsPerUser);
router.get("/request-processing-time", authMiddleware, checkRole(ADMIN_ROLE_ID), requestProcessingTime);
router.get("/daily-requests-over-time", authMiddleware, checkRole(ADMIN_ROLE_ID), dailyRequestsOverTime);

// TEAM-MEMBER UTILIZATION ANALYTICS (ROLE_ID = 3)
router.get("/under-utilized-members", authMiddleware, checkRole(ADMIN_ROLE_ID), underUtilizedMembers);
router.get("/over-utilized-members", authMiddleware, checkRole(ADMIN_ROLE_ID), overUtilizedMembers);
router.get("/neglected-tasks-members", authMiddleware, checkRole(ADMIN_ROLE_ID), neglectedTasksMembers);
router.get("/mostly-low-priority-members", authMiddleware, checkRole(ADMIN_ROLE_ID), mostlyLowPriorityMembers);
router.get("/urgent-task-candidates", authMiddleware, checkRole(ADMIN_ROLE_ID), urgentTaskCandidates);
router.get("/highest-completion-rate-members", authMiddleware, checkRole(ADMIN_ROLE_ID), highestCompletionRateMembers);
router.get("/idle-users", authMiddleware, checkRole(ADMIN_ROLE_ID), idleUsers);
router.get("/too-many-high-priority-members", authMiddleware, checkRole(ADMIN_ROLE_ID), tooManyHighPriorityMembers);
router.get("/avg-hours-per-task", authMiddleware, checkRole(ADMIN_ROLE_ID), avgHoursPerTask);
router.get("/delaying-requests-members", authMiddleware, checkRole(ADMIN_ROLE_ID), delayingRequestsMembers);
router.get("/urgent-requests-handled-members", authMiddleware, checkRole(ADMIN_ROLE_ID), urgentRequestsHandledMembers);
router.get("/workload-heatmap", authMiddleware, checkRole(ADMIN_ROLE_ID), workloadHeatmap);

export default router;