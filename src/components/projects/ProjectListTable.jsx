import React, { useEffect, useState, useMemo } from 'react';
import { LuFolderKanban } from 'react-icons/lu';
import { formatDate } from '@src/utils/dateFormatter';
import StatusPill from '../ui/StatusPill';
import { toneFor } from '../ui/statusTone';
import Card from '../ui/Card';
import Avatar from '../ui/Avatar';
import Drawer from '../ui/Drawer';
import EmptyState from '../ui/EmptyState';
import Toolbar from '../ui/Toolbar';
import Spinner from '../ui/Spinner';
import FilterPanel, { FilterGroup } from '../ui/FilterPanel';

const STATUS_OPTIONS = [
    { value: 'active', label: 'Active' },
    { value: 'planning', label: 'Planning' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'inactive', label: 'Inactive' },
];

const statusLabel = (status) => {
    if (!status) return '—';
    const s = String(status).toLowerCase().replace('_', ' ');
    return s.charAt(0).toUpperCase() + s.slice(1);
};

const stripHtml = (html) => {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return (tmp.textContent || tmp.innerText || '').trim();
};

const ProjectListTable = ({ api }) => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilters, setStatusFilters] = useState(() => new Set());
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch(api, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })
            .then((r) => r.json())
            .then((data) => {
                setProjects(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [api]);

    const toggleStatus = (v) => {
        const next = new Set(statusFilters);
        if (next.has(v)) next.delete(v);
        else next.add(v);
        setStatusFilters(next);
    };

    const filtered = useMemo(() => {
        return projects.filter((p) => {
            if (statusFilters.size > 0 && !statusFilters.has((p.status || '').toLowerCase()))
                return false;
            if (search.trim()) {
                const q = search.toLowerCase();
                const hay = `${p.name} ${stripHtml(p.description)} ${p.manager_first_name} ${p.manager_last_name}`.toLowerCase();
                if (!hay.includes(q)) return false;
            }
            return true;
        });
    }, [projects, search, statusFilters]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 text-gray-500 dark:text-gray-400 gap-2">
                <Spinner size={16} />
                <span className="text-sm">Loading projects…</span>
            </div>
        );
    }

    const hasActive = statusFilters.size > 0;

    return (
        <div className="h-full flex flex-col">
            <div className="flex-shrink-0 px-8 pt-6 pb-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
                <div className="flex items-baseline justify-between mb-3 gap-3">
                    <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50 tracking-tight">
                        List All Projects
                    </h2>
                    <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums flex-shrink-0">
                        {filtered.length} {filtered.length === 1 ? 'project' : 'projects'}
                    </span>
                </div>
                <Toolbar
                    search={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search projects…"
                    filters={
                        <FilterPanel hasActive={hasActive} onClear={() => setStatusFilters(new Set())}>
                            <FilterGroup
                                title="Status"
                                options={STATUS_OPTIONS}
                                selected={statusFilters}
                                onToggle={toggleStatus}
                            />
                        </FilterPanel>
                    }
                />
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto sidebar-scroll px-8 py-6">
            {filtered.length === 0 ? (
                <EmptyState
                    icon={LuFolderKanban}
                    title={projects.length === 0 ? 'No projects yet' : 'No matches'}
                    description={
                        projects.length === 0
                            ? 'Create your first project from the Create tab.'
                            : 'Try a different search or filter combination.'
                    }
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
                    {filtered.map((p) => (
                        <Card
                            key={p.project_id}
                            tone={toneFor(p.status)}
                            onClick={() => setSelected(p)}
                        >
                            <div className="mb-3">
                                <StatusPill tone={toneFor(p.status)}>
                                    {statusLabel(p.status)}
                                </StatusPill>
                            </div>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50 mb-1 line-clamp-1">
                                {p.name}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 min-h-[2rem] line-clamp-2">
                                {stripHtml(p.description) || 'No description.'}
                            </p>
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-2 min-w-0">
                                    <Avatar
                                        firstName={p.manager_first_name}
                                        lastName={p.manager_last_name}
                                        size="xs"
                                    />
                                    <span className="text-xs text-gray-600 dark:text-gray-300 truncate">
                                        {p.manager_first_name} {p.manager_last_name}
                                    </span>
                                </div>
                                <span className="text-[11px] text-gray-500 dark:text-gray-400 flex-shrink-0 tabular-nums">
                                    Due {formatDate(p.due_date)}
                                </span>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
            </div>

            <Drawer
                open={!!selected}
                onClose={() => setSelected(null)}
                title={selected?.name}
                subtitle="Project details"
                width="lg"
            >
                {selected && (
                    <div className="space-y-5">
                        <div>
                            <span className="span-label-style">Status</span>
                            <div className="mt-1.5">
                                <StatusPill tone={toneFor(selected.status)}>
                                    {statusLabel(selected.status)}
                                </StatusPill>
                            </div>
                        </div>

                        <div>
                            <span className="span-label-style">Description</span>
                            <div
                                className="tiptap mt-1.5 text-sm text-gray-700 dark:text-gray-200 max-h-72 overflow-y-auto sidebar-scroll border border-gray-200 dark:border-gray-800 rounded-md p-3 bg-gray-50 dark:bg-gray-950"
                                dangerouslySetInnerHTML={{
                                    __html:
                                        selected.description ||
                                        '<p class="text-gray-400 dark:text-gray-500">No description.</p>',
                                }}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="span-label-style">Manager</span>
                                <div className="mt-1.5 flex items-center gap-2">
                                    <Avatar
                                        firstName={selected.manager_first_name}
                                        lastName={selected.manager_last_name}
                                        size="xs"
                                    />
                                    <span className="text-sm text-gray-900 dark:text-gray-100 truncate">
                                        {selected.manager_first_name} {selected.manager_last_name}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <span className="span-label-style">Project ID</span>
                                <code className="mt-1.5 block text-[11px] text-gray-500 dark:text-gray-400 font-mono truncate">
                                    {selected.project_id}
                                </code>
                            </div>
                            <div>
                                <span className="span-label-style">Start Date</span>
                                <div className="mt-1.5 text-sm text-gray-900 dark:text-gray-100 tabular-nums">
                                    {formatDate(selected.start_date)}
                                </div>
                            </div>
                            <div>
                                <span className="span-label-style">Due Date</span>
                                <div className="mt-1.5 text-sm text-gray-900 dark:text-gray-100 tabular-nums">
                                    {formatDate(selected.due_date)}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Drawer>
        </div>
    );
};

export default ProjectListTable;
