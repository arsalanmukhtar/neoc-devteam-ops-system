export const userTabs = [
    { label: 'Register User', value: 'register', api: '/api/auth/register' },
    { label: 'List all Users', value: 'list', api: '/api/users/all' },
    { label: 'View User Details', value: 'view', api: '/api/users/view' }, // append /:id in component
    { label: 'Update User Details', value: 'update', api: '/api/users/update' }, // append /:id in component
    { label: 'Delete User', value: 'delete', api: '/api/users/delete' }, // append /:id in component
];

export const projectTabs = [
    { label: 'Create a Project', value: 'create', api: '/api/projects/create' },
    { label: 'List All Projects', value: 'list', api: '/api/projects/list' },
    { label: 'Update Project Details', value: 'update', api: '/api/projects/update' }, // append /:id in component
    { label: 'Delete Project', value: 'delete', api: '/api/projects/delete' }, // append /:id in component
];

export const taskTabs = [
    { label: 'Create a Task', value: 'create', api: '/api/tasks/create' },
    { label: 'List all Tasks', value: 'list', api: '/api/tasks/list' },
];

export const timeTabs = [
    { label: 'Create Time Entry', value: 'create', api: '/api/time/create' },
    { label: 'List Time Entries', value: 'list', api: '/api/time/list' },
    // { label: 'Update Time Entry', value: 'update', api: '/api/time/update' }, // append /:id in component
    // { label: 'Delete Time Entry', value: 'delete', api: '/api/time/delete' }, // append /:id in component
];