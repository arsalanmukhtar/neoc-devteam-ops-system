import React, { useEffect, useState, useMemo } from 'react';
import { LuUsers, LuMail } from 'react-icons/lu';
import NotificationAlert from '../NotificationAlert';
import StatusPill from '../ui/StatusPill';
import Card from '../ui/Card';
import Avatar from '../ui/Avatar';
import Drawer from '../ui/Drawer';
import EmptyState from '../ui/EmptyState';
import Toolbar from '../ui/Toolbar';
import Spinner from '../ui/Spinner';
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

const roleLabel = (roleId) =>
    ROLE_OPTIONS.find((r) => r.value === String(roleId))?.label || `Role ${roleId}`;

const isActiveValue = (v) => v === true || v === 'true';

const UserListTable = ({ api = '/api/users/all' }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const [selectedUser, setSelectedUser] = useState(null);
    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        role_id: '',
        is_active: '',
    });
    const [saveLoading, setSaveLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch(api, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })
            .then((r) => r.json())
            .then((d) => {
                setUsers(Array.isArray(d) ? d : []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [api]);

    useEffect(() => {
        if (!selectedUser) return;
        const token = localStorage.getItem('token');
        fetch(`/api/users/view/${selectedUser.user_id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })
            .then((r) => r.json())
            .then((d) => {
                setForm({
                    first_name: d.first_name || '',
                    last_name: d.last_name || '',
                    email: d.email || '',
                    password: '',
                    role_id: String(d.role_id || ''),
                    is_active: d.is_active ? 'true' : 'false',
                });
            });
    }, [selectedUser]);

    useEffect(() => {
        if (success || error) {
            const t = setTimeout(() => {
                setSuccess('');
                setError('');
            }, 3000);
            return () => clearTimeout(t);
        }
    }, [success, error]);

    const filtered = useMemo(() => {
        if (!search.trim()) return users;
        const q = search.toLowerCase();
        return users.filter(
            (u) =>
                `${u.first_name} ${u.last_name}`.toLowerCase().includes(q) ||
                u.email?.toLowerCase().includes(q) ||
                roleLabel(u.role_id).toLowerCase().includes(q)
        );
    }, [users, search]);

    const closeDrawer = () => {
        setSelectedUser(null);
        setError('');
        setSuccess('');
    };

    const setField = (name, value) => setForm((f) => ({ ...f, [name]: value }));

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!selectedUser) return;
        setSaveLoading(true);
        setError('');
        setSuccess('');
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`/api/users/update/${selectedUser.user_id}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess('User updated successfully.');
                setUsers((prev) =>
                    prev.map((u) =>
                        u.user_id === selectedUser.user_id
                            ? {
                                  ...u,
                                  ...form,
                                  is_active: form.is_active === 'true',
                              }
                            : u
                    )
                );
            } else {
                setError(data.error || 'Update failed.');
            }
        } catch {
            setError('Network error.');
        }
        setSaveLoading(false);
    };

    const handleDelete = async () => {
        if (!selectedUser) return;
        setDeleteLoading(true);
        setError('');
        setSuccess('');
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`/api/users/delete/${selectedUser.user_id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            if (res.ok) {
                setSuccess('User deactivated successfully.');
                setUsers((prev) => prev.filter((u) => u.user_id !== selectedUser.user_id));
                closeDrawer();
            } else {
                const data = await res.json();
                setError(data.error || 'Delete failed.');
            }
        } catch {
            setError('Network error.');
        }
        setDeleteLoading(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 text-gray-500 gap-2">
                <Spinner size={16} />
                <span className="text-sm">Loading users…</span>
            </div>
        );
    }

    return (
        <div>
            <div className="sticky top-0 z-[5] bg-white -mx-8 px-8 -mt-6 pt-6 pb-3 mb-4 border-b border-gray-100">
                <h2 className="text-base font-semibold text-gray-900 mb-3 tracking-tight">
                    List all Users
                </h2>
                <Toolbar
                    search={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search by name, email, or role…"
                    right={
                        <span className="text-xs text-gray-500 tabular-nums">
                            {filtered.length} {filtered.length === 1 ? 'user' : 'users'}
                        </span>
                    }
                />
            </div>

            {filtered.length === 0 ? (
                <EmptyState
                    icon={LuUsers}
                    title={users.length === 0 ? 'No users yet' : 'No matches'}
                    description={
                        users.length === 0
                            ? 'Register the first team member from the Register User tab.'
                            : 'Try a different search term.'
                    }
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map((u) => {
                        const active = isActiveValue(u.is_active);
                        return (
                            <Card key={u.user_id} onClick={() => setSelectedUser(u)}>
                                <div className="flex items-start gap-3">
                                    <Avatar
                                        firstName={u.first_name}
                                        lastName={u.last_name}
                                        size="md"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                                                {u.first_name} {u.last_name}
                                            </h3>
                                            <StatusPill tone={active ? 'emerald' : 'rose'}>
                                                {active ? 'Active' : 'Inactive'}
                                            </StatusPill>
                                        </div>
                                        <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500 min-w-0">
                                            <LuMail
                                                size={12}
                                                className="text-gray-400 flex-shrink-0"
                                            />
                                            <span className="truncate">{u.email}</span>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                            <span className="text-[11px] font-medium text-gray-600">
                                                {roleLabel(u.role_id)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            <Drawer
                open={!!selectedUser}
                onClose={closeDrawer}
                title={
                    selectedUser
                        ? `${selectedUser.first_name} ${selectedUser.last_name}`
                        : ''
                }
                subtitle={selectedUser?.email}
                width="lg"
                footer={
                    <>
                        <Button
                            variant="dangerGhost"
                            onClick={handleDelete}
                            loading={deleteLoading}
                            disabled={saveLoading}
                        >
                            Deactivate user
                        </Button>
                        <div className="flex-1" />
                        <Button variant="secondary" onClick={closeDrawer} disabled={saveLoading}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdate} loading={saveLoading}>
                            Save changes
                        </Button>
                    </>
                }
            >
                {selectedUser && (
                    <form className="space-y-4" onSubmit={handleUpdate}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="First name" id="dr_first_name" required>
                                <Input
                                    id="dr_first_name"
                                    value={form.first_name}
                                    onChange={(e) => setField('first_name', e.target.value)}
                                    required
                                />
                            </Field>
                            <Field label="Last name" id="dr_last_name" required>
                                <Input
                                    id="dr_last_name"
                                    value={form.last_name}
                                    onChange={(e) => setField('last_name', e.target.value)}
                                    required
                                />
                            </Field>
                            <Field
                                label="Email"
                                id="dr_email"
                                hint="Email cannot be changed."
                            >
                                <Input id="dr_email" value={form.email} readOnly tabIndex={-1} />
                            </Field>
                            <Field
                                label="Password"
                                id="dr_password"
                                hint="Leave blank to keep unchanged."
                            >
                                <Input
                                    id="dr_password"
                                    type="password"
                                    value={form.password}
                                    onChange={(e) => setField('password', e.target.value)}
                                    autoComplete="new-password"
                                />
                            </Field>
                            <Field label="Role" id="dr_role_id" required>
                                <Select
                                    id="dr_role_id"
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
                            <Field label="Status" id="dr_is_active" required>
                                <Select
                                    id="dr_is_active"
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
                    </form>
                )}
            </Drawer>

            {error && (
                <NotificationAlert type="error" message={error} onClose={() => setError('')} />
            )}
            {success && (
                <NotificationAlert type="success" message={success} onClose={() => setSuccess('')} />
            )}
        </div>
    );
};

export default UserListTable;
