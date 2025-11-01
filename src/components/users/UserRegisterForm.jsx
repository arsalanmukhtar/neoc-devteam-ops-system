import React, { useState } from 'react';
import { Select } from '@mantine/core';

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
            } else {
                setError(data.error || 'Registration failed');
            }
        } catch {
            setError('Network error');
        }
        setLoading(false);
    };

    return (
        <form className="w-full max-w-2xl mx-auto flex flex-col gap-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                    <label htmlFor="first_name" className="font-medium text-stone-700">First Name</label>
                    <input type="text" id="first_name" name="first_name" className="border border-gray-300 rounded-full px-4 py-2" required value={form.first_name} onChange={handleChange} />
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="last_name" className="font-medium text-stone-700">Last Name</label>
                    <input type="text" id="last_name" name="last_name" className="border border-gray-300 rounded-full px-4 py-2" required value={form.last_name} onChange={handleChange} />
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="email" className="font-medium text-stone-700">Email</label>
                    <input type="email" id="email" name="email" className="border border-gray-300 rounded-full px-4 py-2" required value={form.email} onChange={handleChange} />
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="password" className="font-medium text-stone-700">Password</label>
                    <input type="password" id="password" name="password" className="border border-gray-300 rounded-full px-4 py-2" required value={form.password} onChange={handleChange} />
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="role_id" className="font-medium text-stone-700">Role</label>
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
                        styles={{
                            input: { background: '#FBFCFA', borderColor: '#F09875', color: '#44403c' },
                            dropdown: { background: '#FBFCFA' },
                            item: { color: '#44403c' },
                        }}
                        required
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="is_active" className="font-medium text-stone-700">Active</label>
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
                        styles={{
                            input: { background: '#FBFCFA', borderColor: '#F09875', color: '#44403c' },
                            dropdown: { background: '#FBFCFA' },
                            item: { color: '#44403c' },
                        }}
                        required
                    />
                </div>
            </div>
            {error && <div className="text-red-500">{error}</div>}
            <div className="flex justify-end">
                <button type="submit" className="mt-6 bg-green-600 text-white font-semibold py-2 px-8 rounded-full hover:bg-green-700 transition" disabled={loading}>
                    {loading ? "Registering..." : "Register User"}
                </button>
            </div>
        </form>
    );
};

export default UserRegisterForm;