import React, { useState, useEffect } from 'react';
import { Select, Modal, Button, Table} from '@mantine/core';

const baseURL = 'http://localhost:3000';

const UserDelete = ({ api }) => {
    const [users, setUsers] = useState([]);
    const [selectedId, setSelectedId] = useState('');
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [modalOpened, setModalOpened] = useState(false);

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
                .then(data => setDetails(data));
        } else {
            setDetails(null);
        }
    }, [selectedId]);

    const handleDelete = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${baseURL}${api}/${selectedId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (res.ok) {
                setSuccess('User deleted successfully!');
                setSelectedId('');
                setDetails(null);
                const updatedUsers = users.filter(u => u.user_id !== selectedId);
                setUsers(updatedUsers);
            } else {
                const data = await res.json();
                setError(data.error || 'Delete failed');
            }
        } catch {
            setError('Network error');
        }
        setLoading(false);
        setModalOpened(false);
    };

    const handleCancel = () => {
        setSelectedId('');
        setDetails(null);
        setError('');
        setSuccess('');
    };

    return (
        <div className="w-full flex flex-col items-center font-sans">
            <div className="mb-4 w-full max-w-2xl">
                <label htmlFor="userSelect" className="block font-medium text-stone-700 mb-2 text-center">
                    Select User
                </label>
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
                    searchable
                    classNames={{
                        input: 'input-border font-sans',
                        dropdown: 'font-sans',
                        item: 'font-sans'
                    }}
                    required
                />
            </div>
            {details && (
                <div className="w-full max-w-2xl">
                    <Table
                        striped
                        highlightOnHover
                        withColumnBorders
                        style={{
                            marginTop: '2rem',
                            width: '100%',
                            background: '#FBFCFA',
                            borderRadius: '1rem',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                            border: '1px solid #e2e8f0',
                            textAlign: 'left'
                        }}
                    >
                        <tbody>
                            <tr>
                                <td className="table-header-style"><strong>First Name</strong></td>
                                <td className="text-stone-600">{details.first_name}</td>
                            </tr>
                            <tr>
                                <td className="table-header-style"><strong>Last Name</strong></td>
                                <td className="text-stone-600">{details.last_name}</td>
                            </tr>
                            <tr>
                                <td className="table-header-style"><strong>Email</strong></td>
                                <td className="text-stone-600">{details.email}</td>
                            </tr>
                            <tr>
                                <td className="table-header-style"><strong>Role</strong></td>
                                <td className="text-stone-600">{details.role_id}</td>
                            </tr>
                            <tr>
                                <td className="table-header-style"><strong>Active</strong></td>
                                <td className={details.is_active ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'}>
                                    {details.is_active ? "Active" : "Inactive"}
                                </td>
                            </tr>
                        </tbody>
                    </Table>
                    <div className="flex justify-end gap-4 mt-8">
                        <Button
                            color="red"
                            radius="xl"
                            size="md"
                            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-8 py-2 rounded-full transition"
                            onClick={() => setModalOpened(true)}
                            disabled={loading}
                        >
                            Delete User
                        </Button>
                        <Button
                            variant="outline"
                            radius="xl"
                            size="md"
                            className="border border-gray-300 text-stone-700 font-semibold px-8 py-2 rounded-full transition"
                            onClick={handleCancel}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                    </div>
                    <Modal
                        opened={modalOpened}
                        onClose={() => setModalOpened(false)}
                        centered
                        title="Confirm Delete"
                    >
                        <div className="text-red-500 font-semibold mb-4">
                            Are you sure you want to delete this user? <br />
                            <span className="font-normal text-stone-700">This action can't be undone.</span>
                        </div>
                        <div className="flex justify-end gap-4">
                            <Button
                                variant="outline"
                                radius="xl"
                                size="md"
                                className="border border-gray-300 text-stone-700 font-semibold px-8 py-2 rounded-full transition"
                                onClick={() => setModalOpened(false)}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                color="red"
                                radius="xl"
                                size="md"
                                className="bg-red-500 hover:bg-red-600 text-white font-semibold px-8 py-2 rounded-full transition"
                                onClick={handleDelete}
                                disabled={loading}
                            >
                                {loading ? "Deleting..." : "Delete"}
                            </Button>
                        </div>
                    </Modal>
                    {error && <div className="text-red-500 mt-4">{error}</div>}
                    {success && <div className="text-green-600 mt-4">{success}</div>}
                </div>
            )}
        </div>
    );
};

export default UserDelete;