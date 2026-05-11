import React, { useState, useEffect } from 'react';
import NotificationAlert from '../NotificationAlert';
import Button from '../ui/Button';
import Field, { Input, Select } from '../ui/Field';
import RichTextEditor from '../ui/RichTextEditor';

const STATUS_OPTIONS = [
    { value: 'active', label: 'Active' },
    { value: 'planning', label: 'Planning' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'inactive', label: 'Inactive' },
];

const toDateInput = (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value.slice(0, 10);
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    return '';
};

const emptyForm = {
    name: '',
    description: '',
    manager_id: '',
    status: '',
    start_date: '',
    due_date: '',
};

const ProjectDetailsUpdate = ({ api }) => {
    const [projects, setProjects] = useState([]);
    const [selectedId, setSelectedId] = useState('');
    const [form, setForm] = useState(emptyForm);
    const [managers, setManagers] = useState([]);
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
        fetch('/api/users/managers', {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })
            .then((r) => r.json())
            .then((d) => setManagers(Array.isArray(d) ? d : []))
            .catch(() => {});
    }, []);

    useEffect(() => {
        if (!selectedId) {
            setForm(emptyForm);
            return;
        }
        const token = localStorage.getItem('token');
        fetch(`/api/projects/view/${selectedId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })
            .then((r) => r.json())
            .then((data) => {
                setForm({
                    name: data.name || '',
                    description: data.description || '',
                    manager_id: String(data.manager_id || ''),
                    status: data.status || '',
                    start_date: toDateInput(data.start_date),
                    due_date: toDateInput(data.due_date),
                });
            });
    }, [selectedId]);

    const setField = (name, value) => setForm((f) => ({ ...f, [name]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (form.start_date && form.due_date && form.start_date >= form.due_date) {
            setError('Due date must be after start date.');
            setLoading(false);
            return;
        }

        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${api}/${selectedId}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess('Project updated successfully.');
            } else {
                setError(data.error || 'Update failed.');
            }
        } catch {
            setError('Network error.');
        }
        setLoading(false);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-5">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <Field label="Select project" id="projectSelect" required>
                    <Select
                        id="projectSelect"
                        value={selectedId}
                        onChange={(e) => setSelectedId(e.target.value)}
                    >
                        <option value="">Choose a project…</option>
                        {projects.map((p) => (
                            <option key={p.project_id} value={p.project_id}>
                                {p.name}
                            </option>
                        ))}
                    </Select>
                </Field>
            </div>

            {selectedId && (
                <form
                    className="bg-white rounded-lg border border-gray-200 p-6 space-y-5"
                    onSubmit={handleSubmit}
                >
                    <div>
                        <h2 className="text-base font-semibold text-gray-900 tracking-tight">
                            Update project
                        </h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Edit details and save changes.
                        </p>
                    </div>

                    <Field label="Project name" id="name" required>
                        <Input
                            id="name"
                            name="name"
                            value={form.name}
                            onChange={(e) => setField('name', e.target.value)}
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
                        <Field label="Manager" id="manager_id" required>
                            <Select
                                id="manager_id"
                                value={form.manager_id}
                                onChange={(e) => setField('manager_id', e.target.value)}
                                required
                            >
                                <option value="" disabled>
                                    Select a manager
                                </option>
                                {managers.map((m) => (
                                    <option key={m.user_id} value={m.user_id}>
                                        {m.first_name} {m.last_name}
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
                                    Select a status
                                </option>
                                {STATUS_OPTIONS.map((s) => (
                                    <option key={s.value} value={s.value}>
                                        {s.label}
                                    </option>
                                ))}
                            </Select>
                        </Field>

                        <Field label="Start date" id="start_date" required>
                            <Input
                                type="date"
                                id="start_date"
                                value={form.start_date}
                                onChange={(e) => setField('start_date', e.target.value)}
                                required
                            />
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
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                        <Button type="submit" loading={loading}>
                            Save changes
                        </Button>
                    </div>

                    {error && (
                        <NotificationAlert type="error" message={error} onClose={() => setError('')} />
                    )}
                    {success && (
                        <NotificationAlert
                            type="success"
                            message={success}
                            onClose={() => setSuccess('')}
                        />
                    )}
                </form>
            )}
        </div>
    );
};

export default ProjectDetailsUpdate;
