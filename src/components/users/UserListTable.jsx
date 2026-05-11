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
import FilterPanel, { FilterGroup } from '../ui/FilterPanel';

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
    const [roleFilters, setRoleFilters] = useState(() => new Set());
    const [statusFilters, setStatusFilters] = useState(() => new Set());

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

    const toggleRole = (v) => {
        const next = new Set(roleFilters);
        if (next.has(v)) next.delete(v);
        else next.add(v);
        setRoleFilters(next);
    };
    const toggleStatus = (v) => {
        const next = new Set(statusFilters);
        if (next.has(v)) next.delete(v);
        else next.add(v);
        setStatusFilters(next);
    };

    const filtered = useMemo(() => {
        return users.filter((u) => {
            if (roleFilters.size > 0 && !roleFilters.has(String(u.role_id))) return false;
            if (statusFilters.size > 0) {
                const v = isActiveValue(u.is_active) ? 'true' : 'false';
                if (!statusFilters.has(v)) return false;
            }
            if (search.trim()) {
                const q = search.toLowerCase();
                const hay = `${u.first_name} ${u.last_name} ${u.email} ${roleLabel(u.role_id)}`.toLowerCase();
                if (!hay.includes(q)) return false;
            }
            return true;
        });
    }, [users, search, roleFilters, statusFilters]);

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
            <div className="flex items-center justify-center py-20 text-gray-500 dark:text-gray-400 gap-2">
                <Spinner size={16} />
                <span className="text-sm">Loading users…</span>
            </div>
        );
    }

    const hasActive = roleFilters.size > 0 || statusFilters.size > 0;

    return (
        <div className="h-full flex flex-col">
            <div className="flex-shrink-0 px-8 pt-6 pb-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
                <div className="flex items-baseline justify-between mb-3 gap-3">
                    <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50 tracking-tight">
                        List all Users
                    </h2>
                    <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums flex-shrink-0">
                        {filtered.length} {filtered.length === 1 ? 'user' : 'users'}
                    </span>
                </div>
                <Toolbar
                    search={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search by name, email, or role…"
                    filters={
                        <FilterPanel
                            hasActive={hasActive}
                            onClear={() => {
                                setRoleFilters(new Set());
                                setStatusFilters(new Set());
                            }}
                        >
                            <FilterGroup
                                title="Role"
                                options={ROLE_OPTIONS}
                                selected={roleFilters}
                                onToggle={toggleRole}
                            />
                            <FilterGroup
                                title="Status"
                                options={STATUS_OPTIONS}
                                selected={statusFilters}
                                onToggle={toggleStatus}
                            />
                        </FilterPanel>
                    }
                />
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto sidebar-scroll px-8 py-6">
            {filtered.length === 0 ? (
                <EmptyState
                    icon={LuUsers}
                    title={users.length === 0 ? 'No users yet' : 'No matches'}
                    description={
                        users.length === 0
                            ? 'Register the first team member from the Register User tab.'
                            : 'Try a different search or filter combination.'
                    }
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
                    {filtered.map((u) => {
                        const active = isActiveValue(u.is_active);
                        return (
                            <Card
                                key={u.user_id}
                                tone={active ? 'emerald' : 'rose'}
                                onClick={() => setSelectedUser(u)}
                            >
                                <div className="flex items-start gap-3">
                                    <Avatar
                                        firstName={u.first_name}
                                        lastName={u.last_name}
                                        size="md"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50 truncate">
                                                {u.first_name} {u.last_name}
                                            </h3>
                                            <StatusPill tone={active ? 'emerald' : 'rose'}>
                                                {active ? 'Active' : 'Inactive'}
                                            </StatusPill>
                                        </div>
                                        <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 min-w-0">
                                            <LuMail
                                                size={12}
                                                className="text-gray-400 dark:text-gray-500 flex-shrink-0"
                                            />
                                            <span className="truncate">{u.email}</span>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                                            <span className="text-[11px] font-medium text-gray-600 dark:text-gray-300">
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
            </div>

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
                            <Field label="Email" id="dr_email" hint="Email cannot be changed.">
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
