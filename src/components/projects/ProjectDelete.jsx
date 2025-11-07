import React, { useState, useEffect } from "react";
import { Select, Modal } from "@mantine/core";
import NotificationAlert from "../NotificationAlert";

const baseURL = "http://localhost:3000";

const ProjectDelete = ({ api = "/api/projects/delete" }) => {
    const [projects, setProjects] = useState([]);
    const [selectedId, setSelectedId] = useState('');
    const [selectedProject, setSelectedProject] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [modalOpened, setModalOpened] = useState(false);

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

    useEffect(() => {
        if (success || error) {
            const timer = setTimeout(() => {
                setSuccess('');
                setError('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [success, error]);

    useEffect(() => {
        if (selectedId) {
            const project = projects.find(p => p.project_id === selectedId);
            setSelectedProject(project || null);
            setModalOpened(!!project);
        } else {
            setSelectedProject(null);
            setModalOpened(false);
        }
    }, [selectedId, projects]);

    const handleDelete = async (e) => {
        e.preventDefault();
        if (!selectedId) return;
        setLoading(true);
        setError('');
        setSuccess('');
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${baseURL}${api}/${selectedId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess("Project deleted successfully!");
                setProjects(projects.filter(p => p.project_id !== selectedId));
                setSelectedId('');
                setModalOpened(false);
            } else {
                setError(data.error || "Delete failed");
            }
        } catch {
            setError("Network error");
        }
        setLoading(false);
    };

    return (
        <div className="w-full flex flex-col items-center font-sans">
            <div className="mb-4 w-full max-w-2xl">
                <label htmlFor="projectDeleteSelect" className="block font-medium text-stone-700 mb-2 text-center">Select Project to Delete</label>
                <Select
                    id="projectDeleteSelect"
                    name="projectDeleteSelect"
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
            <Modal
                opened={modalOpened}
                onClose={() => setModalOpened(false)}
                title={
                    <div className="text-lg font-bold text-red-500 flex items-center gap-2">
                        <span className='text-stone-700 text-2xl'>Delete Project</span>
                    </div>
                }
                centered
                size="lg"
                overlayProps={{ blur: 4 }}
            >
                {selectedProject && (
                    <div className="p-4 bg-white rounded-lg shadow space-y-6">
                        {/* Project Name */}
                        <div className="flex flex-col">
                            <span className="text-xs font-semibold text-gray-400 uppercase mb-1">Project Name</span>
                            <span className="text-lg font-bold text-blue-400">{selectedProject.name}</span>
                        </div>
                        {/* Description */}
                        <div className="sidebar-scroll flex flex-col h-96 overflow-y-auto">
                            <span className="text-xs font-semibold text-gray-400 uppercase mb-1">Description</span>
                            <div
                                className="tiptap border border-gray-200 rounded p-3 bg-gray-50 text-gray-700"
                                dangerouslySetInnerHTML={{ __html: selectedProject.description }}
                            />
                        </div>
                        {/* Manager */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-400 uppercase mb-1">Manager</span>
                                <span className="text-base text-gray-700">{selectedProject.manager_first_name} {selectedProject.manager_last_name}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-400 uppercase mb-1">Status</span>
                                <span className={`text-base font-semibold ${selectedProject.status === 'active' ? 'text-green-600' : selectedProject.status === 'completed' ? 'text-blue-600' : 'text-red-500'}`}>
                                    {selectedProject.status.charAt(0).toUpperCase() + selectedProject.status.slice(1)}
                                </span>
                            </div>
                        </div>
                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-400 uppercase mb-1">Start Date</span>
                                <span className="text-base text-gray-700">{selectedProject.start_date}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-400 uppercase mb-1">Due Date</span>
                                <span className="text-base text-gray-700">{selectedProject.due_date}</span>
                            </div>
                        </div>
                        {/* Confirm Delete */}
                        <form onSubmit={handleDelete}>
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
                            <div className="flex justify-end gap-4 mt-6">
                                <button
                                    type="button"
                                    className="bg-gray-300 text-gray-700 font-semibold py-2 w-40 rounded-full hover:bg-gray-400 transition"
                                    onClick={() => { setSelectedId(''); setModalOpened(false); }}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-red-500 text-white font-semibold py-2 w-40 rounded-full hover:bg-red-600 transition"
                                    disabled={loading}
                                >
                                    {loading ? "Deleting..." : "Delete Project"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ProjectDelete;