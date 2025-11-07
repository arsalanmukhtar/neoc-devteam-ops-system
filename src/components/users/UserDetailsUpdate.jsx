import React, { useState, useEffect } from 'react';
import { Select } from '@mantine/core';
import NotificationAlert from "../NotificationAlert";

const baseURL = 'http://localhost:3000';

const roles = [
    { value: '1', label: 'Administrator' },
    { value: '2', label: 'Project Manager' },
    { value: '3', label: 'Team Member' },
];

const statusOptions = [
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' },
];

const UserDetailsUpdate = ({ api }) => {
    const [users, setUsers] = useState([]);
    const [selectedId, setSelectedId] = useState('');
    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        role_id: '',
        is_active: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Fetch all users for selection
    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch(baseURL + '/api/users/all', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
            .then(res => res.json())
            .then(data => setUsers(Array.isArray(data) ? data : []));
    }, []);

    // Fetch selected user details
    useEffect(() => {
        if (selectedId) {
            const token = localStorage.getItem('token');
            fetch(`${baseURL}/api/users/view/${selectedId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => res.json())
                .then(data => {
                    setForm({
                        first_name: data.first_name || '',
                        last_name: data.last_name || '',
                        email: data.email || '',
                        password: '', // Don't prefill password
                        role_id: String(data.role_id) || '',
                        is_active: data.is_active ? 'true' : 'false',
                    });
                });
        }
    }, [selectedId]);

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${baseURL}${api}/${selectedId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess('User updated successfully!');
            } else {
                setError(data.error || 'Update failed');
            }
        } catch {
            setError('Network error');
        }
        setLoading(false);
    };

    useEffect(() => {
        if (success || error) {
            const timer = setTimeout(() => {
                setSuccess('');
                setError('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [success, error]);

    return (
        <div className="w-full flex flex-col items-center font-sans">
            <div className="mb-4 w-full max-w-2xl">
                <label htmlFor="userSelect" className="block font-medium text-stone-700 mb-2 text-center">Select User</label>
                <Select
                    id="userSelect"
                    name="userSelect"
                    placeholder="Choose a user"
                    data={
                        users.map(user => ({
                            value: user.user_id,
                            label: `${user.first_name} ${user.last_name}`
                        }))
                    }
                    radius="xl"
                    size="md"
                    value={selectedId}
                    onChange={value => setSelectedId(value)}
                    classNames={{
                        input: 'input-border font-sans',
                        dropdown: 'font-sans',
                        item: 'font-sans'
                    }}
                    styles={{
                        input: {width: '100%' },
                    }}
                    required
                />
            </div>
            {selectedId && (
                <form className="w-full max-w-2xl mx-auto flex flex-col gap-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="first_name" className="label-style">First Name</label>
                            <input
                                type="text"
                                id="first_name"
                                name="first_name"
                                className="border border-gray-300 rounded-full px-4 py-2"
                                required
                                value={form.first_name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="last_name" className="label-style">Last Name</label>
                            <input
                                type="text"
                                id="last_name"
                                name="last_name"
                                className="border border-gray-300 rounded-full px-4 py-2"
                                required
                                value={form.last_name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="email" className="label-style">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="border border-gray-300 rounded-full px-4 py-2 bg-gray-100 cursor-not-allowed"
                                required
                                value={form.email}
                                readOnly
                                tabIndex={-1}
                                style={{ pointerEvents: 'none', color: '#cacaca' }}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="password" className="label-style">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                className="border border-gray-300 rounded-full px-4 py-2"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Leave blank to keep unchanged"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="role_id" className="label-style">Role</label>
                            <Select
                                id="role_id"
                                name="role_id"
                                placeholder="Select Role"
                                data={roles}
                                radius="xl"
                                size="md"
                                value={form.role_id}
                                onChange={value => setForm({ ...form, role_id: value })}
                                classNames={{
                                    input: 'input-border font-sans',
                                    dropdown: 'font-sans',
                                    item: 'font-sans'
                                }}
                                styles={{
                                    input: { width: '100%' },
                                }}
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="is_active" className="label-style">Active</label>
                            <Select
                                id="is_active"
                                name="is_active"
                                placeholder="Select Status"
                                data={statusOptions}
                                radius="xl"
                                size="md"
                                value={form.is_active}
                                onChange={value => setForm({ ...form, is_active: value })}
                                searchable
                                classNames={{
                                    input: 'input-border font-sans',
                                    dropdown: 'font-sans',
                                    item: 'font-sans'
                                }}
                                styles={{
                                    input: {
                                        color: form.is_active === 'true' ? '#22c55e' : form.is_active === 'false' ? '#ef4444' : '#44403c' // green-500 or red-500 or default
                                    }
                                }}
                                required
                            />
                        </div>
                    </div>
                    {/* MESSAGES */}
                    {error && (
                        <NotificationAlert
                            type="error"
                            message={error}
                            onClose={() => setError("")}
                        />
                    )}
                    {success && (
                        <NotificationAlert
                            type="success"
                            message={success}
                            onClose={() => setSuccess("")}
                        />
                    )}
                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            className="mt-6 bg-red-400 text-white font-semibold py-2 px-8 rounded-full hover:bg-red-500 transition"
                            onClick={() => setForm({
                                first_name: '',
                                last_name: '',
                                email: '',
                                password: '',
                                role_id: '',
                                is_active: ''
                            })}
                            disabled={loading}
                        >
                            Clear Form
                        </button>
                        <button
                            type="submit"
                            className="mt-6 bg-green-500 text-white font-semibold py-2 px-8 rounded-full hover:bg-green-600 transition"
                            disabled={loading}
                        >
                            {loading ? "Updating..." : "Update User"}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default UserDetailsUpdate;