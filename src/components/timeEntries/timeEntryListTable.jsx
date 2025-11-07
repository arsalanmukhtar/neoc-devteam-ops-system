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

const baseURL = 'http://localhost:3000';

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
    const colorInputRef = useRef();

    useEffect(() => {
        setRoleId(Number(localStorage.getItem("role_id")));
        setUserId(localStorage.getItem("user_id"));
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        let url = baseURL + api;
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
    }, [api, roleId, userId]);

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
                            cursor: 'pointer',
                            fontWeight: 500,
                            transition: 'color 0.2s',
                        }}
                        onClick={() => {
                            setSelectedEntry(row.original);
                            setModalEndTime(row.original.end_time ? new Date(row.original.end_time) : null);
                            setModalNotes(''); // Always empty notes on open
                            setModalOpened(true);
                        }}
                    >
                        {row.original.task_title || '-'}
                    </span>
                ),
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
                Cell: ({ cell }) => {
                    const value = cell.getValue();
                    let display = value;
                    if (value instanceof Date) {
                        display = value.toLocaleString();
                    } else if (typeof value === 'string' && !isNaN(Date.parse(value))) {
                        display = new Date(value).toLocaleString();
                    }
                    return <span>{display || '-'}</span>;
                },
            },
            {
                accessorKey: 'end_time',
                header: 'End Time',
                mantineTableHeadCellProps: { sx: { color: '#2563eb' } },
                Cell: ({ cell }) => {
                    const value = cell.getValue();
                    let display = value;
                    if (value instanceof Date) {
                        display = value.toLocaleString();
                    } else if (typeof value === 'string' && !isNaN(Date.parse(value))) {
                        display = new Date(value).toLocaleString();
                    }
                    return <span>{display || '-'}</span>;
                },
            },
            {
                accessorKey: 'duration',
                header: 'Duration (hr)',
                mantineTableHeadCellProps: { sx: { color: '#2563eb' } },
                Cell: ({ cell }) => <span>{cell.getValue() || '-'}</span>,
            },
            {
                accessorKey: 'created_at',
                header: 'Created At',
                mantineTableHeadCellProps: { sx: { color: '#2563eb' } },
                Cell: ({ cell }) => <span>{cell.getValue() || '-'}</span>,
            },
        ],
        []
    );

    const table = useMantineReactTable({
        columns,
        data: entries,
        enableColumnOrdering: true,
        enablePagination: true,
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

    // Editor for notes in modal (editable, same config as create form)
    const notesEditor = useEditor({
        extensions: [
            StarterKit,
            Color,
            TextStyle,
            Highlight
        ],
        content: modalNotes,
        onUpdate: ({ editor }) => setModalNotes(editor.getHTML()),
    });

    useEffect(() => {
        if (notesEditor && modalOpened) {
            notesEditor.commands.setContent(""); // Always empty notes on open
            setModalNotes("");
        }
        // eslint-disable-next-line
    }, [modalOpened]);

    useEffect(() => {
        if (success || error) {
            const timer = setTimeout(() => {
                setSuccess('');
                setError('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [success, error]);

    // Handle updating the time entry
    const handleUpdateEntry = async () => {
        if (!selectedEntry) return;
        // Check if notes are empty (TipTap empty HTML is <p></p>)
        if (!modalNotes || modalNotes.trim() === "" || modalNotes === "<p></p>") {
            setError("Notes cannot be empty.");
            return;
        }
        setSaveLoading(true);
        setError('');
        setSuccess('');
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${baseURL}/api/time/update/${selectedEntry.entry_id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    task_id: selectedEntry.task_id,
                    start_time: selectedEntry.start_time,
                    end_time: modalEndTime instanceof Date ? modalEndTime.toISOString() : modalEndTime,
                    notes: modalNotes,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setEntries(entries =>
                    entries.map(e =>
                        e.entry_id === selectedEntry.entry_id
                            ? { ...e, end_time: modalEndTime, notes: modalNotes }
                            : e
                    )
                );
                setSuccess('Time entry updated successfully!');
                setModalOpened(false);
            } else {
                setError(data.error || "Update failed");
            }
        } catch {
            setError("Network error");
        }
        setSaveLoading(false);
    };

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
                No time entries found or unauthorized.
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
                className='sidebar-scroll'
            >
                {selectedEntry && (
                    <div className="p-4 bg-white rounded-lg shadow space-y-6">
                        <div className="flex flex-col">
                            <span className="text-xs font-semibold text-gray-400 uppercase mb-1">Task Title</span>
                            <span className="text-lg font-bold text-blue-400">{selectedEntry.task_title || '-'}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-semibold text-gray-400 uppercase mb-1">User</span>
                            <span className="text-base text-gray-700">
                                {selectedEntry.user_first_name && selectedEntry.user_last_name
                                    ? `${selectedEntry.user_first_name} ${selectedEntry.user_last_name}`
                                    : '-'}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-semibold text-gray-400 uppercase mb-1">Start Time</span>
                            <span className="text-base text-gray-700">{selectedEntry.start_time || '-'}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-semibold text-gray-400 uppercase mb-1">End Time</span>
                            <DateTimePicker
                                value={modalEndTime}
                                onChange={setModalEndTime}
                                classNames={{
                                    input: "input-border font-sans",
                                    dropdown: "font-sans",
                                    item: "font-sans",
                                }}
                                radius="xl"
                                size="md"
                                required
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-semibold text-gray-400 uppercase mb-1">Duration (hr)</span>
                            <span className="text-base text-gray-700">{selectedEntry.duration || '-'}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-semibold text-gray-400 uppercase mb-1">Created At</span>
                            <span className="text-base text-gray-700">{selectedEntry.created_at || '-'}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-semibold text-gray-400 uppercase mb-1">Notes</span>
                            {/* Editable TipTap Editor with toolbar */}
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
                            <Button
                                color="green"
                                className="w-40 rounded-full"
                                loading={saveLoading}
                                onClick={handleUpdateEntry}
                            >
                                Update Entry
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
};

export default TimeEntryListTable;