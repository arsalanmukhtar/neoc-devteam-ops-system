# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

--

Application Development

--

### User Endpoints (api/users)
Method,Path,Description
POST,/api/users/register,Create a new user (requires hashing the password).
POST,/api/users/login,Read/Authenticate a user (returns a JWT token).
GET,/api/users/me,Read the currently authenticated user's profile.
GET,/api/users/:id,Read a specific user's details (Admin/PM only).
PUT,/api/users/:id,"Update a user's details (e.g., name, role, status)."
DELETE,/api/users/:id,Delete/Deactivate a user (Admin only).

### Project Endpoints (api/projects)
Method,Path,Description
POST,/api/projects,Create a new project.
GET,/api/projects,Read all projects (with optional filtering by status/manager).
GET,/api/projects/:id,Read details for a specific project.
PUT,/api/projects/:id,"Update project details (name, description, status)."
DELETE,/api/projects/:id,Delete a project.

### Task Endpoints (api/task)
Method,Path,Description
POST,/api/tasks,Create a new task.
GET,/api/tasks,Read tasks (Crucial: allow filtering by project_id and assigned_to_id).
GET,/api/tasks/:id,Read details for a specific task.
PUT,/api/tasks/:id,"Update task details (title, status, priority, assignee)."
DELETE,/api/tasks/:id,Delete a task.

### Time Entrt Endpoints ()
Method,Path,Description
POST,/api/time,Create a new time entry (log start and end time).
GET,/api/time,Read all time entries (Crucial: allow filtering by user_id and date range).
GET,/api/time/:id,Read a specific time entry.
PUT,/api/time/:id,Update a time entry (correcting notes or end time).
DELETE,/api/time/:id,Delete a time entry.