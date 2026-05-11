import React, { useState, useEffect } from 'react';
import NotificationAlert from '../NotificationAlert';
import Button from '../ui/Button';
import Field, { Input, Select } from '../ui/Field';
import RichTextEditor from '../ui/RichTextEditor';

const PRIORITY_OPTIONS = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
];

const STATUS_OPTIONS = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
];

const emptyForm = {
    project_id: '',
    title: '',
    description: '',
    assigned_to_id: '',
    priority: '',
    status: '',
    due_date: '',
};

const TaskCreateForm = ({ api = '/api/tasks/create', onCreated }) => {
    const [form, setForm] = useState(emptyForm);
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch('/api/projects/list', {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })
            .then((r) => r.json())
            .then((d) => setProjects(Array.isArray(d) ? d : []))
            .catch(() => {});
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch('/api/users/team', {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })
            .then((r) => r.json())
            .then((d) => setUsers(Array.isArray(d) ? d : []))
            .catch(() => {});
    }, []);

    useEffect(() => {
        if (success || error) {
            const t = setTimeout(() => {
                setSuccess('');
                setError('');
            }, 3000);
            return () => clearTimeout(t);
        }
    }, [success, error]);

    const setField = (name, value) => setForm((f) => ({ ...f, [name]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(api, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess('Task created successfully.');
                setForm(emptyForm);
                if (onCreated) onCreated(data);
            } else {
                setError(data.error || 'Creation failed.');
            }
        } catch {
            setError('Network error.');
        }
        setLoading(false);
    };

    return (
        <form
            className="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 space-y-5"
            onSubmit={handleSubmit}
        >
            <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50 tracking-tight">
                    Create task
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Add a task under an existing project and assign it to a team member.
                </p>
            </div>

            <Field label="Project" id="project_id" required>
                <Select
                    id="project_id"
                    value={form.project_id}
                    onChange={(e) => setField('project_id', e.target.value)}
                    required
                >
                    <option value="" disabled>
                        Select a project
                    </option>
                    {projects.map((p) => (
                        <option key={p.project_id} value={p.project_id}>
                            {p.name}
                        </option>
                    ))}
                </Select>
            </Field>

            <Field label="Title" id="title" required>
                <Input
                    id="title"
                    name="title"
                    value={form.title}
                    onChange={(e) => setField('title', e.target.value)}
                    placeholder="e.g. Setup project repository"
                    required
                />
            </Field>

            <Field label="Description">
                <RichTextEditor
                    value={form.description}
                    onChange={(html) => setField('description', html)}
                />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Assigned to" id="assigned_to_id" required>
                    <Select
                        id="assigned_to_id"
                        value={form.assigned_to_id}
                        onChange={(e) => setField('assigned_to_id', e.target.value)}
                        required
                    >
                        <option value="" disabled>
                            Select a team member
                        </option>
                        {users.map((u) => (
                            <option key={u.user_id} value={u.user_id}>
                                {u.first_name} {u.last_name}
                            </option>
                        ))}
                    </Select>
                </Field>

                <Field label="Due date" id="due_date" required>
                    <Input
                        type="date"
                        id="due_date"
                        value={form.due_date}
                        onChange={(e) => setField('due_date', e.target.value)}
                        required
                    />
                </Field>

                <Field label="Priority" id="priority" required>
                    <Select
                        id="priority"
                        value={form.priority}
                        onChange={(e) => setField('priority', e.target.value)}
                        required
                    >
                        <option value="" disabled>
                            Select priority
                        </option>
                        {PRIORITY_OPTIONS.map((p) => (
                            <option key={p.value} value={p.value}>
                                {p.label}
                            </option>
                        ))}
                    </Select>
                </Field>

                <Field label="Status" id="status" required>
                    <Select
                        id="status"
                        value={form.status}
                        onChange={(e) => setField('status', e.target.value)}
                        required
                    >
                        <option value="" disabled>
                            Select status
                        </option>
                        {STATUS_OPTIONS.map((s) => (
                            <option key={s.value} value={s.value}>
                                {s.label}
                            </option>
                        ))}
                    </Select>
                </Field>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setForm(emptyForm)}
                    disabled={loading}
                >
                    Clear
                </Button>
                <Button type="submit" loading={loading}>
                    Create task
                </Button>
            </div>

            {error && (
                <NotificationAlert type="error" message={error} onClose={() => setError('')} />
            )}
            {success && (
                <NotificationAlert type="success" message={success} onClose={() => setSuccess('')} />
            )}
        </form>
    );
};

export default TaskCreateForm;
