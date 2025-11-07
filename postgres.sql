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
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
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

CREATE TABLE "requests"
(
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
    review_comment TEXT
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
-- 8. TRIGGERS (Apply the function to the Users table)
--
CREATE TRIGGER set_users_updated_at
BEFORE UPDATE ON "users"
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp();