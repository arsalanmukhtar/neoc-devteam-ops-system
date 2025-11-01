import React, { useEffect, useState } from 'react';

const baseURL = 'http://localhost:3000';

const UserDelete = ({ api }) => {
    const [users, setUsers] = useState([]);
    const [selectedId, setSelectedId] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetch('/api/users/list')
            .then(res => res.json())
            .then(data => setUsers(data));
    }, []);

    const handleDelete = async () => {
        if (!selectedId) return;
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        const res = await fetch(`${baseURL}${api}/${selectedId}`, { method: 'DELETE' });
        if (res.ok) {
            setMessage('User deleted successfully.');
            setUsers(users.filter(u => u.user_id !== selectedId));
            setSelectedId('');
        } else {
            setMessage('Failed to delete user.');
        }
    };

    return (
        <div className="max-w-lg mx-auto">
            <div className="mb-4">
                <label htmlFor="userDeleteSelect" className="block font-medium text-stone-700 mb-2">Select User to Delete</label>
                <select
                    id="userDeleteSelect"
                    className="border border-gray-300 rounded-full px-4 py-2 w-full"
                    value={selectedId}
                    onChange={e => setSelectedId(e.target.value)}
                >
                    <option value="">Choose a user</option>
                    {users.map(user => (
                        <option key={user.user_id} value={user.user_id}>
                            {user.first_name} {user.last_name} ({user.email})
                        </option>
                    ))}
                </select>
            </div>
            <div className="flex justify-end">
                <button
                    className="bg-red-500 text-white px-6 py-2 rounded-full hover:bg-red-600 transition"
                    onClick={handleDelete}
                    disabled={!selectedId}
                >
                    Delete User
                </button>
            </div>
            {message && <div className="mt-4 text-green-600">{message}</div>}
        </div>
    );
};

export default UserDelete;