import React, { useState, useEffect, useMemo } from 'react';
import { LuTriangleAlert } from 'react-icons/lu';
import { formatDate } from '@src/utils/dateFormatter';
import NotificationAlert from '../NotificationAlert';
import Button from '../ui/Button';
import Field, { Select } from '../ui/Field';
import StatusPill from '../ui/StatusPill';
import { toneFor } from '../ui/statusTone';

const stripHtml = (html) => {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return (tmp.textContent || tmp.innerText || '').trim();
};

const statusLabel = (status) => {
    if (!status) return '—';
    const s = String(status).toLowerCase().replace('_', ' ');
    return s.charAt(0).toUpperCase() + s.slice(1);
};

const ProjectDelete = ({ api = '/api/projects/delete' }) => {
    const [projects, setProjects] = useState([]);
    const [selectedId, setSelectedId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch('/api/projects/list', {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })
            .then((r) => r.json())
            .then((d) => setProjects(Array.isArray(d) ? d : []))
            .catch(() => {});
    }, []);

    const selectedProject = useMemo(
        () => projects.find((p) => p.project_id === selectedId) || null,
        [projects, selectedId]
    );

    const handleDelete = async () => {
        if (!selectedId) return;
        setLoading(true);
        setError('');
        setSuccess('');
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${api}/${selectedId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess('Project deleted successfully.');
                setProjects((prev) => prev.filter((p) => p.project_id !== selectedId));
                setSelectedId('');
            } else {
                setError(data.error || 'Delete failed.');
            }
        } catch {
            setError('Network error.');
        }
        setLoading(false);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-5">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <Field label="Select project to delete" id="projectDeleteSelect" required>
                    <Select
                        id="projectDeleteSelect"
                        value={selectedId}
                        onChange={(e) => setSelectedId(e.target.value)}
                    >
                        <option value="">Choose a project…</option>
                        {projects.map((p) => (
                            <option key={p.project_id} value={p.project_id}>
                                {p.name}
                            </option>
                        ))}
                    </Select>
                </Field>
            </div>

            {selectedProject && (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-start gap-3 bg-rose-50">
                        <LuTriangleAlert
                            size={18}
                            className="text-rose-600 mt-0.5 flex-shrink-0"
                        />
                        <div>
                            <h3 className="text-sm font-semibold text-rose-900">
                                Permanently delete this project?
                            </h3>
                            <p className="text-xs text-rose-700 mt-0.5">
                                All associated tasks and time entries will be deleted as well. This
                                action cannot be undone.
                            </p>
                        </div>
                    </div>

                    <div className="p-6 space-y-5">
                        <div>
                            <span className="span-label-style">Project</span>
                            <h2 className="mt-1 text-base font-semibold text-gray-900">
                                {selectedProject.name}
                            </h2>
                        </div>

                        <div>
                            <span className="span-label-style">Description</span>
                            <p className="mt-1.5 text-sm text-gray-600 line-clamp-3">
                                {stripHtml(selectedProject.description) || 'No description.'}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="span-label-style">Manager</span>
                                <div className="mt-1.5 text-sm text-gray-900">
                                    {selectedProject.manager_first_name}{' '}
                                    {selectedProject.manager_last_name}
                                </div>
                            </div>
                            <div>
                                <span className="span-label-style">Status</span>
                                <div className="mt-1.5">
                                    <StatusPill tone={toneFor(selectedProject.status)}>
                                        {statusLabel(selectedProject.status)}
                                    </StatusPill>
                                </div>
                            </div>
                            <div>
                                <span className="span-label-style">Start Date</span>
                                <div className="mt-1.5 text-sm text-gray-900 tabular-nums">
                                    {formatDate(selectedProject.start_date)}
                                </div>
                            </div>
                            <div>
                                <span className="span-label-style">Due Date</span>
                                <div className="mt-1.5 text-sm text-gray-900 tabular-nums">
                                    {formatDate(selectedProject.due_date)}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setSelectedId('')}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                variant="danger"
                                onClick={handleDelete}
                                loading={loading}
                            >
                                Delete project
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <NotificationAlert type="error" message={error} onClose={() => setError('')} />
            )}
            {success && (
                <NotificationAlert type="success" message={success} onClose={() => setSuccess('')} />
            )}
        </div>
    );
};

export default ProjectDelete;
