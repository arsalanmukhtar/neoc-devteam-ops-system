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
    const [alert, setAlert] = useState(null); // { type, message }

    const [active, setActive] = useState(null); // currently-viewing request
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

    const filtered = useMemo(() => {
        if (!search.trim()) return requests;
        const q = search.toLowerCase();
        return requests.filter(
            (r) =>
                r.task_title?.toLowerCase().includes(q) ||
                `${r.user_first_name} ${r.user_last_name}`.toLowerCase().includes(q)
        );
    }, [requests, search]);

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
            <div className="flex items-center justify-center py-20 text-gray-500 gap-2">
                <Spinner size={16} />
                <span className="text-sm">Loading requests…</span>
            </div>
        );
    }

    return (
        <div>
            <div className="sticky top-0 z-[5] bg-white -mx-8 px-8 -mt-6 pt-6 pb-3 mb-4 border-b border-gray-100">
                <h2 className="text-base font-semibold text-gray-900 mb-3 tracking-tight">
                    Pending Requests
                </h2>
                <Toolbar
                    search={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search by task or requester…"
                    right={
                        <span className="text-xs text-gray-500 tabular-nums">
                            {filtered.length} pending
                        </span>
                    }
                />
            </div>

            {filtered.length === 0 ? (
                <EmptyState
                    icon={LuInbox}
                    title={requests.length === 0 ? 'Inbox is empty' : 'No matches'}
                    description={
                        requests.length === 0
                            ? "You're all caught up — no pending time-entry requests to review."
                            : 'Try a different search term.'
                    }
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map((req) => {
                        const duration = getDurationHours(req.start_time, req.end_time);
                        return (
                            <Card
                                key={req.request_id}
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
                                <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">
                                    {req.task_title}
                                </h3>
                                <div className="flex items-baseline gap-1.5 mb-3">
                                    <span className="text-2xl font-semibold text-gray-900 tabular-nums">
                                        {duration}
                                    </span>
                                    <span className="text-xs text-gray-500">hours</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-3 tabular-nums">
                                    <LuClock size={11} className="text-gray-400" />
                                    {formatDateTime(req.start_time)}
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t border-gray-100 mb-3">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <Avatar
                                            firstName={req.user_first_name}
                                            lastName={req.user_last_name}
                                            size="xs"
                                        />
                                        <span className="text-xs text-gray-600 truncate">
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
                                    <span className="text-sm text-gray-900 truncate">
                                        {active.user_first_name} {active.user_last_name}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <span className="span-label-style">Start Time</span>
                                <div className="mt-1.5 text-sm text-gray-900 tabular-nums">
                                    {formatDateTime(active.start_time)}
                                </div>
                            </div>
                            <div>
                                <span className="span-label-style">End Time</span>
                                <div className="mt-1.5 text-sm text-gray-900 tabular-nums">
                                    {formatDateTime(active.end_time)}
                                </div>
                            </div>
                        </div>

                        <div>
                            <span className="span-label-style">Notes from requester</span>
                            <div
                                className="tiptap mt-1.5 text-sm text-gray-700 max-h-48 overflow-y-auto sidebar-scroll border border-gray-200 rounded-md p-3 bg-gray-50"
                                dangerouslySetInnerHTML={{
                                    __html:
                                        active.notes ||
                                        '<p class="text-gray-400">No notes provided.</p>',
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
                            <p className="text-xs text-gray-500 mt-1.5">
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
