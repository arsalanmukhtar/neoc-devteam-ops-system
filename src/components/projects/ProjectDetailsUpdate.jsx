import React, { useState, useEffect } from "react";
import { Select, Button } from "@mantine/core";
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

const baseURL = "http://localhost:3000";

const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "completed", label: "Completed" },
];

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

    // Fetch all projects for selection
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

    // Fetch managers for dropdown
    useEffect(() => {
        const token = localStorage.getItem("token");
        fetch(baseURL + "/api/users/all", {
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

    // Fetch selected project details
    useEffect(() => {
        if (selectedId) {
            const token = localStorage.getItem("token");
            fetch(`${baseURL}/api/projects/view/${selectedId}`, {
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

    // TipTap editor for description
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            BulletList,
            OrderedList,
            ListItem,
            Blockquote,
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
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${baseURL}${api}/${selectedId}`, {
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
                <form
                    className="w-full max-w-2xl mx-auto flex flex-col gap-6 font-sans"
                    onSubmit={handleSubmit}
                >
                    {/* PROJECT NAME */}
                    <div className="flex flex-col gap-2">
                        <label className="label-style">Project Name</label>
                        <input
                            type="text"
                            name="name"
                            className="border border-gray-300 rounded-full px-4 py-2"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* DESCRIPTION */}
                    <div className="flex flex-col gap-2">
                        <label className="label-style">Description</label>
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
                            >
                                <span style={{ background: '#ffe066', padding: '0 4px', borderRadius: '2px' }}>H</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => editor && editor.chain().focus().setColor('#e53e3e').run()}
                                disabled={!editor}
                                title="Red"
                            >
                                <span style={{ color: '#e53e3e' }}>A</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => editor && editor.chain().focus().setColor('#2563eb').run()}
                                disabled={!editor}
                                title="Blue"
                            >
                                <span style={{ color: '#2563eb' }}>A</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => editor && editor.chain().focus().setColor('#16a34a').run()}
                                disabled={!editor}
                                title="Green"
                            >
                                <span style={{ color: '#16a34a' }}>A</span>
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
                            data={statusOptions}
                            value={form.status}
                            onChange={(value) => handleSelectChange("status", value)}
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
                    {error && <div className="text-red-500">{error}</div>}
                    {success && <div className="text-green-600">{success}</div>}

                    {/* SUBMIT */}
                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            className="mt-6 bg-green-500 text-white font-semibold py-2 px-8 rounded-full hover:bg-green-600 transition"
                            radius="xl"
                            size="md"
                            loading={loading}
                        >
                            {loading ? "Updating..." : "Update Project"}
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default ProjectDetailsUpdate;