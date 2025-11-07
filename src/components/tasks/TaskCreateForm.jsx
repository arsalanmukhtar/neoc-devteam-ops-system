import React, { useState, useEffect, useRef } from "react";
import NotificationAlert from "../NotificationAlert";

import { PiHighlighterDuotone } from "react-icons/pi";
import { IoMdClose } from "react-icons/io";

import { Select } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import Blockquote from '@tiptap/extension-blockquote';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';

const baseURL = "http://localhost:3000";

const priorityOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
];

const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
];

const TaskCreateForm = ({ api = "/api/tasks/create", onCreated }) => {
    const [form, setForm] = useState({
        project_id: "",
        title: "",
        description: "",
        assigned_to_id: "",
        priority: "",
        status: "",
        due_date: "",
    });

    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const colorInputRef = useRef();

    // Fetch projects for Select
    useEffect(() => {
        const token = localStorage.getItem("token");
        fetch(baseURL + "/api/projects/list", {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        })
            .then((res) => res.json())
            .then((data) => setProjects(Array.isArray(data) ? data : []));
    }, []);

    // Fetch users for Select
    useEffect(() => {
        const token = localStorage.getItem("token");
        fetch(baseURL + "/api/users/all", {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        })
            .then((res) => res.json())
            .then((data) => setUsers(Array.isArray(data) ? data : []));
    }, []);

    useEffect(() => {
        if (success || error) {
            const timer = setTimeout(() => {
                setSuccess('');
                setError('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [success, error]);

    // TipTap editor for description
    const editor = useEditor({
        extensions: [
            StarterKit,
            // Underline,
            // BulletList,
            // OrderedList,
            // ListItem,
            // Blockquote,
            Color,
            TextStyle,
            Highlight
        ],
        content: "",
        onUpdate: ({ editor }) =>
            setForm((f) => ({ ...f, description: editor.getHTML() })),
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (name, value) => {
        setForm({ ...form, [name]: value });
    };

    const handleDateChange = (name, value) => {
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");
        const token = localStorage.getItem("token");

        try {
            const res = await fetch(baseURL + api, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            const data = await res.json();
            if (res.ok) {
                setSuccess("Task created successfully!");
                setForm({
                    project_id: "",
                    title: "",
                    description: "",
                    assigned_to_id: "",
                    priority: "",
                    status: "",
                    due_date: "",
                });

                if (editor) editor.commands.setContent("");

                if (onCreated) onCreated(data);
            } else {
                setError(data.error || "Creation failed");
            }
        } catch {
            setError("Network error");
        }

        setLoading(false);
    };

    return (
        <form
            className="w-full max-w-2xl mx-auto flex flex-col gap-6 font-sans"
            onSubmit={handleSubmit}
        >
            {/* Project Select */}
            <div className="flex flex-col gap-2">
                <label className="label-style">Project</label>
                <Select
                    placeholder="Select Project"
                    data={projects.map((p) => ({
                        value: p.project_id,
                        label: p.name,
                    }))}
                    value={form.project_id}
                    onChange={(value) => handleSelectChange("project_id", value)}
                    searchable
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

            {/* Title */}
            <div className="flex flex-col gap-2">
                <label className="label-style">Title</label>
                <input
                    type="text"
                    name="title"
                    className="input-border"
                    value={form.title}
                    onChange={handleChange}
                    required
                />
            </div>

            {/* Description Editor */}
            <div className="flex flex-col gap-2">
                <label className="label-style">Description</label>
                {/* Toolbar */}
                <div className="flex gap-3 border border-gray-300 rounded-t-lg p-2 bg-gray-50">
                    <button
                        type="button"
                        onClick={() => editor && editor.chain().focus().toggleBold().run()}
                        disabled={!editor}
                    >
                        <b>B</b>
                    </button>
                    <button
                        type="button"
                        onClick={() => editor && editor.chain().focus().toggleItalic().run()}
                        disabled={!editor}
                    >
                        <i>I</i>
                    </button>
                    <button
                        type="button"
                        onClick={() => editor && editor.chain().focus().toggleUnderline().run()}
                        disabled={!editor}
                    >
                        <u>U</u>
                    </button>
                    <button
                        type="button"
                        onClick={() => editor && editor.chain().focus().toggleBulletList().run()}
                        disabled={!editor}
                    >
                        •
                    </button>
                    <button
                        type="button"
                        onClick={() => editor && editor.chain().focus().toggleOrderedList().run()}
                        disabled={!editor}
                    >
                        1.
                    </button>
                    <button
                        type="button"
                        onClick={() => editor && editor.chain().focus().toggleBlockquote().run()}
                        disabled={!editor}
                    >
                        ❝
                    </button>
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

                {/* Content Box */}
                <div className="sidebar-scroll border border-gray-300 p-3 min-h-[150px] h-96 bg-white overflow-y-auto">
                    <EditorContent editor={editor} className="tiptap" />
                </div>
            </div>

            {/* Assigned User Select */}
            <div className="flex flex-col gap-2">
                <label className="label-style">Assigned To</label>
                <Select
                    placeholder="Select User"
                    data={users.map((u) => ({
                        value: u.user_id,
                        label: `${u.first_name} ${u.last_name}`,
                    }))}
                    value={form.assigned_to_id}
                    onChange={(value) => handleSelectChange("assigned_to_id", value)}
                    searchable
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

            {/* Priority */}
            <div className="flex flex-col gap-2">
                <label className="label-style">Priority</label>
                <Select
                    placeholder="Select Priority"
                    data={priorityOptions}
                    value={form.priority}
                    onChange={(value) => handleSelectChange("priority", value)}
                    searchable
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

            {/* Status */}
            <div className="flex flex-col gap-2">
                <label className="label-style">Status</label>
                <Select
                    placeholder="Select Status"
                    data={statusOptions}
                    value={form.status}
                    onChange={(value) => handleSelectChange("status", value)}
                    searchable
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

            {/* Due Date */}
            <div className="flex flex-col gap-2">
                <label className="label-style">Due Date</label>
                <DatePickerInput
                    placeholder="Due Date"
                    value={form.due_date}
                    onChange={(value) => handleDateChange("due_date", value)}
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

            {/* SUBMIT */}
            <div className="flex justify-end gap-4">
                <button
                    type="button"
                    className="mt-6 bg-red-400 text-white font-semibold py-2 w-40 rounded-full hover:bg-red-500 transition"
                    onClick={() => setForm({
                        project_id: "",
                        title: "",
                        description: "",
                        assigned_to_id: "",
                        priority: "",
                        status: "",
                        due_date: "",
                    })}
                    disabled={loading}
                >
                    Clear Form
                </button>
                <button
                    type="submit"
                    className="mt-6 bg-green-500 text-white font-semibold py-2 w-40 rounded-full hover:bg-green-600 transition"
                    disabled={loading}
                >
                    {loading ? "Creating..." : "Create Task"}
                </button>
            </div>
        </form>
    );
};

export default TaskCreateForm;