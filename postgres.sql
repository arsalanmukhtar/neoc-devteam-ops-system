-- 1. EXTENSIONS (UUID generation)
--
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-----------------------------------------------------------------------

--
-- 2. ROLES Table (Permissions Management)
--
CREATE TABLE "roles" (
    -- Primary Key: Simple integer sequence for fast lookup
    role_id SERIAL PRIMARY KEY,
    -- Role Name: Must be unique (e.g., 'Admin', 'Developer')
    role_name VARCHAR(50) UNIQUE NOT NULL,
    -- Permissions: Stores a flexible JSON object for granular access control
    permissions JSONB DEFAULT '{}'
);

-- Initial Roles Data (Crucial for system access)
INSERT INTO "roles" (role_name, permissions) VALUES
('Admin', '{"can_manage_users": true, "can_manage_projects": true, "can_manage_roles": true}'),
('Project Manager', '{"can_manage_tasks": true, "can_view_reports": true, "can_manage_project_team": true}'),
('Developer', '{"can_log_time": true, "can_update_tasks": true, "can_view_tasks": true}');

-----------------------------------------------------------------------

--
-- 3. USERS Table (Team Members)
--
CREATE TABLE "users" (
    -- Primary Key: UUID is standard for modern, distributed systems
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    -- Email: Must be unique for login
    email VARCHAR(255) UNIQUE NOT NULL,
    -- Password Hash: Always store securely
    password_hash TEXT NOT NULL,
    -- Foreign Key to Roles
    role_id INTEGER NOT NULL REFERENCES "roles"(role_id) ON DELETE RESTRICT,
    -- System Status
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index for quick email lookups during login
CREATE UNIQUE INDEX idx_users_email ON "users" (LOWER(email));

-----------------------------------------------------------------------

--
-- 4. PROJECTS Table
--
CREATE TABLE "projects" (
    project_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    -- Project Manager (FK to Users)
    manager_id UUID REFERENCES "users"(user_id) ON DELETE SET NULL,
    -- Status with a default value
    status VARCHAR(50) NOT NULL DEFAULT 'Planning',
    start_date DATE,
    due_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index for quick access by project manager
CREATE INDEX idx_projects_manager_id ON "projects" (manager_id);

-----------------------------------------------------------------------

--
-- 5. TASKS Table
--
CREATE TABLE "tasks" (
    task_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Foreign Key to Projects
    project_id UUID NOT NULL REFERENCES "projects"(project_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    -- Person responsible (FK to Users)
    assigned_to_id UUID REFERENCES "users"(user_id) ON DELETE SET NULL,
    -- Simple ENUM-like priority and status
    priority VARCHAR(50) NOT NULL DEFAULT 'Medium',
    status VARCHAR(50) NOT NULL DEFAULT 'To Do',
    due_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index for common task queries (e.g., "all tasks for a user in a project")
CREATE INDEX idx_tasks_project_user ON "tasks" (project_id, assigned_to_id);

-----------------------------------------------------------------------

--
-- 6. TIME_ENTRIES Table (Time Tracking)
--
CREATE TABLE "time_entries" (
    entry_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Who logged the time
    user_id UUID NOT NULL REFERENCES "users"(user_id) ON DELETE CASCADE,
    -- Which task the time was logged for
    task_id UUID NOT NULL REFERENCES "tasks"(task_id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    -- Duration will be calculated, but storing it is often helpful for reports
    duration DECIMAL(10, 2) GENERATED ALWAYS AS (EXTRACT(EPOCH FROM (end_time - start_time)) / 3600) STORED,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index for common reporting queries (e.g., "all time entries for a user over a date range")
CREATE INDEX idx_time_entries_user_time ON "time_entries" (user_id, start_time DESC);

-----------------------------------------------------------------------

--
-- 7. REQUESTS Table (to handle task assignment requests)
--

CREATE TABLE "requests" (
    request_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES "users"(user_id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES "tasks"(task_id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_by UUID REFERENCES "users"(user_id),
    reviewed_at TIMESTAMP,
    review_comment TEXT,
    priority VARCHAR(50) NOT NULL DEFAULT 'Medium'
);


-- Index for quick access
CREATE INDEX idx_requests_status ON "requests" (status);

-----------------------------------------------------------------------

--
-- 8. TRIGGER FUNCTION (Automated 'updated_at' column maintenance)
--
CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

--
-- 9. TRIGGERS (Apply the function to the Users table)
--
CREATE TRIGGER set_users_updated_at
BEFORE UPDATE ON "users"
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp();

-- 10. TRIGGERS (Apply the function to the Tasks table)
CREATE TRIGGER set_tasks_updated_at
BEFORE
UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp();


/* ===========================================================
   ANALYTICS DASHBOARD QUERIES
   Including Team-Member Workload & Utilization
   =========================================================== */

/* ===========================================================
   RUBRIC A — USER ANALYTICS
   =========================================================== */

-- A1: User count by role
SELECT r.role_name, COUNT(u.user_id) AS user_count
FROM users u
JOIN roles r ON u.role_id = r.role_id
GROUP BY r.role_name
ORDER BY user_count DESC;

-- A2: Count active vs inactive users
SELECT is_active, COUNT(*) AS total_users
FROM users
GROUP BY is_active;

-- A3: Users created per month (trend)
SELECT DATE_TRUNC('month', created_at) AS month, COUNT(*) AS new_users
FROM users
GROUP BY month
ORDER BY month;


/* ===========================================================
   RUBRIC B — PROJECT ANALYTICS
   =========================================================== */

-- B1: Count projects by status
SELECT status, COUNT(*) AS project_count
FROM projects
GROUP BY status
ORDER BY project_count DESC;

-- B2: Count of projects per project manager
SELECT u.first_name || ' ' || u.last_name AS manager_name,
       COUNT(p.project_id) AS project_count
FROM projects p
LEFT JOIN users u ON u.user_id = p.manager_id
GROUP BY manager_name
ORDER BY project_count DESC;

-- B3: Projects created per month
SELECT DATE_TRUNC('month', created_at) AS month, COUNT(*) AS total_projects
FROM projects
GROUP BY month
ORDER BY month;


/* ===========================================================
   RUBRIC C — TASK ANALYTICS
   =========================================================== */

-- C1: Task distribution by status
SELECT status, COUNT(*) AS task_count
FROM tasks
GROUP BY status
ORDER BY task_count DESC;

-- C2: Task distribution by priority
SELECT priority, COUNT(*) AS total_tasks
FROM tasks
GROUP BY priority
ORDER BY total_tasks DESC;

-- C3: Tasks assigned to each user
SELECT u.first_name || ' ' || u.last_name AS assignee,
       COUNT(t.task_id) AS task_count
FROM tasks t
LEFT JOIN users u ON t.assigned_to_id = u.user_id
GROUP BY assignee
ORDER BY task_count DESC;

-- C4: Tasks per project
SELECT p.name AS project_name, COUNT(t.task_id) AS total_tasks
FROM tasks t
JOIN projects p ON t.project_id = p.project_id
GROUP BY project_name
ORDER BY total_tasks DESC;


/* ===========================================================
   RUBRIC D — TIME ENTRY ANALYTICS
   =========================================================== */

-- D1: Total hours logged per user
SELECT u.first_name || ' ' || u.last_name AS user_name,
       SUM(te.duration) AS total_hours
FROM time_entries te
JOIN users u ON te.user_id = u.user_id
GROUP BY user_name
ORDER BY total_hours DESC;

-- D2: Total hours logged per project
SELECT p.name AS project_name,
       SUM(te.duration) AS total_hours
FROM time_entries te
JOIN tasks t ON te.task_id = t.task_id
JOIN projects p ON t.project_id = p.project_id
GROUP BY project_name
ORDER BY total_hours DESC;

-- D3: Time spent per task
SELECT t.title AS task_title,
       SUM(te.duration) AS hours_logged
FROM time_entries te
JOIN tasks t ON te.task_id = t.task_id
GROUP BY task_title
ORDER BY hours_logged DESC;

-- D4: Daily activity trend
SELECT DATE(start_time) AS log_date,
       SUM(duration) AS total_hours
FROM time_entries
GROUP BY log_date
ORDER BY log_date;


/* ===========================================================
   RUBRIC E — REQUESTS ANALYTICS
   =========================================================== */

-- E1: Requests count by status
SELECT status, COUNT(*) AS total_requests
FROM requests
GROUP BY status
ORDER BY total_requests DESC;

-- E2: Requests per user
SELECT u.first_name || ' ' || u.last_name AS user_name,
       COUNT(r.request_id) AS request_count
FROM requests r
JOIN users u ON r.user_id = u.user_id
GROUP BY user_name
ORDER BY request_count DESC;

-- E3: Request processing time
SELECT request_id,
       (reviewed_at - created_at) AS processing_time
FROM requests
WHERE reviewed_at IS NOT NULL;

-- E4: Daily number of requests over time
SELECT DATE(created_at) AS request_date,
       COUNT(*) AS total_requests
FROM requests
GROUP BY request_date
ORDER BY request_date;


/* ===========================================================
   TEAM-MEMBER UTILIZATION ANALYTICS (ROLE_ID = 3)
   =========================================================== */

-- 1. Under-utilized team members (few active tasks)
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

-- 2. Over-utilized team members (too many active tasks)
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

-- 3. Team members with neglected tasks (pending > 5 days)
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

-- 4. Members with mostly low-priority tasks
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

-- 5. Who can take an urgent task (least active tasks)
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

-- 6. Highest task completion rate
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

-- 7. Idle users (no tasks at all)
SELECT 
    u.user_id,
    u.first_name || ' ' || u.last_name AS username
FROM users u
LEFT JOIN tasks t ON t.assigned_to_id = u.user_id
WHERE u.role_id = 3
GROUP BY u.user_id
HAVING COUNT(t.task_id) = 0;

-- 8. Users handling too many high-priority tasks
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

-- 9. Average hours per task (from time_entries)
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

-- 10. Team members delaying requests
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

-- 11. Team members handling urgent requests
SELECT
    u.user_id,
    u.first_name || ' ' || u.last_name AS username,
    COUNT(r.request_id) AS urgent_requests_handled
FROM users u
JOIN requests r ON r.reviewed_by = u.user_id
WHERE u.role_id = 3
  AND r.status = 'approved'
  AND r.priority = 'high'
GROUP BY u.user_id
ORDER BY urgent_requests_handled DESC;

-- 12. Workload heatmap: tasks per project per team member
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

/* ===========================================================
   END OF TEAM-MEMBER UTILIZATION QUERIES
   =========================================================== */
