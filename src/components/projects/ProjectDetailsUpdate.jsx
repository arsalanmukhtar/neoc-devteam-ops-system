import React, { useEffect, useState, useMemo } from 'react';
import { LuFolderKanban } from 'react-icons/lu';
import { formatDate } from '@src/utils/dateFormatter';
import NotificationAlert from '../NotificationAlert';
import StatusPill from '../ui/StatusPill';
import { toneFor } from '../ui/statusTone';
import Card from '../ui/Card';
import Avatar from '../ui/Avatar';
import Drawer from '../ui/Drawer';
import EmptyState from '../ui/EmptyState';
import Toolbar from '../ui/Toolbar';
import Spinner from '../ui/Spinner';
import Button from '../ui/Button';
import Field, { Input, Select } from '../ui/Field';
import RichTextEditor from '../ui/RichTextEditor';
import FilterPanel, { FilterGroup } from '../ui/FilterPanel';

const STATUS_OPTIONS = [
    { value: 'active', label: 'Active' },
    { value: 'planning', label: 'Planning' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'inactive', label: 'Inactive' },
];

const statusLabel = (status) => {
    if (!status) return '—';
    const s = String(status).toLowerCase().replace('_', ' ');
    return s.charAt(0).toUpperCase() + s.slice(1);
};

const stripHtml = (html) => {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return (tmp.textContent || tmp.innerText || '').trim();
};

const toDateInput = (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value.slice(0, 10);
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    return '';
};

const emptyForm = {
    name: '',
    description: '',
    manager_id: '',
    status: '',
    start_date: '',
    due_date: '',
};

