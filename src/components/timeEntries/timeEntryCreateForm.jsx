import React, { useState, useEffect } from 'react';
import { LuInfo } from 'react-icons/lu';
import NotificationAlert from '../NotificationAlert';
import Button from '../ui/Button';
import Field, { Input, Select } from '../ui/Field';
import RichTextEditor from '../ui/RichTextEditor';

const PRIORITY_OPTIONS = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
];

const emptyForm = {
    task_id: '',
    priority: '',
    start_time: '',
    end_time: '',
    notes: '',
};

const TimeEntryCreateForm = ({ onCreated }) => {
    const [form, setForm] = useState(emptyForm);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [roleId, setRoleId] = useState(null);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        setRoleId(Number(localStorage.getItem('role_id')));
        setUserId(localStorage.getItem('user_id'));
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        let url = '/api/tasks/list';
        if (roleId === 3 && userId) {
            url += `?assigned_to_id=${userId}`;
        }
        fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })
            .then((r) => r.json())
            .then((d) => setTasks(Array.isArray(d) ? d : []))
            .catch(() => {});
    }, [roleId, userId]);

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

        if (form.start_time && form.end_time && form.start_time >= form.end_time) {
            setError('End time must be after start time.');
            setLoading(false);
            return;
        }

        const token = localStorage.getItem('token');
        const endpoint = roleId === 3 ? '/api/requests/time-entry' : '/api/time/create';

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...form,
                    start_time: new Date(form.start_time).toISOString(),
                    end_time: new Date(form.end_time).toISOString(),
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess(
                    roleId === 3
                        ? 'Time entry request submitted for approval.'
                        : 'Time entry created successfully.'
                );
                setForm(emptyForm);
                if (onCreated) onCreated(data);
            } else {
                setError(data.error || 'Submission failed.');
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
                    {roleId === 3 ? 'Submit time entry' : 'Create time entry'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Log the hours you spent on a task.
                </p>
            </div>

            {roleId === 3 && (
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-md bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/30">
                    <LuInfo size={15} className="text-sky-600 dark:text-sky-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-sky-900 dark:text-sky-200">
                        Your entry will be sent to an Admin or Project Manager for approval
                        before counting toward your logged hours.
                    </p>
                </div>
            )}

            <Field label="Task" id="task_id" required>
                <Select
                    id="task_id"
                    value={form.task_id}
                    onChange={(e) => setField('task_id', e.target.value)}
                    required
                >
                    <option value="" disabled>
                        Select a task
                    </option>
                    {tasks.map((t) => (
                        <option key={t.task_id} value={t.task_id}>
                            {t.title || `Task #${t.task_id}`}
                        </option>
                    ))}
                </Select>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Start time" id="start_time" required>
                    <Input
                        type="datetime-local"
                        id="start_time"
                        value={form.start_time}
                        onChange={(e) => setField('start_time', e.target.value)}
                        required
                    />
                </Field>
                <Field label="End time" id="end_time" required>
                    <Input
                        type="datetime-local"
                        id="end_time"
                        value={form.end_time}
                        onChange={(e) => setField('end_time', e.target.value)}
                        required
                    />
                </Field>
            </div>

            <Field label="Notes">
                <RichTextEditor
                    value={form.notes}
                    onChange={(html) => setField('notes', html)}
                    minHeight="120px"
                    maxHeight="240px"
                />
            </Field>

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
                    {roleId === 3 ? 'Submit for approval' : 'Add entry'}
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

export default TimeEntryCreateForm;
