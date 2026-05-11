import React, { useEffect, useState, useMemo } from 'react';
import { LuClock, LuMessageSquare, LuPencil } from 'react-icons/lu';
import { formatDateTime } from '../../utils/dateFormatter';
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
import Field, { Input } from '../ui/Field';
import RichTextEditor from '../ui/RichTextEditor';
import FilterPanel, { FilterGroup } from '../ui/FilterPanel';

const STATUS_OPTIONS = [
    { value: 'pending', label: 'Pending' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' },
];

const PRIORITY_OPTIONS = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
];

const titleCase = (s) => {
    if (!s) return '';
    return s.replace(/\b\w/g, (c) => c.toUpperCase());
};

const toDateTimeLocal = (value) => {
    if (!value) return '';
    const d = new Date(value);
    if (isNaN(d)) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
        d.getHours()
    )}:${pad(d.getMinutes())}`;
};

const TimeEntryListTable = ({ api = '/api/time/list' }) => {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilters, setStatusFilters] = useState(() => new Set());
    const [priorityFilters, setPriorityFilters] = useState(() => new Set());
    const [roleId, setRoleId] = useState(null);
    const [userId, setUserId] = useState(null);

    const [selected, setSelected] = useState(null);
    const [editing, setEditing] = useState(false);
    const [drEndTime, setDrEndTime] = useState('');
    const [drNotes, setDrNotes] = useState('');
    const [saveLoading, setSaveLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [feedbackOpen, setFeedbackOpen] = useState(false);
    const [feedbackContent, setFeedbackContent] = useState('');

    useEffect(() => {
        setRoleId(Number(localStorage.getItem('role_id')));
        setUserId(localStorage.getItem('user_id'));
    }, []);

    const fetchEntries = () => {
        const token = localStorage.getItem('token');
        let url = api;
        if (roleId === 3 && userId) {
            url += `?user_id=${userId}`;
        }
        fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })
            .then((r) => r.json())
            .then((d) => {
                setEntries(Array.isArray(d) ? d : []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        if (roleId !== null && userId !== null) {
            fetchEntries();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [api, roleId, userId]);

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
    const togglePriority = (v) => {
        const next = new Set(priorityFilters);
        if (next.has(v)) next.delete(v);
        else next.add(v);
        setPriorityFilters(next);
    };

    const filtered = useMemo(() => {
        return entries.filter((e) => {
            const s = (e.status || 'pending').toLowerCase();
            if (statusFilters.size > 0 && !statusFilters.has(s)) return false;
            if (priorityFilters.size > 0 && !priorityFilters.has((e.priority || '').toLowerCase()))
                return false;
            if (search.trim()) {
                const q = search.toLowerCase();
                const hay = `${e.task_title} ${e.user_first_name} ${e.user_last_name}`.toLowerCase();
                if (!hay.includes(q)) return false;
            }
            return true;
        });
    }, [entries, search, statusFilters, priorityFilters]);

    const canEditEntry = (entry) => {
        if (!entry) return false;
        return roleId === 3 && String(userId) === String(entry.user_id);
    };

    const openEntry = (entry) => {
        setSelected(entry);
        setEditing(false);
        setDrEndTime(toDateTimeLocal(entry.end_time));
        setDrNotes(entry.notes || '');
        setError('');
        setSuccess('');
    };

    const closeDrawer = () => {
        setSelected(null);
        setEditing(false);
    };

    const handleUpdateEntry = async () => {
        if (!selected || !canEditEntry(selected)) return;
        setSaveLoading(true);
        setError('');
        setSuccess('');

        const token = localStorage.getItem('token');
        const payload = {
            entry_id: selected.entry_id,
            task_id: selected.task_id,
            start_time: selected.start_time,
            end_time: drEndTime ? new Date(drEndTime).toISOString() : selected.end_time,
            notes: drNotes,
            priority: selected.priority,
        };

        try {
            const res = await fetch('/api/requests/time-entry', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess('Update request submitted for approval.');
                setTimeout(() => {
                    closeDrawer();
                    fetchEntries();
                }, 1500);
            } else {
                setError(data.error || 'Update failed.');
            }
        } catch {
            setError('Network error.');
        }
        setSaveLoading(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 text-gray-500 dark:text-gray-400 gap-2">
                <Spinner size={16} />
                <span className="text-sm">Loading time entries…</span>
            </div>
        );
    }

    const hasActive = statusFilters.size > 0 || priorityFilters.size > 0;

    return (
        <div className="h-full flex flex-col">
            <div className="flex-shrink-0 px-8 pt-6 pb-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
                <div className="flex items-baseline justify-between mb-3 gap-3">
                    <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50 tracking-tight">
                        List Time Entries
                    </h2>
                    <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums flex-shrink-0">
                        {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
                    </span>
                </div>
                <Toolbar
                    search={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search by task or user…"
                    filters={
                        <FilterPanel
                            hasActive={hasActive}
                            onClear={() => {
                                setStatusFilters(new Set());
                                setPriorityFilters(new Set());
                            }}
                        >
                            <FilterGroup
                                title="Status"
                                options={STATUS_OPTIONS}
                                selected={statusFilters}
                                onToggle={toggleStatus}
                            />
                            <FilterGroup
                                title="Priority"
                                options={PRIORITY_OPTIONS}
                                selected={priorityFilters}
                                onToggle={togglePriority}
                            />
                        </FilterPanel>
                    }
                />
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto sidebar-scroll px-8 py-6">
            {filtered.length === 0 ? (
                <EmptyState
                    icon={LuClock}
                    title={entries.length === 0 ? 'No time entries yet' : 'No matches'}
                    description={
                        entries.length === 0
                            ? 'Log your hours from the Create Time Entry tab.'
                            : 'Try a different search or filter combination.'
                    }
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
                    {filtered.map((e) => {
                        const status = (e.status || 'pending').toLowerCase();
                        const duration = e.duration ? Number(e.duration).toFixed(2) : '0';
                        return (
                            <Card
                                key={e.entry_id}
                                tone={toneFor(status)}
                                onClick={() => openEntry(e)}
                            >
                                <div className="flex items-center justify-between mb-3 gap-2">
                                    <StatusPill tone={toneFor(e.priority)}>
                                        {titleCase(e.priority)}
                                    </StatusPill>
                                    <StatusPill tone={toneFor(status)}>
                                        {titleCase(status)}
                                    </StatusPill>
                                </div>
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50 mb-1 line-clamp-1">
                                    {e.task_title || 'Untitled task'}
                                </h3>
                                <div className="flex items-baseline gap-1.5 mb-4">
                                    <span className="text-2xl font-semibold text-gray-900 dark:text-gray-50 tabular-nums">
                                        {duration}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">hours</span>
                                </div>
                                <div className="text-[11px] text-gray-500 dark:text-gray-400 space-y-0.5 mb-3 tabular-nums">
                                    <div>Start: {formatDateTime(e.start_time)}</div>
                                    <div>End: {formatDateTime(e.end_time)}</div>
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <Avatar
                                            firstName={e.user_first_name}
                                            lastName={e.user_last_name}
                                            size="xs"
                                        />
                                        <span className="text-xs text-gray-600 dark:text-gray-300 truncate">
                                            {e.user_first_name} {e.user_last_name}
                                        </span>
                                    </div>
                                    {e.feedback && (
                                        <button
                                            type="button"
                                            onClick={(ev) => {
                                                ev.stopPropagation();
                                                setFeedbackContent(e.feedback);
                                                setFeedbackOpen(true);
                                            }}
                                            className="flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                                        >
                                            <LuMessageSquare size={11} />
                                            Feedback
                                        </button>
                                    )}
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
            </div>

            <Drawer
                open={!!selected}
                onClose={closeDrawer}
                title={selected?.task_title || 'Time entry'}
                subtitle={
                    selected
                        ? `${Number(selected.duration || 0).toFixed(2)} hours logged`
                        : ''
                }
                width="lg"
                footer={
                    canEditEntry(selected) ? (
                        editing ? (
                            <>
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        setEditing(false);
                                        setDrEndTime(toDateTimeLocal(selected.end_time));
                                        setDrNotes(selected.notes || '');
                                    }}
                                    disabled={saveLoading}
                                >
                                    Cancel
                                </Button>
                                <Button onClick={handleUpdateEntry} loading={saveLoading}>
                                    Submit for approval
                                </Button>
                            </>
                        ) : (
                            <>
                                <div className="flex-1" />
                                <Button
                                    variant="secondary"
                                    leftIcon={LuPencil}
                                    onClick={() => setEditing(true)}
                                >
                                    Request edit
                                </Button>
                            </>
                        )
                    ) : null
                }
            >
                {selected && (
                    <div className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="span-label-style">Priority</span>
                                <div className="mt-1.5">
                                    <StatusPill tone={toneFor(selected.priority)}>
                                        {titleCase(selected.priority)}
                                    </StatusPill>
                                </div>
                            </div>
                            <div>
                                <span className="span-label-style">Status</span>
                                <div className="mt-1.5">
                                    <StatusPill tone={toneFor(selected.status || 'pending')}>
                                        {titleCase(selected.status || 'pending')}
                                    </StatusPill>
                                </div>
                            </div>
                            <div>
                                <span className="span-label-style">User</span>
                                <div className="mt-1.5 flex items-center gap-2">
                                    <Avatar
                                        firstName={selected.user_first_name}
                                        lastName={selected.user_last_name}
                                        size="xs"
                                    />
                                    <span className="text-sm text-gray-900 dark:text-gray-100 truncate">
                                        {selected.user_first_name} {selected.user_last_name}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <span className="span-label-style">Duration</span>
                                <div className="mt-1.5 text-sm text-gray-900 dark:text-gray-100 tabular-nums">
                                    {selected.duration
                                        ? `${Number(selected.duration).toFixed(2)} hours`
                                        : '—'}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <span className="span-label-style">Start Time</span>
                                <div className="mt-1.5 text-sm text-gray-900 dark:text-gray-100 tabular-nums">
                                    {formatDateTime(selected.start_time)}
                                </div>
                            </div>
                            <Field
                                label="End Time"
                                id="dr_end_time"
                                hint={editing ? 'Changes go to an Admin/PM for approval.' : null}
                            >
                                {editing ? (
                                    <Input
                                        type="datetime-local"
                                        id="dr_end_time"
                                        value={drEndTime}
                                        onChange={(e) => setDrEndTime(e.target.value)}
                                    />
                                ) : (
                                    <div className="h-10 flex items-center text-sm text-gray-900 dark:text-gray-100 tabular-nums">
                                        {formatDateTime(selected.end_time)}
                                    </div>
                                )}
                            </Field>
                        </div>

                        <div>
                            <span className="span-label-style">Notes</span>
                            <div className="mt-1.5">
                                {editing ? (
                                    <RichTextEditor
                                        value={drNotes}
                                        onChange={setDrNotes}
                                        minHeight="120px"
                                        maxHeight="240px"
                                    />
                                ) : (
                                    <div
                                        className="tiptap text-sm text-gray-700 dark:text-gray-200 max-h-48 overflow-y-auto sidebar-scroll border border-gray-200 dark:border-gray-800 rounded-md p-3 bg-gray-50 dark:bg-gray-950"
                                        dangerouslySetInnerHTML={{
                                            __html:
                                                selected.notes ||
                                                '<p class="text-gray-400 dark:text-gray-500">No notes.</p>',
                                        }}
                                    />
                                )}
                            </div>
                        </div>

                        {selected.feedback && (
                            <div>
                                <span className="span-label-style">Reviewer feedback</span>
                                <div
                                    className="tiptap mt-1.5 text-sm text-gray-700 dark:text-gray-200 border border-amber-200 dark:border-amber-500/30 rounded-md p-3 bg-amber-50 dark:bg-amber-500/10"
                                    dangerouslySetInnerHTML={{ __html: selected.feedback }}
                                />
                            </div>
                        )}

                        <div>
                            <span className="span-label-style">Created</span>
                            <div className="mt-1.5 text-sm text-gray-900 dark:text-gray-100 tabular-nums">
                                {formatDateTime(selected.created_at)}
                            </div>
                        </div>
                    </div>
                )}
            </Drawer>

            <Drawer
                open={feedbackOpen}
                onClose={() => setFeedbackOpen(false)}
                title="Reviewer feedback"
                width="md"
            >
                <div
                    className="tiptap text-sm text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-800 rounded-md p-4 bg-gray-50 dark:bg-gray-950 min-h-[100px]"
                    dangerouslySetInnerHTML={{
                        __html:
                            feedbackContent ||
                            '<p class="text-gray-400 dark:text-gray-500">No feedback.</p>',
                    }}
                />
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

export default TimeEntryListTable;