const ProjectDetailsUpdate = ({ api }) => {
    const [projects, setProjects] = useState([]);
    const [managers, setManagers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilters, setStatusFilters] = useState(() => new Set());

    const [selectedId, setSelectedId] = useState('');
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch('/api/projects/list', {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })
            .then((r) => r.json())
            .then((d) => {
                setProjects(Array.isArray(d) ? d : []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch('/api/users/managers', {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })
            .then((r) => r.json())
            .then((d) => setManagers(Array.isArray(d) ? d : []))
            .catch(() => {});
    }, []);

    useEffect(() => {
        if (!selectedId) {
            setForm(emptyForm);
            return;
        }
        const token = localStorage.getItem('token');
        fetch(`/api/projects/view/${selectedId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })
            .then((r) => r.json())
            .then((data) => {
                setForm({
                    name: data.name || '',
                    description: data.description || '',
                    manager_id: String(data.manager_id || ''),
                    status: data.status || '',
                    start_date: toDateInput(data.start_date),
                    due_date: toDateInput(data.due_date),
                });
            });
    }, [selectedId]);

    useEffect(() => {
        if (success || error) {
            const t = setTimeout(() => {
                setSuccess('');
                setError('');
            }, 3000);
            return () => clearTimeout(t);
        }
    }, [success, error]);

    const toggleStatus = (v) => {
        const next = new Set(statusFilters);
        if (next.has(v)) next.delete(v);
        else next.add(v);
        setStatusFilters(next);
    };

    const filtered = useMemo(() => {
        return projects.filter((p) => {
            if (statusFilters.size > 0 && !statusFilters.has((p.status || '').toLowerCase()))
                return false;
            if (search.trim()) {
                const q = search.toLowerCase();
                const hay = `${p.name} ${stripHtml(p.description)} ${p.manager_first_name} ${p.manager_last_name}`.toLowerCase();
                if (!hay.includes(q)) return false;
            }
            return true;
        });
    }, [projects, search, statusFilters]);

    const setField = (name, value) => setForm((f) => ({ ...f, [name]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        if (form.start_date && form.due_date && form.start_date >= form.due_date) {
            setError('Due date must be after start date.');
            setSaving(false);
            return;
        }

        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${api}/${selectedId}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess('Project updated successfully.');
                setProjects((prev) =>
                    prev.map((p) =>
                        p.project_id === selectedId ? { ...p, ...form } : p
                    )
                );
            } else {
                setError(data.error || 'Update failed.');
            }
        } catch {
            setError('Network error.');
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 text-gray-500 dark:text-gray-400 gap-2">
                <Spinner size={16} />
                <span className="text-sm">Loading projects…</span>
            </div>
        );
    }

    const hasActive = statusFilters.size > 0;
    const closeDrawer = () => {
        setSelectedId('');
        setForm(emptyForm);
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex-shrink-0 px-8 pt-6 pb-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
                <div className="flex items-baseline justify-between mb-3 gap-3">
                    <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50 tracking-tight">
                        Update Project Details
                    </h2>
                    <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums flex-shrink-0">
                        {filtered.length} {filtered.length === 1 ? 'project' : 'projects'}
                    </span>
                </div>
                <Toolbar
                    search={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search projects to update…"
                    filters={
                        <FilterPanel hasActive={hasActive} onClear={() => setStatusFilters(new Set())}>
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
                    icon={LuFolderKanban}
                    title={projects.length === 0 ? 'No projects yet' : 'No matches'}
                    description={
                        projects.length === 0
                            ? 'Create a project first, then come back here to edit it.'
                            : 'Try a different search or filter combination.'
                    }
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
                    {filtered.map((p) => (
                        <Card
                            key={p.project_id}
                            tone={toneFor(p.status)}
                            onClick={() => setSelectedId(p.project_id)}
                        >
                            <div className="mb-3">
                                <StatusPill tone={toneFor(p.status)}>
                                    {statusLabel(p.status)}
                                </StatusPill>
                            </div>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50 mb-1 line-clamp-1">
                                {p.name}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 min-h-[2rem] line-clamp-2">
                                {stripHtml(p.description) || 'No description.'}
                            </p>
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-2 min-w-0">
                                    <Avatar
                                        firstName={p.manager_first_name}
                                        lastName={p.manager_last_name}
                                        size="xs"
                                    />
                                    <span className="text-xs text-gray-600 dark:text-gray-300 truncate">
                                        {p.manager_first_name} {p.manager_last_name}
                                    </span>
                                </div>
                                <span className="text-[11px] text-gray-500 dark:text-gray-400 flex-shrink-0 tabular-nums">
                                    Due {formatDate(p.due_date)}
                                </span>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
            </div>

            <Drawer
                open={!!selectedId}
                onClose={closeDrawer}
                title={form.name || 'Edit project'}
                subtitle="Edit details and save changes"
                width="xl"
                footer={
                    <>
                        <div className="flex-1" />
                        <Button variant="secondary" onClick={closeDrawer} disabled={saving}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} loading={saving}>
                            Save changes
                        </Button>
                    </>
                }
            >
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <Field label="Project name" id="dr_name" required>
                        <Input
                            id="dr_name"
                            value={form.name}
                            onChange={(e) => setField('name', e.target.value)}
                            required
                        />
                    </Field>

                    <Field label="Description">
                        <RichTextEditor
                            value={form.description}
                            onChange={(html) => setField('description', html)}
                        />
                    </Field>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Manager" id="dr_manager_id" required>
                            <Select
                                id="dr_manager_id"
                                value={form.manager_id}
                                onChange={(e) => setField('manager_id', e.target.value)}
                                required
                            >
                                <option value="" disabled>
                                    Select a manager
                                </option>
                                {managers.map((m) => (
                                    <option key={m.user_id} value={m.user_id}>
                                        {m.first_name} {m.last_name}
                                    </option>
                                ))}
                            </Select>
                        </Field>

                        <Field label="Status" id="dr_status" required>
                            <Select
                                id="dr_status"
                                value={form.status}
                                onChange={(e) => setField('status', e.target.value)}
                                required
                            >
                                <option value="" disabled>
                                    Select a status
                                </option>
                                {STATUS_OPTIONS.map((s) => (
                                    <option key={s.value} value={s.value}>
                                        {s.label}
                                    </option>
                                ))}
                            </Select>
                        </Field>

                        <Field label="Start date" id="dr_start_date" required>
                            <Input
                                type="date"
                                id="dr_start_date"
                                value={form.start_date}
                                onChange={(e) => setField('start_date', e.target.value)}
                                required
                            />
                        </Field>

                        <Field label="Due date" id="dr_due_date" required>
                            <Input
                                type="date"
                                id="dr_due_date"
                                value={form.due_date}
                                onChange={(e) => setField('due_date', e.target.value)}
                                required
                            />
                        </Field>
                    </div>
                </form>
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

export default ProjectDetailsUpdate;
