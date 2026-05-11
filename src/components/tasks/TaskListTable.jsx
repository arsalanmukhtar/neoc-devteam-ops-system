import React, { useEffect, useState, useMemo } from 'react';
import { LuListChecks, LuFolderKanban, LuCalendar } from 'react-icons/lu';
import { formatDate, formatDateTime } from '@src/utils/dateFormatter';
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
import Field, { Select } from '../ui/Field';
import FilterPanel, { FilterGroup } from '../ui/FilterPanel';

const STATUS_OPTIONS = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
];

const PRIORITY_OPTIONS = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
];

const stripHtml = (html) => {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return (tmp.textContent || tmp.innerText || '').trim();
};

const titleCase = (s) => {
    if (!s) return '';
    return s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

const TaskListTable = ({ api = '/api/tasks/list' }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilters, setStatusFilters] = useState(() => new Set());
    const [priorityFilters, setPriorityFilters] = useState(() => new Set());
    const [roleId, setRoleId] = useState(null);
    const [userId, setUserId] = useState(null);

    const [selectedTask, setSelectedTask] = useState(null);
    const [drStatus, setDrStatus] = useState('');
    const [drPriority, setDrPriority] = useState('');
    const [saveLoading, setSaveLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        setRoleId(Number(localStorage.getItem('role_id')));
        setUserId(localStorage.getItem('user_id'));
    }, []);

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
                setTasks(Array.isArray(d) ? d : []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [api]);

    useEffect(() => {
        if (success || error) {
            const t = setTimeout(() => {
                setSuccess('');
                setError('');
            }, 3000);
            return () => clearTimeout(t);
        }
    }, [success, error]);

    const toggleFilter = (set, setSet) => (value) => {
        const next = new Set(set);
        if (next.has(value)) next.delete(value);
        else next.add(value);
        setSet(next);
    };

    const clearFilters = () => {
        setStatusFilters(new Set());
        setPriorityFilters(new Set());
    };

    const filtered = useMemo(() => {
        return tasks.filter((t) => {
            if (statusFilters.size > 0 && !statusFilters.has((t.status || '').toLowerCase())) return false;
            if (priorityFilters.size > 0 && !priorityFilters.has((t.priority || '').toLowerCase())) return false;
            if (search.trim()) {
                const q = search.toLowerCase();
                const hay = `${t.title} ${t.project_name} ${t.assigned_first_name} ${t.assigned_last_name}`.toLowerCase();
                if (!hay.includes(q)) return false;
            }
            return true;
        });
    }, [tasks, search, statusFilters, priorityFilters]);

    const openTask = (task) => {
        setSelectedTask(task);
        setDrStatus(task.status || '');
        setDrPriority(task.priority || '');
    };

    const closeDrawer = () => {
        setSelectedTask(null);
        setError('');
        setSuccess('');
    };

    const canEditStatus = selectedTask
        ? roleId !== 3 || selectedTask.assigned_to_id === userId
        : false;
    const canEditPriority = roleId !== 3;
    const canDelete = roleId !== 3;

    const handleSave = async () => {
        if (!selectedTask) return;
        setSaveLoading(true);
        setError('');
        setSuccess('');
        const token = localStorage.getItem('token');
        try {
            const body = canEditPriority
                ? { status: drStatus, priority: drPriority }
                : { status: drStatus };
            const res = await fetch(`/api/tasks/update/${selectedTask.task_id}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });
            if (res.ok) {
                setSuccess('Task updated.');
                setTasks((prev) =>
                    prev.map((t) => (t.task_id === selectedTask.task_id ? { ...t, ...body } : t))
                );
            } else {
                const data = await res.json().catch(() => ({}));
                setError(data.error || 'Update failed.');
            }
        } catch {
            setError('Network error.');
        }
        setSaveLoading(false);
    };

    const handleDelete = async () => {
        if (!selectedTask) return;
        setDeleteLoading(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`/api/tasks/delete/${selectedTask.task_id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            if (res.ok) {
                setSuccess('Task deleted.');
                setTasks((prev) => prev.filter((t) => t.task_id !== selectedTask.task_id));
                closeDrawer();
            } else {
                const data = await res.json().catch(() => ({}));
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
                <span className="text-sm">Loading tasks…</span>
            </div>
        );
    }

    const hasActive = statusFilters.size > 0 || priorityFilters.size > 0;

    return (
        <div className="h-full flex flex-col">
            <div className="flex-shrink-0 px-8 pt-6 pb-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
                <div className="flex items-baseline justify-between mb-3 gap-3">
                    <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50 tracking-tight">
                        List all Tasks
                    </h2>
                    <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums flex-shrink-0">
                        {filtered.length} {filtered.length === 1 ? 'task' : 'tasks'}
                    </span>
                </div>
                <Toolbar
                    search={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search by title, project, or assignee…"
                    filters={
                        <FilterPanel hasActive={hasActive} onClear={clearFilters}>
                            <FilterGroup
                                title="Status"
                                options={STATUS_OPTIONS}
                                selected={statusFilters}
                                onToggle={toggleFilter(statusFilters, setStatusFilters)}
                            />
                            <FilterGroup
                                title="Priority"
                                options={PRIORITY_OPTIONS}
                                selected={priorityFilters}
                                onToggle={toggleFilter(priorityFilters, setPriorityFilters)}
                            />
                        </FilterPanel>
                    }
                />
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto sidebar-scroll px-8 py-6">
            {filtered.length === 0 ? (
                <EmptyState
                    icon={LuListChecks}
                    title={tasks.length === 0 ? 'No tasks yet' : 'No matches'}
                    description={
                        tasks.length === 0
                            ? 'Tasks created under a project will appear here.'
                            : 'Try a different search or filter combination.'
                    }
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
                    {filtered.map((t) => (
                        <Card
                            key={t.task_id}
                            tone={toneFor(t.status)}
                            onClick={() => openTask(t)}
                        >
                            <div className="flex items-center justify-between mb-3 gap-2">
                                <StatusPill tone={toneFor(t.priority)}>
                                    {titleCase(t.priority)}
                                </StatusPill>
                                <StatusPill tone={toneFor(t.status)}>
                                    {titleCase(t.status)}
                                </StatusPill>
                            </div>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50 mb-1 line-clamp-1">
                                {t.title}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 min-h-[2rem] line-clamp-2">
                                {stripHtml(t.description) || 'No description.'}
                            </p>
                            <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400 mb-3">
                                <LuFolderKanban size={12} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
                                <span className="truncate">{t.project_name}</span>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-2 min-w-0">
                                    <Avatar
                                        firstName={t.assigned_first_name}
                                        lastName={t.assigned_last_name}
                                        size="xs"
                                    />
                                    <span className="text-xs text-gray-600 dark:text-gray-300 truncate">
                                        {t.assigned_first_name} {t.assigned_last_name}
                                    </span>
                                </div>
                                <span className="text-[11px] text-gray-500 dark:text-gray-400 flex-shrink-0 tabular-nums flex items-center gap-1">
                                    <LuCalendar size={11} />
                                    {formatDate(t.due_date)}
                                </span>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
            </div>

            <Drawer
                open={!!selectedTask}
                onClose={closeDrawer}
                title={selectedTask?.title}
                subtitle={selectedTask?.project_name}
                width="lg"
                footer={
                    <>
                        {canDelete && (
                            <Button
                                variant="dangerGhost"
                                onClick={handleDelete}
                                loading={deleteLoading}
                                disabled={saveLoading}
                            >
                                Delete task
                            </Button>
                        )}
                        <div className="flex-1" />
                        <Button
                            variant="secondary"
                            onClick={closeDrawer}
                            disabled={saveLoading || deleteLoading}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleSave} loading={saveLoading}>
                            Save changes
                        </Button>
                    </>
                }
            >
                {selectedTask && (
                    <div className="space-y-5">
                        <div>
                            <span className="span-label-style">Description</span>
                            <div
                                className="tiptap mt-1.5 text-sm text-gray-700 dark:text-gray-200 max-h-64 overflow-y-auto sidebar-scroll border border-gray-200 dark:border-gray-800 rounded-md p-3 bg-gray-50 dark:bg-gray-950"
                                dangerouslySetInnerHTML={{
                                    __html:
                                        selectedTask.description ||
                                        '<p class="text-gray-400 dark:text-gray-500">No description.</p>',
                                }}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Status" id="dr_status">
                                <Select
                                    id="dr_status"
                                    value={drStatus}
                                    onChange={(e) => setDrStatus(e.target.value)}
                                    disabled={!canEditStatus}
                                >
                                    {STATUS_OPTIONS.map((s) => (
                                        <option key={s.value} value={s.value}>
                                            {s.label}
                                        </option>
                                    ))}
                                </Select>
                                {!canEditStatus && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                                        Only the assigned team member can update status.
                                    </p>
                                )}
                            </Field>
                            <Field label="Priority" id="dr_priority">
                                {canEditPriority ? (
                                    <Select
                                        id="dr_priority"
                                        value={drPriority}
                                        onChange={(e) => setDrPriority(e.target.value)}
                                    >
                                        {PRIORITY_OPTIONS.map((p) => (
                                            <option key={p.value} value={p.value}>
                                                {p.label}
                                            </option>
                                        ))}
                                    </Select>
                                ) : (
                                    <div className="h-10 flex items-center">
                                        <StatusPill tone={toneFor(drPriority)}>
                                            {titleCase(drPriority)}
                                        </StatusPill>
                                    </div>
                                )}
                            </Field>
                            <div>
                                <span className="span-label-style">Assigned To</span>
                                <div className="mt-1.5 flex items-center gap-2">
                                    <Avatar
                                        firstName={selectedTask.assigned_first_name}
                                        lastName={selectedTask.assigned_last_name}
                                        size="xs"
                                    />
                                    <span className="text-sm text-gray-900 dark:text-gray-100 truncate">
                                        {selectedTask.assigned_first_name}{' '}
                                        {selectedTask.assigned_last_name}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <span className="span-label-style">Due Date</span>
                                <div className="mt-1.5 text-sm text-gray-900 dark:text-gray-100 tabular-nums">
                                    {formatDate(selectedTask.due_date)}
                                </div>
                            </div>
                            <div>
                                <span className="span-label-style">Created</span>
                                <div className="mt-1.5 text-sm text-gray-900 dark:text-gray-100 tabular-nums">
                                    {formatDateTime(selectedTask.created_at)}
                                </div>
                            </div>
                        </div>
                    </div>
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

export default TaskListTable;
