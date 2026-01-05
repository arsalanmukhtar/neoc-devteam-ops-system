import React, { useEffect, useState, useMemo, useRef } from 'react';
import { MantineReactTable, useMantineReactTable } from 'mantine-react-table';
import { Modal, Button } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import NotificationAlert from "../NotificationAlert";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import { PiHighlighterDuotone } from "react-icons/pi";
import { IoMdClose } from "react-icons/io";
import { formatDateTime } from '../../utils/dateFormatter';

// const baseURL = 'http://localhost:3000';

const priorityColors = {
    low: "#60a5fa",      // blue
    medium: "#eca900",   // yellow
    high: "#ef4444"      // red
};

const statusColors = {
    pending: { bg: "#fffbeb", text: "#78350f" },    // very light amber
    accepted: { bg: "#f0fdf4", text: "#14532d" },   // very light green
    rejected: { bg: "#fef2f2", text: "#7f1d1d" }    // very light red
};

const TimeEntryListTable = ({ api = "/api/time/list" }) => {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpened, setModalOpened] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [roleId, setRoleId] = useState(null);
    const [userId, setUserId] = useState(null);
    const [modalEndTime, setModalEndTime] = useState(null);
    const [modalNotes, setModalNotes] = useState('');
    const [saveLoading, setSaveLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [feedbackModalOpened, setFeedbackModalOpened] = useState(false);
    const [feedbackModalContent, setFeedbackModalContent] = useState('');
    const colorInputRef = useRef();

    useEffect(() => {
        setRoleId(Number(localStorage.getItem("role_id")));
        setUserId(localStorage.getItem("user_id"));
    }, []);

    const fetchEntries = () => {
        const token = localStorage.getItem('token');
        let url = api;
        if (roleId === 3 && userId) {
            url += `?user_id=${userId}`;
        }
        fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
            .then(res => res.json())
            .then(data => {
                setEntries(Array.isArray(data) ? data : []);
                setLoading(false);
            });
    };

    useEffect(() => {
        if (roleId !== null && userId !== null) {
            fetchEntries();
        }
        // eslint-disable-next-line
    }, [api, roleId, userId]);

    // Only allow editing if the current user is the creator (roleId === 3 and userId matches entry.user_id)
    const canEditEntry = (entry) => {
        if (!entry) return false;
        return roleId === 3 && String(userId) === String(entry.user_id);
    };

    const notesEditor = useEditor({
        extensions: [StarterKit, Color, TextStyle, Highlight],
        content: modalNotes,
        onUpdate: ({ editor }) => setModalNotes(editor.getHTML())
    });

    const handleUpdateEntry = async () => {
        if (!selectedEntry || !canEditEntry(selectedEntry)) return;
        setSaveLoading(true);
        setError('');
        setSuccess('');

        const token = localStorage.getItem('token');

        // For role_id 3, create a request instead of direct update
        const payload = {
            entry_id: selectedEntry.entry_id, // Include entry_id to indicate this is an update
            task_id: selectedEntry.task_id,
            start_time: selectedEntry.start_time,
            end_time: modalEndTime ? modalEndTime.toISOString() : selectedEntry.end_time,
            notes: modalNotes || selectedEntry.notes,
            priority: selectedEntry.priority
        };

        try {
            // Role_id 3 always goes through requests table
            const res = await fetch(`/api/requests/time-entry`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess('Update request submitted for approval!');
                setTimeout(() => {
                    setModalOpened(false);
                    fetchEntries();
                }, 1500);
            } else {
                setError(data.error || 'Update failed');
            }
        } catch {
            setError('Network error');
        }
        setSaveLoading(false);
    };

    const columns = useMemo(
        () => [
            {
                accessorKey: 'task_title',
                header: 'Task Title',
                mantineTableHeadCellProps: { sx: { color: '#2563eb' } },
                Cell: ({ row }) => (
                    <span
                        style={{
                            color: '#2563eb',
                            cursor: canEditEntry(row.original) ? 'pointer' : 'not-allowed',
                            fontWeight: 500,
                            transition: 'color 0.2s',
                            opacity: canEditEntry(row.original) ? 1 : 0.5
                        }}
                        onClick={() => {
                            if (canEditEntry(row.original)) {
                                setSelectedEntry(row.original);
                                setModalEndTime(row.original.end_time ? new Date(row.original.end_time) : null);
                                setModalNotes(row.original.notes || '');
                                if (notesEditor) {
                                    notesEditor.commands.setContent(row.original.notes || '');
                                }
                                setModalOpened(true);
                            }
                        }}
                    >
                        {row.original.task_title || '-'}
                    </span>
                ),
            },
            {
                accessorKey: 'priority',
                header: 'Priority',
                mantineTableHeadCellProps: { sx: { color: '#2563eb' } },
                Cell: ({ cell }) => {
                    const value = cell.getValue();
                    const color = priorityColors[value?.toLowerCase()] || "#aaa";
                    const label = value ? value.charAt(0).toUpperCase() + value.slice(1) : "-";
                    return (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{
                                display: 'inline-block',
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                background: color,
                                marginRight: '6px',
                                border: '1px solid #ccc'
                            }} />
                            <span style={{ color, fontWeight: 500 }}>{label}</span>
                        </span>
                    );
                }
            },
            {
                accessorKey: 'status',
                header: 'Status',
                mantineTableHeadCellProps: { sx: { color: '#2563eb' } },
                Cell: ({ cell }) => {
                    const value = cell.getValue() || 'pending';
                    const colors = statusColors[value.toLowerCase()] || statusColors.pending;
                    const label = value.charAt(0).toUpperCase() + value.slice(1);
                    return (
                        <span style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            borderRadius: '12px',
                            background: colors.bg,
                            color: colors.text,
                            fontWeight: 600,
                            fontSize: '0.875rem'
                        }}>
                            {label}
                        </span>
                    );
                }
            },
            {
                accessorKey: 'user_name',
                header: 'User',
                mantineTableHeadCellProps: { sx: { color: '#2563eb' } },
                Cell: ({ row }) => (
                    <span className="text-base text-gray-700">
                        {row.original.user_first_name && row.original.user_last_name
                            ? `${row.original.user_first_name} ${row.original.user_last_name}`
                            : '-'}
                    </span>
                ),
            },
            {
                accessorKey: 'start_time',
                header: 'Start Time',
                mantineTableHeadCellProps: { sx: { color: '#2563eb' } },
                Cell: ({ cell }) => <span>{formatDateTime(cell.getValue())}</span>,
            },
            {
                accessorKey: 'end_time',
                header: 'End Time',
                mantineTableHeadCellProps: { sx: { color: '#2563eb' } },
                Cell: ({ cell }) => <span>{formatDateTime(cell.getValue())}</span>,
            },
            {
                accessorKey: 'duration',
                header: 'Duration (hrs)',
                mantineTableHeadCellProps: { sx: { color: '#2563eb' } },
                Cell: ({ cell }) => {
                    const value = cell.getValue();
                    return <span>{value ? Number(value).toFixed(2) : '-'}</span>;
                },
            },
            {
                accessorKey: 'feedback',
                header: 'Feedback',
                mantineTableHeadCellProps: { sx: { color: '#2563eb' } },
                Cell: ({ cell, row }) => {
                    const feedback = cell.getValue();
                    return (
                        <div
                            style={{
                                maxWidth: "200px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                cursor: feedback ? "pointer" : "default",
                                color: feedback ? "#2563eb" : "#888",
                                fontWeight: feedback ? 500 : 400,
                                transition: "color 0.2s"
                            }}
                            title={feedback ? "Click to view full feedback" : "No feedback"}
                            onClick={() => {
                                if (feedback) {
                                    setFeedbackModalContent(feedback);
                                    setFeedbackModalOpened(true);
                                }
                            }}
                        >
                            <div
                                style={{
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    maxWidth: "190px"
                                }}
                                dangerouslySetInnerHTML={{ __html: feedback || "-" }}
                            />
                        </div>
                    );
                }
            },
        ],
        [roleId, userId, notesEditor]
    );

    const table = useMantineReactTable({
        columns,
        data: entries,
        enableColumnOrdering: true,
        enablePagination: true,
        mantineTableProps: {
            striped: false,
            highlightOnHover: true,
            withColumnBorders: true,
            style: { background: '#f8fafc', borderRadius: '8px' },
        },
        mantineTableBodyRowProps: ({ row }) => {
            const status = row.original.status?.toLowerCase() || 'pending';
            const colors = statusColors[status] || statusColors.pending;
            return {
                style: {
                    background: colors.bg,
                    transition: 'background 0.2s',
                },
            };
        },
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

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '8px' }}>
                Loading...
            </div>
        );
    }

    if (!entries.length) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#e53e3e', background: '#f8fafc', borderRadius: '8px' }}>
                No time entries found.
            </div>
        );
    }

    return (
        <>
            <MantineReactTable table={table} />
            <Modal
                opened={modalOpened}
                onClose={() => setModalOpened(false)}
                title={
                    <div className="text-lg font-bold text-blue-400 flex items-center gap-2">
                        <span className='text-stone-700 text-2xl'>Time Entry Details</span>
                    </div>
                }
                centered
                size="lg"
                overlayProps={{ blur: 4 }}
            >
                {selectedEntry && (
                    <div className="p-4 bg-white rounded-lg shadow space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-400 uppercase mb-1">Task</span>
                                <span className="text-base text-gray-700">{selectedEntry.task_title || '-'}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-400 uppercase mb-1">Priority</span>
                                <span style={{
                                    color: priorityColors[selectedEntry.priority?.toLowerCase()] || "#aaa",
                                    fontWeight: 600
                                }}>
                                    {selectedEntry.priority ? selectedEntry.priority.charAt(0).toUpperCase() + selectedEntry.priority.slice(1) : '-'}
                                </span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-400 uppercase mb-1">Status</span>
                                <span style={{
                                    display: 'inline-block',
                                    padding: '4px 12px',
                                    borderRadius: '12px',
                                    background: statusColors[selectedEntry.status?.toLowerCase()]?.bg || statusColors.pending.bg,
                                    color: statusColors[selectedEntry.status?.toLowerCase()]?.text || statusColors.pending.text,
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    width: 'fit-content'
                                }}>
                                    {selectedEntry.status ? selectedEntry.status.charAt(0).toUpperCase() + selectedEntry.status.slice(1) : 'Pending'}
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-400 uppercase mb-1">User</span>
                                <span className="text-base text-gray-700">
                                    {selectedEntry.user_first_name && selectedEntry.user_last_name
                                        ? `${selectedEntry.user_first_name} ${selectedEntry.user_last_name}`
                                        : '-'}
                                </span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-400 uppercase mb-1">Start Time</span>
                                <span className="text-base text-gray-700">{formatDateTime(selectedEntry.start_time)}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-400 uppercase mb-1">End Time</span>
                                {canEditEntry(selectedEntry) ? (
                                    <DateTimePicker
                                        value={modalEndTime}
                                        onChange={setModalEndTime}
                                        placeholder="Pick end time"
                                        classNames={{
                                            input: 'input-border font-sans',
                                            dropdown: 'font-sans',
                                        }}
                                        radius="xl"
                                        size="xs"
                                    />
                                ) : (
                                    <span className="text-base text-gray-700">{formatDateTime(selectedEntry.end_time)}</span>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-400 uppercase mb-1">Duration (hrs)</span>
                                <span className="text-base text-gray-700">{selectedEntry.duration || '-'}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-400 uppercase mb-1">Created At</span>
                                <span className="text-base text-gray-700">{formatDateTime(selectedEntry.created_at)}</span>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-semibold text-gray-400 uppercase mb-1">Notes</span>
                            {canEditEntry(selectedEntry) ? (
                                <>
                                    <div className="flex gap-3 border border-gray-300 rounded-t-lg p-2 bg-gray-50">
                                        <button type="button" onClick={() => notesEditor && notesEditor.chain().focus().toggleBold().run()} disabled={!notesEditor}><b>B</b></button>
                                        <button type="button" onClick={() => notesEditor && notesEditor.chain().focus().toggleItalic().run()} disabled={!notesEditor}><i>I</i></button>
                                        <button type="button" onClick={() => notesEditor && notesEditor.chain().focus().toggleUnderline().run()} disabled={!notesEditor}><u>U</u></button>
                                        <button type="button" onClick={() => notesEditor && notesEditor.chain().focus().toggleBulletList().run()} disabled={!notesEditor}>•</button>
                                        <button type="button" onClick={() => notesEditor && notesEditor.chain().focus().toggleOrderedList().run()} disabled={!notesEditor}>1.</button>
                                        <button type="button" onClick={() => notesEditor && notesEditor.chain().focus().toggleBlockquote().run()} disabled={!notesEditor}>❝</button>
                                        <button
                                            type="button"
                                            onClick={() => notesEditor && notesEditor.chain().focus().toggleHighlight().run()}
                                            disabled={!notesEditor}
                                            title="Highlight"
                                            style={{
                                                background: notesEditor && notesEditor.isActive('highlight') ? '#ffe066' : 'transparent',
                                                borderRadius: '4px',
                                                padding: '4px',
                                                transition: 'background 0.2s',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <PiHighlighterDuotone
                                                size={18}
                                                color={notesEditor && notesEditor.isActive('highlight') ? '#a16207' : '#555'}
                                                style={{ transition: 'color 0.2s' }}
                                            />
                                        </button>
                                        <div style={{ position: 'relative', display: 'inline-block', verticalAlign: 'middle' }}>
                                            <button
                                                type="button"
                                                onClick={() => colorInputRef.current && colorInputRef.current.click()}
                                                disabled={!notesEditor}
                                                title="Pick Color"
                                                style={{ padding: 0, border: 'none', background: 'none', marginLeft: '4px', marginRight: '4px' }}
                                            >
                                                <span
                                                    style={{
                                                        display: 'inline-block',
                                                        width: '20px',
                                                        height: '20px',
                                                        background: notesEditor && notesEditor.getAttributes('textStyle').color ? notesEditor.getAttributes('textStyle').color : '#eee',
                                                        border: '1px solid #ccc',
                                                        borderRadius: '4px',
                                                        verticalAlign: 'middle',
                                                        marginRight: '2px',
                                                        transition: 'background 0.2s'
                                                    }}
                                                />
                                            </button>
                                            <input
                                                type="color"
                                                ref={colorInputRef}
                                                style={{
                                                    display: 'block',
                                                    position: 'absolute',
                                                    left: 0,
                                                    top: '100%',
                                                    zIndex: 10,
                                                    marginTop: '2x',
                                                    border: 'none',
                                                    background: 'transparent',
                                                    padding: 0,
                                                    width: '20px',
                                                    height: '20px',
                                                    cursor: 'pointer',
                                                    opacity: 0
                                                }}
                                                onChange={e => {
                                                    if (notesEditor) {
                                                        notesEditor.chain().focus().setColor(e.target.value).run();
                                                    }
                                                }}
                                                tabIndex={-1}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => notesEditor && notesEditor.chain().focus().unsetColor().run()}
                                            disabled={!notesEditor}
                                            title="Remove Color"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                padding: '2px',
                                                borderRadius: '4px',
                                                background: 'transparent',
                                                transition: 'background 0.2s'
                                            }}
                                        >
                                            <IoMdClose size={18} color="#555" />
                                        </button>
                                    </div>
                                    <div className="sidebar-scroll border border-gray-300 p-3 min-h-[100px] h-48 bg-white overflow-y-auto">
                                        <EditorContent editor={notesEditor} className="tiptap" />
                                    </div>
                                </>
                            ) : (
                                <div
                                    className="tiptap border border-gray-200 rounded p-3 bg-gray-50 text-gray-700"
                                    dangerouslySetInnerHTML={{ __html: selectedEntry.notes || '-' }}
                                />
                            )}
                        </div>
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
                        <div className="flex justify-end gap-4 mt-8">
                            <Button
                                color="gray"
                                variant="outline"
                                className="w-40 rounded-full"
                                onClick={() => setModalOpened(false)}
                                disabled={saveLoading}
                            >
                                Cancel
                            </Button>
                            {canEditEntry(selectedEntry) && (
                                <Button
                                    color="green"
                                    className="w-40 rounded-full"
                                    loading={saveLoading}
                                    onClick={handleUpdateEntry}
                                >
                                    Submit Update
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            {/* Feedback Modal */}
            <Modal
                opened={feedbackModalOpened}
                onClose={() => setFeedbackModalOpened(false)}
                title={
                    <div className="text-lg font-bold text-blue-400 flex items-center gap-2">
                        <span className='text-stone-700 text-2xl'>Reviewer Feedback</span>
                    </div>
                }
                centered
                size="lg"
                overlayProps={{ blur: 4 }}
                className='sidebar-scroll'
            >
                <div className="p-4 bg-white rounded-lg">
                    <div
                        className="
                            tiptap
                            border border-gray-200
                            rounded
                            p-4
                            bg-gray-50
                            text-gray-700
                            h-40
                            overflow-y-auto
                            sidebar-scroll
                        "
                        dangerouslySetInnerHTML={{
                            __html: feedbackModalContent || "No feedback provided.",
                        }}
                    />
                </div>
            </Modal>
        </>
    );
};

export default TimeEntryListTable;