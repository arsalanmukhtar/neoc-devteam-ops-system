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

const emptyForm = {
    name: '',
    description: '',
    manager_id: '',
    status: '',
    start_date: '',
    due_date: '',
};

const ProjectCreateForm = ({ api, onCreated }) => {
    const [form, setForm] = useState(emptyForm);
    const [managers, setManagers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch('/api/users/managers', {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })
            .then((res) => res.json())
            .then((data) => setManagers(Array.isArray(data) ? data : []))
            .catch(() => {});
    }, []);

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
                setSuccess('Project created successfully.');
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

    const handleReset = () => setForm(emptyForm);

    return (
        <form
            className="max-w-2xl mx-auto bg-white rounded-lg border border-gray-200 p-6 space-y-5"
            onSubmit={handleSubmit}
        >
            <div>
                <h2 className="text-base font-semibold text-gray-900 tracking-tight">
                    Create project
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                    Set up a new project and assign a manager.
                </p>
            </div>

            <Field label="Project name" id="name" required>
                <Input
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={(e) => setField('name', e.target.value)}
                    placeholder="e.g. Internal Tools"
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
                <Button type="button" variant="secondary" onClick={handleReset} disabled={loading}>
                    Clear
                </Button>
                <Button type="submit" loading={loading}>
                    Create project
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

export default ProjectCreateForm;
