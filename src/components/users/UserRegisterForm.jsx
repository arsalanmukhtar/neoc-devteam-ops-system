import React, { useState, useEffect } from 'react';
import NotificationAlert from '../NotificationAlert';
import Button from '../ui/Button';
import Field, { Input, Select } from '../ui/Field';

const ROLE_OPTIONS = [
    { value: '1', label: 'Administrator' },
    { value: '2', label: 'Project Manager' },
    { value: '3', label: 'Team Member' },
];

const STATUS_OPTIONS = [
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' },
];

const emptyForm = {
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role_id: '',
    is_active: '',
};

const UserRegisterForm = ({ api, onRegistered }) => {
    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const setField = (name, value) => setForm((f) => ({ ...f, [name]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch(api, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (res.ok) {
                if (onRegistered) onRegistered(data);
                setForm(emptyForm);
                setSuccess('User registered successfully.');
            } else {
                setError(data.error || 'Registration failed.');
            }
        } catch {
            setError('Network error.');
        }
        setLoading(false);
    };

    useEffect(() => {
        if (success || error) {
            const t = setTimeout(() => {
                setSuccess('');
                setError('');
            }, 3000);
            return () => clearTimeout(t);
        }
    }, [success, error]);

    return (
        <form
            className="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 space-y-5"
            onSubmit={handleSubmit}
        >
            <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50 tracking-tight">
                    Register user
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Create a new account with a role and activation status.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="First name" id="first_name" required>
                    <Input
                        id="first_name"
                        name="first_name"
                        value={form.first_name}
                        onChange={(e) => setField('first_name', e.target.value)}
                        required
                    />
                </Field>
                <Field label="Last name" id="last_name" required>
                    <Input
                        id="last_name"
                        name="last_name"
                        value={form.last_name}
                        onChange={(e) => setField('last_name', e.target.value)}
                        required
                    />
                </Field>
                <Field label="Email" id="email" required>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={(e) => setField('email', e.target.value)}
                        autoComplete="off"
                        required
                    />
                </Field>
                <Field label="Password" id="password" required>
                    <Input
                        id="password"
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={(e) => setField('password', e.target.value)}
                        autoComplete="new-password"
                        required
                    />
                </Field>
                <Field label="Role" id="role_id" required>
                    <Select
                        id="role_id"
                        value={form.role_id}
                        onChange={(e) => setField('role_id', e.target.value)}
                        required
                    >
                        <option value="" disabled>
                            Select a role
                        </option>
                        {ROLE_OPTIONS.map((r) => (
                            <option key={r.value} value={r.value}>
                                {r.label}
                            </option>
                        ))}
                    </Select>
                </Field>
                <Field label="Status" id="is_active" required>
                    <Select
                        id="is_active"
                        value={form.is_active}
                        onChange={(e) => setField('is_active', e.target.value)}
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
                    Register user
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

export default UserRegisterForm;
