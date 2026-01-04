import React, { useState, useEffect, useRef } from "react";

import { PiHighlighterDuotone } from "react-icons/pi";
import { IoMdClose } from "react-icons/io";

import { Select } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useEditor, EditorContent } from "@tiptap/react";
import Underline from "@tiptap/extension-underline";
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import Blockquote from '@tiptap/extension-blockquote';
import StarterKit from "@tiptap/starter-kit";
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';

import NotificationAlert from "../NotificationAlert";

// const baseURL = "http://localhost:3000";

// Status mapping and colors
const statusOptions = {
    active: { label: 'Active', color: '#2563eb' },        // blue
    inactive: { label: 'Inactive', color: '#ef4444' },    // red
    in_progress: { label: 'In Progress', color: '#f59e0b' }, // amber
    planning: { label: 'Planning', color: '#06b6d4' },    // cyan
    completed: { label: 'Completed', color: '#22c55e' },  // green
};

// Convert statusOptions to array for Select
const statusSelectOptions = Object.entries(statusOptions).map(([value, { label }]) => ({
    value,
    label,
}));

const StatusItem = React.forwardRef(({ value, label, ...others }, ref) => (
    <div ref={ref} {...others} style={{ color: statusOptions[value]?.color }}>
        {label}
    </div>
));

