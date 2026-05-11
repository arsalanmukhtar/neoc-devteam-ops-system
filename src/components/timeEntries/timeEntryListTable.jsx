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

    const filtered = useMemo(() => {
        if (!search.trim()) return entries;
        const q = search.toLowerCase();
        return entries.filter(
            (e) =>
                e.task_title?.toLowerCase().includes(q) ||
                `${e.user_first_name} ${e.user_last_name}`.toLowerCase().includes(q)
        );
    }, [entries, search]);

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
            <div className="flex items-center justify-center py-20 text-gray-500 gap-2">
                <Spinner size={16} />
                <span className="text-sm">Loading time entries…</span>
            </div>
        );
    }

    return (
        <div>
            <div className="sticky top-0 z-[5] bg-white -mx-8 px-8 -mt-6 pt-6 pb-3 mb-4 border-b border-gray-100">
                <h2 className="text-base font-semibold text-gray-900 mb-3 tracking-tight">
                    List Time Entries
                </h2>
                <Toolbar
                    search={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search by task or user…"
                    right={
                        <span className="text-xs text-gray-500 tabular-nums">
                            {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
                        </span>
                    }
                />
            </div>

            {filtered.length === 0 ? (
                <EmptyState
                    icon={LuClock}
                    title={entries.length === 0 ? 'No time entries yet' : 'No matches'}
                    description={
                        entries.length === 0
                            ? 'Log your hours from the Create Time Entry tab.'
                            : 'Try a different search term.'
                    }
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map((e) => {
                        const status = (e.status || 'pending').toLowerCase();
                        const duration = e.duration ? Number(e.duration).toFixed(2) : '0';
                        return (
                            <Card key={e.entry_id} onClick={() => openEntry(e)}>
                                <div className="flex items-center justify-between mb-3 gap-2">
                                    <StatusPill tone={toneFor(e.priority)}>
                                        {titleCase(e.priority)}
                                    </StatusPill>
                                    <StatusPill tone={toneFor(status)}>
                                        {titleCase(status)}
                                    </StatusPill>
                                </div>
                                <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">
                                    {e.task_title || 'Untitled task'}
                                </h3>
                                <div className="flex items-baseline gap-1.5 mb-4">
                                    <span className="text-2xl font-semibold text-gray-900 tabular-nums">
                                        {duration}
                                    </span>
                                    <span className="text-xs text-gray-500">hours</span>
                                </div>
                                <div className="text-[11px] text-gray-500 space-y-0.5 mb-3 tabular-nums">
                                    <div>Start: {formatDateTime(e.start_time)}</div>
                                    <div>End: {formatDateTime(e.end_time)}</div>
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <Avatar
                                            firstName={e.user_first_name}
                                            lastName={e.user_last_name}
                                            size="xs"
                                        />
                                        <span className="text-xs text-gray-600 truncate">
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
                                            className="flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-700"
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
                                    <span className="text-sm text-gray-900 truncate">
                                        {selected.user_first_name} {selected.user_last_name}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <span className="span-label-style">Duration</span>
                                <div className="mt-1.5 text-sm text-gray-900 tabular-nums">
                                    {selected.duration
                                        ? `${Number(selected.duration).toFixed(2)} hours`
                                        : '—'}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <span className="span-label-style">Start Time</span>
                                <div className="mt-1.5 text-sm text-gray-900 tabular-nums">
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
                                    <div className="h-10 flex items-center text-sm text-gray-900 tabular-nums">
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
                                        className="tiptap text-sm text-gray-700 max-h-48 overflow-y-auto sidebar-scroll border border-gray-200 rounded-md p-3 bg-gray-50"
                                        dangerouslySetInnerHTML={{
                                            __html:
                                                selected.notes ||
                                                '<p class="text-gray-400">No notes.</p>',
                                        }}
                                    />
                                )}
                            </div>
                        </div>

                        {selected.feedback && (
                            <div>
                                <span className="span-label-style">Reviewer feedback</span>
                                <div
                                    className="tiptap mt-1.5 text-sm text-gray-700 border border-amber-200 rounded-md p-3 bg-amber-50"
                                    dangerouslySetInnerHTML={{ __html: selected.feedback }}
                                />
                            </div>
                        )}

                        <div>
                            <span className="span-label-style">Created</span>
                            <div className="mt-1.5 text-sm text-gray-900 tabular-nums">
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
                    className="tiptap text-sm text-gray-700 border border-gray-200 rounded-md p-4 bg-gray-50 min-h-[100px]"
                    dangerouslySetInnerHTML={{
                        __html: feedbackContent || '<p class="text-gray-400">No feedback.</p>',
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
