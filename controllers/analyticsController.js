import { pool } from "../server.js";

// RUBRIC A — USER ANALYTICS

export const userCountByRole = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT r.role_name, COUNT(u.user_id) AS user_count
            FROM users u
            JOIN roles r ON u.role_id = r.role_id
            GROUP BY r.role_name
            ORDER BY user_count DESC;
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch user count by role" });
    }
};

export const activeInactiveUsers = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT is_active, COUNT(*) AS total_users
            FROM users
            GROUP BY is_active;
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch active/inactive users" });
    }
};

export const usersCreatedPerMonth = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT DATE_TRUNC('month', created_at) AS month, COUNT(*) AS new_users
            FROM users
            GROUP BY month
            ORDER BY month;
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch users created per month" });
    }
};

// RUBRIC B — PROJECT ANALYTICS

export const projectsByStatus = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT status, COUNT(*) AS project_count
            FROM projects
            GROUP BY status
            ORDER BY project_count DESC;
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch projects by status" });
    }
};

export const projectsPerManager = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT u.first_name || ' ' || u.last_name AS manager_name,
                   COUNT(p.project_id) AS project_count
            FROM projects p
            LEFT JOIN users u ON u.user_id = p.manager_id
            GROUP BY manager_name
            ORDER BY project_count DESC;
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch projects per manager" });
    }
};

export const projectsCreatedPerMonth = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT DATE_TRUNC('month', created_at) AS month, COUNT(*) AS total_projects
            FROM projects
            GROUP BY month
            ORDER BY month;
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch projects created per month" });
    }
};

// RUBRIC C — TASK ANALYTICS

export const taskDistributionByStatus = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT status, COUNT(*) AS task_count
            FROM tasks
            GROUP BY status
            ORDER BY task_count DESC;
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch task distribution by status" });
    }
};

export const taskDistributionByPriority = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT priority, COUNT(*) AS total_tasks
            FROM tasks
            GROUP BY priority
            ORDER BY total_tasks DESC;
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch task distribution by priority" });
    }
};

export const tasksAssignedToUsers = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT u.first_name || ' ' || u.last_name AS assignee,
                   COUNT(t.task_id) AS task_count
            FROM tasks t
            LEFT JOIN users u ON t.assigned_to_id = u.user_id
            GROUP BY assignee
            ORDER BY task_count DESC;
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch tasks assigned to users" });
    }
};

export const tasksPerProject = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.name AS project_name, COUNT(t.task_id) AS total_tasks
            FROM tasks t
            JOIN projects p ON t.project_id = p.project_id
            GROUP BY project_name
            ORDER BY total_tasks DESC;
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch tasks per project" });
    }
};

// RUBRIC D — TIME ENTRY ANALYTICS

export const hoursLoggedPerUser = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT u.first_name || ' ' || u.last_name AS user_name,
                   SUM(te.duration) AS total_hours
            FROM time_entries te
            JOIN users u ON te.user_id = u.user_id
            GROUP BY user_name
            ORDER BY total_hours DESC;
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch hours logged per user" });
    }
};

export const hoursLoggedPerProject = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.name AS project_name,
                   SUM(te.duration) AS total_hours
            FROM time_entries te
            JOIN tasks t ON te.task_id = t.task_id
            JOIN projects p ON t.project_id = p.project_id
            GROUP BY project_name
            ORDER BY total_hours DESC;
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch hours logged per project" });
    }
};

export const timeSpentPerTask = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT t.title AS task_title,
                   SUM(te.duration) AS hours_logged
            FROM time_entries te
            JOIN tasks t ON te.task_id = t.task_id
            GROUP BY task_title
            ORDER BY hours_logged DESC;
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch time spent per task" });
    }
};

export const dailyActivityTrend = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT DATE(start_time) AS log_date,
                   SUM(duration) AS total_hours
            FROM time_entries
            GROUP BY log_date
            ORDER BY log_date;
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch daily activity trend" });
    }
};

// RUBRIC E — REQUESTS ANALYTICS

export const requestsCountByStatus = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT status, COUNT(*) AS total_requests
            FROM requests
            GROUP BY status
            ORDER BY total_requests DESC;
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch requests count by status" });
    }
};

export const requestsPerUser = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT u.first_name || ' ' || u.last_name AS user_name,
                   COUNT(r.request_id) AS request_count
            FROM requests r
            JOIN users u ON r.user_id = u.user_id
            GROUP BY user_name
            ORDER BY request_count DESC;
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch requests per user" });
    }
};

export const requestProcessingTime = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT request_id,
                   (reviewed_at - created_at) AS processing_time
            FROM requests
            WHERE reviewed_at IS NOT NULL;
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch request processing time" });
    }
};

export const dailyRequestsOverTime = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT DATE(created_at) AS request_date,
                   COUNT(*) AS total_requests
            FROM requests
            GROUP BY request_date
            ORDER BY request_date;
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch daily requests over time" });
    }
};

// TEAM-MEMBER UTILIZATION ANALYTICS (ROLE_ID = 3)

export const underUtilizedMembers = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                u.user_id,
                u.first_name || ' ' || u.last_name AS username,
                COUNT(t.task_id) AS active_task_count
            FROM users u
            LEFT JOIN tasks t 
                ON t.assigned_to_id = u.user_id
                AND t.status IN ('pending', 'in_progress')
            WHERE u.role_id = 3
              AND u.is_active = true
            GROUP BY u.user_id
            HAVING COUNT(t.task_id) < 3
            ORDER BY active_task_count ASC;
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch under-utilized members" });
    }
};