const ProjectDetailsUpdate = ({ api }) => {
    const [projects, setProjects] = useState([]);
    const [selectedId, setSelectedId] = useState('');
    const [form, setForm] = useState({
        name: "",
        description: "",
        manager_id: "",
        status: "",
        start_date: "",
        due_date: "",
    });
    const [managers, setManagers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const colorInputRef = useRef();

    useEffect(() => {
        const token = localStorage.getItem("token");
        fetch("/api/projects/list", {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        })
            .then((res) => res.json())
            .then((data) => setProjects(Array.isArray(data) ? data : []));
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("token");
        fetch("/api/users/all", {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        })
            .then((res) => res.json())
            .then((data) => {
                const projectManagers = Array.isArray(data)
                    ? data.filter((user) => user.role_id === 2)
                    : [];
                setManagers(projectManagers);
            });
    }, []);

    useEffect(() => {
        if (selectedId) {
            const token = localStorage.getItem("token");
            fetch(`/api/projects/view/${selectedId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            })
                .then((res) => res.json())
                .then((data) => {
                    setForm({
                        name: data.name || "",
                        description: data.description || "",
                        manager_id: data.manager_id || "",
                        status: data.status || "",
                        start_date: data.start_date ? new Date(data.start_date) : null,
                        due_date: data.due_date ? new Date(data.due_date) : null,
                    });
                    if (editor) editor.commands.setContent(data.description || "");
                });
        }
        // eslint-disable-next-line
    }, [selectedId]);

    useEffect(() => {
        if (success || error) {
            const timer = setTimeout(() => {
                setSuccess('');
                setError('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [success, error]);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Color,
            TextStyle,
            Highlight,
        ],
        content: form.description,
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
        setError('');
        setSuccess('');

        // Date validation
        if (form.start_date && form.due_date && form.start_date >= form.due_date) {
            setError("End date must be greater than start date");
            setLoading(false);
            return;
        }

        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${api}/${selectedId}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...form,
                    start_date: form.start_date ? form.start_date.toISOString().slice(0, 10) : "",
                    due_date: form.due_date ? form.due_date.toISOString().slice(0, 10) : "",
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess("Project updated successfully!");
            } else {
                setError(data.error || "Update failed");
            }
        } catch {
            setError("Network error");
        }
        setLoading(false);
    };

    return (
        <div className="w-full flex flex-col items-center font-sans">
            <div className="mb-4 w-full max-w-2xl">
                <label htmlFor="projectSelect" className="block font-medium text-stone-700 mb-2 text-center">Select Project</label>
                <Select
                    id="projectSelect"
                    name="projectSelect"
                    placeholder="Choose a project"
                    data={
                        projects.map(project => ({
                            value: project.project_id,
                            label: project.name
                        }))
                    }
                    radius="xl"
                    size="md"
                    value={selectedId}
                    onChange={value => setSelectedId(value)}
                    searchable
                    classNames={{
                        input: 'input-border font-sans',
                        dropdown: 'font-sans',
                        item: 'font-sans'
                    }}
                    styles={{
                        input: { width: '100%' }
                    }}
                    required
                />
            </div>

            {selectedId && (
                <form className="w-full max-w-2xl flex flex-col gap-6" onSubmit={handleSubmit}>
                    {/* PROJECT NAME */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="name" className="label-style">
                            Project Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            className="input-border"
                            required
                            value={form.name}
                            onChange={handleChange}
                        />
                    </div>

                    {/* DESCRIPTION (TipTap Editor) */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="description" className="label-style">
                            Description
                        </label>
                        <div
                            className="flex flex-wrap gap-2 mb-2 border border-gray-300 p-2 bg-gray-50"
                            style={{ borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}
                        >
                            <button
                                type="button"
                                onClick={() => editor && editor.chain().focus().toggleBold().run()}
                                disabled={!editor}
                                className={`px-2 py-1 border rounded ${editor && editor.isActive('bold') ? 'bg-stone-300' : 'bg-white'
                                    }`}
                                title="Bold"
                            >
                                <strong>B</strong>
                            </button>
                            <button
                                type="button"
                                onClick={() => editor && editor.chain().focus().toggleItalic().run()}
                                disabled={!editor}
                                className={`px-2 py-1 border rounded ${editor && editor.isActive('italic') ? 'bg-stone-300' : 'bg-white'
                                    }`}
                                title="Italic"
                            >
                                <em>I</em>
                            </button>
                            <button
                                type="button"
                                onClick={() => editor && editor.chain().focus().toggleStrike().run()}
                                disabled={!editor}
                                className={`px-2 py-1 border rounded ${editor && editor.isActive('strike') ? 'bg-stone-300' : 'bg-white'
                                    }`}
                                title="Strikethrough"
                            >
                                <s>S</s>
                            </button>
                            <button
                                type="button"
                                onClick={() => editor && editor.chain().focus().toggleUnderline().run()}
                                disabled={!editor}
                                className={`px-2 py-1 border rounded ${editor && editor.isActive('underline') ? 'bg-stone-300' : 'bg-white'
                                    }`}
                                title="Underline"
                            >
                                <u>U</u>
                            </button>
                            <button
                                type="button"
                                onClick={() => editor && editor.chain().focus().toggleBulletList().run()}
                                disabled={!editor}
                                className={`px-2 py-1 border rounded ${editor && editor.isActive('bulletList') ? 'bg-stone-300' : 'bg-white'
                                    }`}
                                title="Bullet List"
                            >
                                •
                            </button>
                            <button
                                type="button"
                                onClick={() => editor && editor.chain().focus().toggleOrderedList().run()}
                                disabled={!editor}
                                className={`px-2 py-1 border rounded ${editor && editor.isActive('orderedList') ? 'bg-stone-300' : 'bg-white'
                                    }`}
                                title="Ordered List"
                            >
                                1.
                            </button>
                            <button
                                type="button"
                                onClick={() => editor && editor.chain().focus().toggleBlockquote().run()}
                                disabled={!editor}
                                className={`px-2 py-1 border rounded ${editor && editor.isActive('blockquote') ? 'bg-stone-300' : 'bg-white'
                                    }`}
                                title="Blockquote"
                            >
                                "
                            </button>
                            <div
                                style={{
                                    position: 'relative',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '2px'
                                }}
                            >
                                <button
                                    type="button"
                                    disabled={!editor}
                                    onClick={() => colorInputRef.current && colorInputRef.current.click()}
                                    title="Text Color"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '4px 8px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        background: '#fff',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s'
                                    }}
                                >
                                    <PiHighlighterDuotone size={18} color="#555" />
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
                        <div className="sidebar-scroll border border-gray-300 p-3 min-h-[150px] h-96 bg-white overflow-y-auto">
                            <EditorContent editor={editor} className="tiptap" />
                        </div>
                    </div>

                    {/* MANAGER */}
                    <div className="flex flex-col gap-2">
                        <label className="label-style">Manager</label>
                        <Select
                            placeholder="Select Manager"
                            data={managers.map((m) => ({
                                value: m.user_id,
                                label: `${m.first_name} ${m.last_name}`,
                            }))}
                            value={form.manager_id}
                            onChange={(value) => handleSelectChange("manager_id", value)}
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

                    {/* STATUS */}
                    <div className="flex flex-col gap-2">
                        <label className="label-style">Status</label>
                        <Select
                            placeholder="Select Status"
                            data={statusSelectOptions}
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
                            itemComponent={StatusItem}
                            styles={{
                                input: {
                                    color: form.status ? statusOptions[form.status]?.color : undefined
                                }
                            }}
                        />
                    </div>

                    {/* DATES SIDE BY SIDE */}
                    <div className="flex gap-4 w-full">
                        <div className="flex flex-col w-1/2">
                            <label className="label-style">Start Date</label>
                            <DatePickerInput
                                placeholder="Start Date"
                                value={form.start_date}
                                onChange={(value) => handleDateChange("start_date", value)}
                                classNames={{
                                    input: 'input-border font-sans',
                                    dropdown: 'font-sans',
                                    item: 'font-sans'
                                }}
                                radius="xl"
                                size="xs"
                                required
                            />
                        </div>
                        <div className="flex flex-col w-1/2">
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
                                size="xs"
                                required
                            />
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

                    {/* SUBMIT */}
                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            className="mt-6 bg-red-400 text-white font-semibold py-2 px-8 rounded-full hover:bg-red-500 transition"
                            onClick={() => setForm({
                                name: "",
                                description: "",
                                manager_id: "",
                                status: "",
                                start_date: "",
                                due_date: "",
                            })}
                            disabled={loading}
                        >
                            Clear Form
                        </button>
                        <button
                            type="submit"
                            className="mt-6 bg-green-500 text-white font-semibold py-2 px-8 rounded-full hover:bg-green-600 transition"
                            radius="xl"
                            size="md"
                            loading={loading}
                        >
                            {loading ? "Updating..." : "Update Project"}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default ProjectDetailsUpdate;