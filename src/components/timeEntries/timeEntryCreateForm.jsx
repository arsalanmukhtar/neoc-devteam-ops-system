import React, { useState, useEffect, useRef } from 'react';
import { Select } from '@mantine/core';
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

const TimeEntryCreateForm = ({ onCreated }) => {
    const [form, setForm] = useState({
        task_id: '',
        start_time: '',
        end_time: '',
        notes: '',
    });
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [roleId, setRoleId] = useState(null);
    const [userId, setUserId] = useState(null);
    const colorInputRef = useRef();

    // Get role_id and user_id from localStorage
    useEffect(() => {
        setRoleId(Number(localStorage.getItem("role_id")));
        setUserId(localStorage.getItem("user_id"));
    }, []);

    // Fetch tasks for dropdown
    useEffect(() => {
        const token = localStorage.getItem("token");
        let url = baseURL + "/api/tasks/list";
        // Only restrict by assigned_to_id if roleId === 3 (Developer)
        if (roleId === 3 && userId) {
            url += `?assigned_to_id=${userId}`;
        }
        fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        })
            .then(res => res.json())
            .then(data => setTasks(Array.isArray(data) ? data : []));
    }, [roleId, userId]);

    // Mantine TipTap Editor for notes
    const editor = useEditor({
        extensions: [
            StarterKit,
            Color,
            TextStyle,
            Highlight
        ],
        content: "",
        onUpdate: ({ editor }) =>
            setForm(f => ({ ...f, notes: editor.getHTML() })),
    });

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (name, value) => {
        setForm({ ...form, [name]: value });
    };

    const handleDateChange = value => {
        setForm({ ...form, start_time: value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${baseURL}/api/requests/time-entry`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...form,
                    start_time: form.start_time instanceof Date ? form.start_time.toISOString() : form.start_time,
                    end_time: form.end_time instanceof Date ? form.end_time.toISOString() : form.end_time,
                })
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess('Time entry request submitted for approval!');
                setForm({
                    task_id: '',
                    start_time: '',
                    end_time: '',
                    notes: '',
                });
                if (editor) editor.commands.setContent("");
                if (onCreated) onCreated(data);
            } else {
                setError(data.error || 'Request submission failed');
            }
        } catch {
            setError('Network error');
        }
        setLoading(false);
    };

    useEffect(() => {
        if (success || error) {
            const timer = setTimeout(() => {
                setSuccess('');
                setError('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [success, error]);

    return (
        <form className="w-full max-w-2xl mx-auto flex flex-col gap-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 w-full">
                {/* Task dropdown full width */}
                <div className="flex flex-col gap-2">
                    <label htmlFor="task_id" className="label-style">Task</label>
                    <Select
                        id="task_id"
                        name="task_id"
                        placeholder="Select Task"
                        data={tasks.map(t => ({
                            value: t.task_id,
                            label: t.title || `Task #${t.task_id}`
                        }))}
                        radius="xl"
                        size="md"
                        value={form.task_id}
                        onChange={value => handleSelectChange("task_id", value)}
                        classNames={{
                            input: 'input-border font-sans',
                            dropdown: 'font-sans',
                            item: 'font-sans'
                        }}
                        required
                    />
                </div>
                {/* Start and End time side by side */}
                <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="start_time" className="label-style">Start Time</label>
                        <DateTimePicker
                            id="start_time"
                            name="start_time"
                            placeholder="Pick start date & time"
                            value={form.start_time}
                            onChange={value => setForm(f => ({ ...f, start_time: value }))}
                            classNames={{
                                input: 'input-border font-sans',
                                dropdown: 'font-sans',
                                item: 'font-sans'
                            }}
                            radius="xl"
                            size="md"
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="end_time" className="label-style">End Time</label>
                        <DateTimePicker
                            id="end_time"
                            name="end_time"
                            placeholder="Pick end date & time"
                            value={form.end_time}
                            onChange={value => setForm(f => ({ ...f, end_time: value }))}
                            classNames={{
                                input: 'input-border font-sans',
                                dropdown: 'font-sans',
                                item: 'font-sans'
                            }}
                            radius="xl"
                            size="md"
                            required
                        />
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <label className="label-style">Notes</label>
                {/* Toolbar */}
                <div className="flex gap-3 border border-gray-300 rounded-t-lg p-2 bg-gray-50">
                    <button type="button" onClick={() => editor && editor.chain().focus().toggleBold().run()} disabled={!editor}><b>B</b></button>
                    <button type="button" onClick={() => editor && editor.chain().focus().toggleItalic().run()} disabled={!editor}><i>I</i></button>
                    <button type="button" onClick={() => editor && editor.chain().focus().toggleUnderline().run()} disabled={!editor}><u>U</u></button>
                    <button type="button" onClick={() => editor && editor.chain().focus().toggleBulletList().run()} disabled={!editor}>•</button>
                    <button type="button" onClick={() => editor && editor.chain().focus().toggleOrderedList().run()} disabled={!editor}>1.</button>
                    <button type="button" onClick={() => editor && editor.chain().focus().toggleBlockquote().run()} disabled={!editor}>❝</button>
                    <button
                        type="button"
                        onClick={() => editor && editor.chain().focus().toggleHighlight().run()}
                        disabled={!editor}
                        title="Highlight"
                        style={{
                            background: editor && editor.isActive('highlight') ? '#ffe066' : 'transparent',
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
                            color={editor && editor.isActive('highlight') ? '#a16207' : '#555'}
                            style={{ transition: 'color 0.2s' }}
                        />
                    </button>
                    <div style={{ position: 'relative', display: 'inline-block', verticalAlign: 'middle' }}>
                        <button
                            type="button"
                            onClick={() => colorInputRef.current && colorInputRef.current.click()}
                            disabled={!editor}
                            title="Pick Color"
                            style={{ padding: 0, border: 'none', background: 'none', marginLeft: '4px', marginRight: '4px' }}
                        >
                            <span
                                style={{
                                    display: 'inline-block',
                                    width: '20px',
                                    height: '20px',
                                    background: editor && editor.getAttributes('textStyle').color ? editor.getAttributes('textStyle').color : '#eee',
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
                                if (editor) {
                                    editor.chain().focus().setColor(e.target.value).run();
                                }
                            }}
                            tabIndex={-1}
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => editor && editor.chain().focus().unsetColor().run()}
                        disabled={!editor}
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
                    <EditorContent editor={editor} className="tiptap" />
                </div>
            </div>
            {/* MESSAGES */}
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
            <div className="flex justify-end gap-4">
                <button
                    type="button"
                    className="mt-6 bg-red-400 text-white font-semibold py-2 px-8 rounded-full hover:bg-red-500 transition"
                    onClick={() => {
                        setForm({
                            task_id: '',
                            start_time: '',
                            notes: '',
                        });
                        if (editor) editor.commands.setContent("");
                    }}
                    disabled={loading}
                >
                    Clear Form
                </button>
                <button
                    type="submit"
                    className="mt-6 bg-green-500 text-white font-semibold py-2 px-8 rounded-full hover:bg-green-600 transition"
                    disabled={loading}
                >
                    {loading ? "Adding Entry..." : "Add Entry"}
                </button>
            </div>
        </form>
    );
};

export default TimeEntryCreateForm;