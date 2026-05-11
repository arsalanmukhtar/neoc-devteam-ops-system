import React, { useEffect, useState, useMemo } from 'react';
import { LuInbox, LuCheck, LuX, LuMessageSquare, LuClock } from 'react-icons/lu';
import { formatDateTime } from '@src/utils/dateFormatter';
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
import RichTextEditor from '../ui/RichTextEditor';
import FilterPanel, { FilterGroup } from '../ui/FilterPanel';

const PRIORITY_OPTIONS = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
];

const titleCase = (s) => {
    if (!s) return '';
    return s.replace(/\b\w/g, (c) => c.toUpperCase());
};

const getDurationHours = (start, end) => {
    if (!start || !end) return '0';
    const ms = new Date(end) - new Date(start);
    if (isNaN(ms) || ms < 0) return '0';
    return (ms / (1000 * 60 * 60)).toFixed(2);
};

const RequestListTable = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [priorityFilters, setPriorityFilters] = useState(() => new Set());
    const [alert, setAlert] = useState(null);

    const [active, setActive] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/requests/time-entry?status=pending', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) {
                setRequests(Array.isArray(data) ? data : []);
            } else {
                setAlert({ type: 'error', message: data.error || 'Failed to fetch requests.' });
            }
        } catch {
            setAlert({ type: 'error', message: 'Network error.' });
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const togglePriority = (v) => {
        const next = new Set(priorityFilters);
        if (next.has(v)) next.delete(v);
        else next.add(v);
        setPriorityFilters(next);
    };

    const filtered = useMemo(() => {
        return requests.filter((r) => {
            if (priorityFilters.size > 0 && !priorityFilters.has((r.priority || '').toLowerCase()))
                return false;
            if (search.trim()) {
                const q = search.toLowerCase();
                const hay = `${r.task_title} ${r.user_first_name} ${r.user_last_name}`.toLowerCase();
                if (!hay.includes(q)) return false;
            }
            return true;
        });
    }, [requests, search, priorityFilters]);

    const closeDrawer = () => {
        setActive(null);
        setFeedback('');
    };

    const submitDecision = async (request, approved, reviewComment) => {
        setActionLoading(true);
        const token = localStorage.getItem('token');
        try {
            const endpoint = `/api/requests/time-entry/${request.request_id}/${
                approved ? 'accept' : 'reject'
            }`;
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    review_comment: reviewComment || (approved ? 'Approved' : 'Rejected'),
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setAlert({
                    type: 'success',
                    message: data.message || (approved ? 'Request accepted.' : 'Request rejected.'),
                });
                closeDrawer();
                fetchRequests();
            } else {
                setAlert({
                    type: 'error',
                    message: data.error || 'Failed to submit decision.',
                });
            }
        } catch {
            setAlert({ type: 'error', message: 'Network error.' });
        }
        setActionLoading(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 text-gray-500 dark:text-gray-400 gap-2">
                <Spinner size={16} />
                <span className="text-sm">Loading requests…</span>
            </div>
        );
    }

    const hasActive = priorityFilters.size > 0;

    return (
        <div className="h-full flex flex-col">
            <div className="flex-shrink-0 px-8 pt-6 pb-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
                <div className="flex items-baseline justify-between mb-3 gap-3">
                    <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50 tracking-tight">
                        Pending Requests
                    </h2>
                    <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums flex-shrink-0">
                        {filtered.length} pending
                    </span>
                </div>
                <Toolbar
                    search={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search by task or requester…"
                    filters={
                        <FilterPanel hasActive={hasActive} onClear={() => setPriorityFilters(new Set())}>
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
                    icon={LuInbox}
                    title={requests.length === 0 ? 'Inbox is empty' : 'No matches'}
                    description={
                        requests.length === 0
                            ? "You're all caught up — no pending time-entry requests to review."
                            : 'Try a different search or filter combination.'
                    }
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
                    {filtered.map((req) => {
                        const duration = getDurationHours(req.start_time, req.end_time);
                        return (
                            <Card
                                key={req.request_id}
                                tone="amber"
                                onClick={() => {
                                    setActive(req);
                                    setFeedback('');
                                }}
                            >
                                <div className="flex items-center justify-between mb-3 gap-2">
                                    <StatusPill tone={toneFor(req.priority)}>
                                        {titleCase(req.priority || 'low')}
                                    </StatusPill>
                                    <StatusPill tone="amber">Pending</StatusPill>
                                </div>
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50 mb-1 line-clamp-1">
                                    {req.task_title}
                                </h3>
                                <div className="flex items-baseline gap-1.5 mb-3">
                                    <span className="text-2xl font-semibold text-gray-900 dark:text-gray-50 tabular-nums">
                                        {duration}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">hours</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400 mb-3 tabular-nums">
                                    <LuClock size={11} className="text-gray-400 dark:text-gray-500" />
                                    {formatDateTime(req.start_time)}
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800 mb-3">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <Avatar
                                            firstName={req.user_first_name}
                                            lastName={req.user_last_name}
                                            size="xs"
                                        />
                                        <span className="text-xs text-gray-600 dark:text-gray-300 truncate">
                                            {req.user_first_name} {req.user_last_name}
                                        </span>
                                    </div>
                                </div>
                                <div
                                    className="flex items-center gap-2"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        leftIcon={LuCheck}
                                        className="flex-1"
                                        onClick={() => submitDecision(req, true, 'Approved')}
                                        disabled={actionLoading}
                                    >
                                        Accept
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        leftIcon={LuX}
                                        onClick={() => submitDecision(req, false, 'Rejected')}
                                        disabled={actionLoading}
                                    >
                                        Reject
                                    </Button>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
            </div>

            <Drawer
                open={!!active}
                onClose={closeDrawer}
                title={active?.task_title}
                subtitle={
                    active
                        ? `${active.user_first_name} ${active.user_last_name} · ${getDurationHours(
                              active.start_time,
                              active.end_time
                          )} hours`
                        : ''
                }
                width="lg"
                footer={
                    <>
                        <Button
                            variant="dangerGhost"
                            leftIcon={LuX}
                            onClick={() => submitDecision(active, false, feedback)}
                            loading={actionLoading}
                        >
                            Reject
                        </Button>
                        <div className="flex-1" />
                        <Button variant="secondary" onClick={closeDrawer} disabled={actionLoading}>
                            Cancel
                        </Button>
                        <Button
                            leftIcon={LuCheck}
                            onClick={() => submitDecision(active, true, feedback)}
                            loading={actionLoading}
                        >
                            Accept
                        </Button>
                    </>
                }
            >
                {active && (
                    <div className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="span-label-style">Priority</span>
                                <div className="mt-1.5">
                                    <StatusPill tone={toneFor(active.priority)}>
                                        {titleCase(active.priority || 'low')}
                                    </StatusPill>
                                </div>
                            </div>
                            <div>
                                <span className="span-label-style">Requester</span>
                                <div className="mt-1.5 flex items-center gap-2">
                                    <Avatar
                                        firstName={active.user_first_name}
                                        lastName={active.user_last_name}
                                        size="xs"
                                    />
                                    <span className="text-sm text-gray-900 dark:text-gray-100 truncate">
                                        {active.user_first_name} {active.user_last_name}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <span className="span-label-style">Start Time</span>
                                <div className="mt-1.5 text-sm text-gray-900 dark:text-gray-100 tabular-nums">
                                    {formatDateTime(active.start_time)}
                                </div>
                            </div>
                            <div>
                                <span className="span-label-style">End Time</span>
                                <div className="mt-1.5 text-sm text-gray-900 dark:text-gray-100 tabular-nums">
                                    {formatDateTime(active.end_time)}
                                </div>
                            </div>
                        </div>

                        <div>
                            <span className="span-label-style">Notes from requester</span>
                            <div
                                className="tiptap mt-1.5 text-sm text-gray-700 dark:text-gray-200 max-h-48 overflow-y-auto sidebar-scroll border border-gray-200 dark:border-gray-800 rounded-md p-3 bg-gray-50 dark:bg-gray-950"
                                dangerouslySetInnerHTML={{
                                    __html:
                                        active.notes ||
                                        '<p class="text-gray-400 dark:text-gray-500">No notes provided.</p>',
                                }}
                            />
                        </div>

                        <div>
                            <label className="span-label-style flex items-center gap-1.5">
                                <LuMessageSquare size={11} />
                                Your feedback (optional)
                            </label>
                            <div className="mt-1.5">
                                <RichTextEditor
                                    value={feedback}
                                    onChange={setFeedback}
                                    minHeight="100px"
                                    maxHeight="200px"
                                />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                                Feedback is shared with the requester on accept or reject.
                            </p>
                        </div>
                    </div>
                )}
            </Drawer>

            {alert && (
                <NotificationAlert
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                />
            )}
        </div>
    );
};

export default RequestListTable;
