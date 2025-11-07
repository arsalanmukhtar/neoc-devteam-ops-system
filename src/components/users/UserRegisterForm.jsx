import React, { useState, useEffect } from 'react';
import { Select } from '@mantine/core';
import NotificationAlert from "../NotificationAlert";

const baseURL = 'http://localhost:3000';

const UserRegisterForm = ({ api, onRegistered }) => {
    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        role_id: '',
        is_active: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch(baseURL + api, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (res.ok) {
                if (onRegistered) onRegistered(data);
                setForm({
                    first_name: '',
                    last_name: '',
                    email: '',
                    password: '',
                    role_id: '',
                    is_active: ''
                });
                setSuccess('User registered successfully!');
            } else {
                setError(data.error || 'Registration failed');
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
        <form className="w-full max-w-2xl mx-auto flex flex-col gap-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                    <label htmlFor="first_name" className="label-style">First Name</label>
                    <input type="text" id="first_name" name="first_name" className="input-border" required value={form.first_name} onChange={handleChange} />
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="last_name" className="label-style">Last Name</label>
                    <input type="text" id="last_name" name="last_name" className="input-border" required value={form.last_name} onChange={handleChange} />
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="email" className="label-style">Email</label>
                    <input type="email" id="email" name="email" className="input-border" required value={form.email} onChange={handleChange} />
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="password" className="label-style">Password</label>
                    <input type="password" id="password" name="password" className="input-border" required value={form.password} onChange={handleChange} />
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="role_id" className="label-style">Role</label>
                    <Select
                        id="role_id"
                        name="role_id"
                        placeholder="Select Role"
                        data={[
                            { value: '1', label: 'Administrator' },
                            { value: '2', label: 'Project Manager' },
                            { value: '3', label: 'Team Member' },
                        ]}
                        radius="xl"
                        size="md"
                        value={form.role_id}
                        onChange={value => setForm({ ...form, role_id: value })}
                        searchable
                        classNames={{
                            input: 'input-border font-sans',
                            dropdown: 'font-sans',
                            item: 'font-sans'
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
                        data={[
                            { value: 'true', label: 'Active' },
                            { value: 'false', label: 'Inactive' },
                        ]}
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
                <button type="submit" className="mt-6 bg-green-500 text-white font-semibold py-2 px-8 rounded-full hover:bg-green-600 transition" disabled={loading}>
                    {loading ? "Registering..." : "Register User"}
                </button>
            </div>
        </form>
    );
};

export default UserRegisterForm;