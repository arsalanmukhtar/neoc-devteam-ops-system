# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

---

# Application Development

---

### Application Endpoints

```
{
    // =========================
    // Auth Routes
    // =========================
    // POST /api/auth/register
    "register": {
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.doe@yourdomain.com",
        "password": "yourSecurePassword",
        "role_id": 3 // 1=Admin, 2=Project Manager, 3=Developer
    },
    // POST /api/auth/login
    "login": {
        "email": "john.doe@yourdomain.com",
        "password": "yourSecurePassword"
    },
    // =========================
    // User Routes (Admin Only)
    // =========================
    // PUT /api/users/update/:id
    "updateUser": {
        "first_name": "Jane",
        "last_name": "Smith",
        "email": "jane.smith@yourdomain.com",
        "role_id": 2,
        "is_active": true
    },
    // =========================
    // Project Routes
    // =========================
    // POST /api/projects/create
    "createProject": {
        "name": "Project Alpha",
        "description": "First project for the team",
        "manager_id": "3010e4c8-3f50-428d-a821-2c735967e440", // Project Manager's user_id
        "status": "Planning",
        "start_date": "2025-11-01",
        "due_date": "2025-12-01"
    },
    // PUT /api/projects/update/:id
    "updateProject": {
        "name": "Project Alpha Updated",
        "description": "Updated project description",
        "manager_id": "3010e4c8-3f50-428d-a821-2c735967e440",
        "status": "Active",
        "start_date": "2025-11-05",
        "due_date": "2026-01-15"
    },
    // =========================
    // Task Routes
    // =========================
    // POST /api/tasks/create
    "createTask": {
        "project_id": "PROJECT-UUID-HERE",
        "title": "Setup Project Repository",
        "description": "Initialize the repository and setup basic structure.",
        "assigned_to_id": "8c91acef-63da-411b-b77e-6236231fd1e3", // Developer's user_id
        "priority": "High",
        "status": "To Do",
        "due_date": "2025-11-10"
    },
    // PUT /api/tasks/update/:id
    "updateTask": {
        "title": "Setup Project Repo - Updated",
        "description": "Updated task description.",
        "assigned_to_id": "8c91acef-63da-411b-b77e-6236231fd1e3",
        "priority": "Medium",
        "status": "In Progress",
        "due_date": "2025-11-15"
    },
    // =========================
    // Time Entry Routes
    // =========================
    // POST /api/time/create
    "createTimeEntry": {
        "task_id": "TASK-UUID-HERE",
        "start_time": "2025-11-01T09:00:00+05:00",
        "end_time": "2025-11-01T12:00:00+05:00",
        "notes": "Worked on initial setup."
        // user_id is taken from the logged-in user, not needed in body
    },
    // PUT /api/time/update/:id
    "updateTimeEntry": {
        "task_id": "TASK-UUID-HERE",
        "start_time": "2025-11-01T10:00:00+05:00",
        "end_time": "2025-11-01T13:00:00+05:00",
        "notes": "Updated work log."
    }
}
```
---

## Adding New Fields to Database Tables: Logic & Flow

#### When you add new fields (columns) to your database tables, here’s what will be affected and how you can populate those fields:

This section explains how to safely add new fields (columns) to your database tables and update your application to support them, without losing or corrupting existing data.

---

## 1. Database Changes

- Use SQL `ALTER TABLE` to add new columns.
- Example:
  ```sql
  ALTER TABLE users ADD COLUMN phone_number VARCHAR(20);
  ALTER TABLE projects ADD COLUMN budget DECIMAL(12,2);
  ```
- Make new columns `NULLABLE` or set a default value to avoid issues with existing rows.

---

## 2. Backend Updates

- **Controller Files:**  
  Update controller logic to handle new fields in request bodies, SQL queries (INSERT, UPDATE, SELECT), and API responses.
- **Route Files:**  
  Usually unchanged unless you add new endpoints, but ensure routes accept new data if needed.

---

## 3. Frontend Updates

- **React Components & Forms:**  
  Update forms and API calls to include new fields.
  Update state and rendering logic to show new data.

---

## 4. Populating New Fields

- **During Creation:**  
  Add the new field to frontend forms and send it in the request body.  
  Update controller’s INSERT queries to include the new field.
- **During Update:**  
  Add the new field to update forms.  
  Update controller’s UPDATE queries to allow changing the new field.
- **For Existing Data:**  
  Use SQL to set a default value for existing rows:
  ```sql
  UPDATE table_name SET new_field = 'default_value' WHERE new_field IS NULL;
  ```
  Or, allow the field to be `NULL` and update it later via your app’s update functionality.

---


============================================
Backend/API Changes
On create/update time entry by role_id 3:
Insert into requests table instead of time_entries.
On accept by role_id 1 or 2:
Move the request from requests to time_entries (copy all relevant fields).
Update requests.status to 'accepted', set reviewed_by, reviewed_at.
On reject:
Update requests.status to 'rejected', set reviewed_by, reviewed_at, optionally add review_comment.
Optionally, delete the row after review (or keep for audit).