export const overUtilizedMembers = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                u.user_id,
                u.first_name || ' ' || u.last_name AS username,
                COUNT(t.task_id) AS active_task_count
            FROM users u
            LEFT JOIN tasks t 
                ON t.assigned_to_id = u.user_id
                AND t.status IN ('pending', 'in_progress')
            WHERE u.role_id = 3
              AND u.is_active = true
            GROUP BY u.user_id
            HAVING COUNT(t.task_id) > 8
            ORDER BY active_task_count DESC;
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch over-utilized members" });
    }
};

export const neglectedTasksMembers = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                u.user_id,
                u.first_name || ' ' || u.last_name AS username,
                COUNT(t.task_id) AS pending_count
            FROM users u
            JOIN tasks t ON t.assigned_to_id = u.user_id
            WHERE u.role_id = 3
              AND t.status = 'pending'
              AND t.updated_at < NOW() - INTERVAL '5 days'
            GROUP BY u.user_id
            ORDER BY pending_count DESC;
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch neglected tasks members" });
    }
};

export const mostlyLowPriorityMembers = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                u.user_id,
                u.first_name || ' ' || u.last_name AS username,
                SUM(CASE WHEN t.priority = 'low' THEN 1 ELSE 0 END) AS low_priority_tasks,
                COUNT(t.task_id) AS total_tasks
            FROM users u
            LEFT JOIN tasks t ON t.assigned_to_id = u.user_id
            WHERE u.role_id = 3
              AND u.is_active = true
            GROUP BY u.user_id
            HAVING SUM(CASE WHEN t.priority = 'low' THEN 1 ELSE 0 END) > 0
            ORDER BY low_priority_tasks DESC;
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch mostly low-priority members" });
    }
};

export const urgentTaskCandidates = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                u.user_id,
                u.first_name || ' ' || u.last_name AS username,
                COUNT(t.task_id) FILTER (WHERE t.status IN ('pending','in_progress')) AS active_tasks
            FROM users u
            LEFT JOIN tasks t ON t.assigned_to_id = u.user_id
            WHERE u.role_id = 3
              AND u.is_active = true
            GROUP BY u.user_id
            ORDER BY active_tasks ASC;
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch urgent task candidates" });
    }
};

export const highestCompletionRateMembers = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                u.user_id,
                u.first_name || ' ' || u.last_name AS username,
                COUNT(t.task_id) FILTER (WHERE t.status = 'completed') AS completed_tasks,
                COUNT(t.task_id) AS total_assigned,
                ROUND(
                    (COUNT(t.task_id) FILTER (WHERE t.status = 'completed')::numeric 
                    / GREATEST(COUNT(t.task_id),1)) * 100, 2
                ) AS completion_rate
            FROM users u
            LEFT JOIN tasks t ON t.assigned_to_id = u.user_id
            WHERE u.role_id = 3
            GROUP BY u.user_id
            ORDER BY completion_rate DESC;
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch highest completion rate members" });
    }
};

export const idleUsers = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                u.user_id,
                u.first_name || ' ' || u.last_name AS username
            FROM users u
            LEFT JOIN tasks t ON t.assigned_to_id = u.user_id
            WHERE u.role_id = 3
            GROUP BY u.user_id
            HAVING COUNT(t.task_id) = 0;
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch idle users" });
    }
};

export const tooManyHighPriorityMembers = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                u.user_id,
                u.first_name || ' ' || u.last_name AS username,
                COUNT(t.task_id) AS high_priority_count
            FROM users u
            JOIN tasks t ON t.assigned_to_id = u.user_id
            WHERE u.role_id = 3
              AND t.priority = 'high'
              AND t.status IN ('pending','in_progress')
            GROUP BY u.user_id
            ORDER BY high_priority_count DESC;
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch too many high-priority members" });
    }
};

export const avgHoursPerTask = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                u.user_id,
                u.first_name || ' ' || u.last_name AS username,
                ROUND(AVG(te.duration), 2) AS avg_hours_per_task
            FROM users u
            JOIN tasks t ON t.assigned_to_id = u.user_id
            JOIN time_entries te ON te.task_id = t.task_id
            WHERE u.role_id = 3
            GROUP BY u.user_id
            ORDER BY avg_hours_per_task ASC;
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch average hours per task" });
    }
};

export const delayingRequestsMembers = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                u.user_id,
                u.first_name || ' ' || u.last_name AS username,
                AVG(EXTRACT(EPOCH FROM (r.reviewed_at - r.created_at))/3600) AS avg_hours_to_complete
            FROM users u
            JOIN requests r ON r.reviewed_by = u.user_id
            WHERE u.role_id = 3
              AND r.status = 'completed'
            GROUP BY u.user_id
            ORDER BY avg_hours_to_complete DESC;
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch delaying requests members" });
    }
};

export const urgentRequestsHandledMembers = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                u.user_id,
                u.first_name || ' ' || u.last_name AS username,
                COUNT(r.request_id) AS urgent_requests_handled
            FROM users u
            JOIN requests r ON r.reviewed_by = u.user_id
            WHERE u.role_id = 3
              AND r.status = 'approved'
              AND r.priority = 'medium'
            GROUP BY u.user_id
            ORDER BY urgent_requests_handled DESC;
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch urgent requests handled members" });
    }
};

export const workloadHeatmap = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                p.name AS project_name,
                u.first_name || ' ' || u.last_name AS username,
                COUNT(t.task_id) AS tasks_assigned
            FROM tasks t
            JOIN projects p ON p.project_id = t.project_id
            JOIN users u ON u.user_id = t.assigned_to_id
            WHERE u.role_id = 3
            GROUP BY p.name, u.user_id
            ORDER BY p.name, tasks_assigned DESC;
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch workload heatmap" });
    }
};