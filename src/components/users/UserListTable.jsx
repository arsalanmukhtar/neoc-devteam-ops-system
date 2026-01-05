import React, { useEffect, useState, useMemo } from 'react';
import { MantineReactTable, useMantineReactTable } from 'mantine-react-table';
import { Modal, Button, Select } from '@mantine/core';
import NotificationAlert from "../NotificationAlert";

// const baseURL = 'http://localhost:3000';

const roles = [
    { value: '1', label: 'Administrator' },
    { value: '2', label: 'Project Manager' },
    { value: '3', label: 'Team Member' },
];

const statusOptions = [
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' },
];

const statusColors = {
    active: { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' },     // Green
    inactive: { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },   // Red
};

const UserListTable = ({ api = "/api/users/all" }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rowSelection, setRowSelection] = useState({});
    const [modalOpened, setModalOpened] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        role_id: '',
        is_active: '',
    });
    const [modalLoading, setModalLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Fetch all users
    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch(api, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
            .then(res => res.json())
            .then(data => {
                setUsers(Array.isArray(data) ? data : []);
                setLoading(false);
            });
    }, [api]);

    // Fetch selected user details for modal
    useEffect(() => {
        if (selectedUser) {
            const token = localStorage.getItem('token');
            fetch(`/api/users/view/${selectedUser.user_id}`, {
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
                        password: '',
                        role_id: String(data.role_id) || '',
                        is_active: data.is_active ? 'true' : 'false',
                    });
                });
        }
    }, [selectedUser]);

    // Table columns
    const columns = useMemo(
        () => [
            {
                accessorKey: 'first_name',
                header: 'First Name',
                mantineTableHeadCellProps: { sx: { color: '#2563eb' } },
                Cell: ({ row }) => (
                    <span
                        className='text-xs'
                        style={{
                            color: '#2563eb',
                            cursor: 'pointer',
                            fontWeight: 500,
                            transition: 'color 0.2s',
                        }}
                        onClick={() => {
                            setSelectedUser(row.original);
                            setModalOpened(true);
                        }}
                    >
                        {row.original.first_name}
                    </span>
                ),
            },
            {
                accessorKey: 'last_name',
                header: 'Last Name',
                mantineTableHeadCellProps: { sx: { color: '#2563eb' } },
                Cell: ({ cell }) => <span className='text-xs text-gray-700'>{cell.getValue()}</span>,
            },
            {
                accessorKey: 'email',
                header: 'Email',
                mantineTableHeadCellProps: { sx: { color: '#2563eb' } },
                Cell: ({ cell }) => <span className='text-xs text-gray-700'>{cell.getValue()}</span>,
            },
            {
                accessorKey: 'role_id',
                header: 'Role ID',
                mantineTableHeadCellProps: { sx: { color: '#2563eb' } },
                Cell: ({ cell }) => <span className='text-xs text-gray-700'>{cell.getValue()}</span>,
            },
            {
                accessorKey: 'role_name',
                header: 'Role Name',
                mantineTableHeadCellProps: { sx: { color: '#2563eb' } },
                Cell: ({ cell }) => <span className='text-xs text-gray-700'>{cell.getValue()}</span>,
            },
            {
                accessorKey: 'is_active',
                header: 'Status',
                mantineTableHeadCellProps: { sx: { color: '#2563eb' } },
                Cell: ({ cell }) => {
                    const value = cell.getValue();
                    const isActive = value === true || value === 'true';
                    const colors = isActive ? statusColors.active : statusColors.inactive;
                    const label = isActive ? 'Active' : 'Inactive';
                    return (
                        <span
                            className="text-xs px-3 py-1.5 rounded-full font-semibold inline-flex items-center gap-1.5"
                            style={{
                                backgroundColor: colors.bg,
                                color: colors.text,
                                border: `1px solid ${colors.border}`,
                            }}
                        >
                            <span
                                style={{
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    backgroundColor: colors.text,
                                }}
                            />
                            {label}
                        </span>
                    );
                },
            },
        ],
        [],
    );

    const table = useMantineReactTable({
        columns,
        data: users,
        enableColumnOrdering: true,
        enableRowSelection: true,
        enablePagination: true,
        onRowSelectionChange: setRowSelection,
        state: { rowSelection },
        mantineTableProps: {
            striped: true,
            highlightOnHover: true,
            withColumnBorders: true,
            style: { background: '#f8fafc', borderRadius: '8px' },
        },
        mantineTableBodyRowProps: ({ row }) => ({
            style: {
                background: '#f8fafc',
            },
        }),
        mantineTableBodyCellProps: {
            sx: { background: 'inherit' },
        },
        mantineTableHeadCellProps: {
            sx: {
                background: '#e0e7ef',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            },
        },
        mantineTableContainerProps: {
            sx: { background: '#f8fafc', borderRadius: '8px', padding: '1rem' },
        },
    });

    // Handle update
    const handleUpdate = async e => {
        e.preventDefault();
        setModalLoading(true);
        setError('');
        setSuccess('');
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`/api/users/update/${selectedUser.user_id}`, {
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
                setUsers(users =>
                    users.map(user =>
                        user.user_id === selectedUser.user_id
                            ? { ...user, ...form, is_active: form.is_active === 'true' }
                            : user
                    )
                );
            } else {
                setError(data.error || 'Update failed');
            }
        } catch {
            setError('Network error');
        }
        setModalLoading(false);
    };

    // Handle delete
    const handleDelete = async () => {
        setDeleteLoading(true);
        setError('');
        setSuccess('');
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`/api/users/delete/${selectedUser.user_id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (res.ok) {
                setSuccess('User deleted successfully!');
                setUsers(users.filter(user => user.user_id !== selectedUser.user_id));
                setModalOpened(false);
                setSelectedUser(null);
            } else {
                const data = await res.json();
                setError(data.error || 'Delete failed');
            }
        } catch {
            setError('Network error');
        }
        setDeleteLoading(false);
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

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '8px' }}>
                Loading...
            </div>
        );
    }

    if (!users.length) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#e53e3e', background: '#f8fafc', borderRadius: '8px' }}>
                No users found or unauthorized.
            </div>
        );
    }

    return (
        <>
            <MantineReactTable table={table} />
            <Modal
                opened={modalOpened}
                onClose={() => {
                    setModalOpened(false);
                    setSelectedUser(null);
                }}
                title={
                    <div className="text-lg font-bold text-blue-400 flex items-center gap-2">
                        <span className='text-stone-700 text-2xl'>User Details</span>
                    </div>
                }
                centered
                size="lg"
                overlayProps={{ blur: 4 }}
                className='sidebar-scroll'
            >
                {selectedUser && (
                    <form className="p-4 bg-white rounded-lg shadow space-y-6" onSubmit={handleUpdate}>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label htmlFor="first_name" className="label-style">First Name</label>
                                <input
                                    type="text"
                                    id="first_name"
                                    name="first_name"
                                    className="input-border"
                                    required
                                    value={form.first_name}
                                    onChange={e => setForm({ ...form, first_name: e.target.value })}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label htmlFor="last_name" className="label-style">Last Name</label>
                                <input
                                    type="text"
                                    id="last_name"
                                    name="last_name"
                                    className="input-border"
                                    required
                                    value={form.last_name}
                                    onChange={e => setForm({ ...form, last_name: e.target.value })}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label htmlFor="email" className="label-style">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className="input-border bg-gray-100 cursor-not-allowed"
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
                                    className="input-border"
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
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
                                            color: form.is_active === 'true' ? '#22c55e' : form.is_active === 'false' ? '#ef4444' : '#44403c'
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
                        <div className="flex justify-center gap-4 mt-8 pb-16">
                            <Button
                                color="gray"
                                variant="outline"
                                className="w-40 rounded-full"
                                onClick={() => {
                                    setModalOpened(false);
                                    setSelectedUser(null);
                                }}
                                disabled={modalLoading || deleteLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                color="green"
                                className="w-40 rounded-full"
                                loading={modalLoading}
                                type="submit"
                            >
                                Save
                            </Button>
                            <Button
                                color="red"
                                className="w-40 rounded-full"
                                loading={deleteLoading}
                                onClick={handleDelete}
                                type="button"
                            >
                                Delete User
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>
        </>
    );
};

export default UserListTable;