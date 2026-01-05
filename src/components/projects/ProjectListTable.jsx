import React, { useEffect, useState, useMemo } from 'react';
import { MantineReactTable, useMantineReactTable } from 'mantine-react-table';
import { Modal } from '@mantine/core';
import { formatDate } from '@src/utils/dateFormatter';

// const baseURL = 'http://localhost:3000';

// Status colors with badge styling
const statusColors = {
    active: { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },        // Blue
    inactive: { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },      // Red
    in_progress: { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },   // Amber
    planning: { bg: '#cffafe', text: '#155e75', border: '#67e8f9' },      // Cyan
    completed: { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' },     // Green
};

const statusLabels = {
    active: 'Active',
    inactive: 'Inactive',
    in_progress: 'In Progress',
    planning: 'Planning',
    completed: 'Completed',
};

const ProjectListTable = ({ api }) => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rowSelection, setRowSelection] = useState({});
    const [modalOpened, setModalOpened] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch(api, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
            .then(res => res.json())
            .then(data => {
                setProjects(Array.isArray(data) ? data : []);
                setLoading(false);
            });
    }, [api]);

    const columns = useMemo(
        () => [
            {
                accessorKey: 'name',
                header: 'Project Name',
                mantineTableHeadCellProps: { sx: { color: '#2563eb' } },
                Cell: ({ row }) => (
                    <span
                        className="text-xs"
                        style={{
                            color: '#2563eb',
                            cursor: 'pointer',
                            fontWeight: 500,
                            transition: 'color 0.2s',
                        }}
                        onClick={() => {
                            setSelectedProject(row.original);
                            setModalOpened(true);
                        }}
                    >
                        {row.original.name}
                    </span>
                ),
            },
            {
                accessorKey: 'status',
                header: 'Status',
                mantineTableHeadCellProps: { sx: { color: '#2563eb' } },
                Cell: ({ cell }) => {
                    const value = cell.getValue()?.toLowerCase();
                    const colors = statusColors[value] || { bg: '#f3f4f6', text: '#6b7280', border: '#d1d5db' };
                    const label = statusLabels[value] || cell.getValue();
                    return (
                        <span
                            className="text-xs px-3 py-1.5 rounded-full font-semibold inline-flex items-center gap-1.5"
                            style={{
                                backgroundColor: colors.bg,
                                color: colors.text,
                                border: `1px solid ${colors.border}`,
                            }}
                        >
                            <span
                                style={{
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    backgroundColor: colors.text,
                                }}
                            />
                            {label}
                        </span>
                    );
                },
            },
        ],
        []
    );

    const table = useMantineReactTable({
        columns,
        data: projects,
        enableColumnOrdering: true,
        enableRowSelection: true,
        enablePagination: true,
        onRowSelectionChange: setRowSelection,
        state: { rowSelection },
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

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '8px' }}>
                Loading...
            </div>
        );
    }

    if (!projects.length) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#e53e3e', background: '#f8fafc', borderRadius: '8px' }}>
                No projects found or unauthorized.
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
                        <span className='text-stone-700 text-2xl'>Project Details</span>
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
                        {/* Manager and Status */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-400 uppercase mb-1">Manager</span>
                                <span className="text-base text-gray-700">
                                    {selectedProject.manager_first_name} {selectedProject.manager_last_name}
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-400 uppercase mb-1">Status</span>
                                <span
                                    className="text-sm px-3 py-1.5 rounded-full font-semibold inline-flex items-center gap-1.5 w-fit"
                                    style={{
                                        backgroundColor: statusColors[selectedProject.status?.toLowerCase()]?.bg || '#f3f4f6',
                                        color: statusColors[selectedProject.status?.toLowerCase()]?.text || '#6b7280',
                                        border: `1px solid ${statusColors[selectedProject.status?.toLowerCase()]?.border || '#d1d5db'}`,
                                    }}
                                >
                                    <span
                                        style={{
                                            width: '6px',
                                            height: '6px',
                                            borderRadius: '50%',
                                            backgroundColor: statusColors[selectedProject.status?.toLowerCase()]?.text || '#6b7280',
                                        }}
                                    />
                                    {statusLabels[selectedProject.status?.toLowerCase()] || selectedProject.status}
                                </span>
                            </div>
                        </div>
                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-400 uppercase mb-1">Start Date</span>
                                <span className="text-base text-gray-700">{formatDate(selectedProject.start_date)}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-400 uppercase mb-1">Due Date</span>
                                <span className="text-base text-gray-700">{formatDate(selectedProject.due_date)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
};

export default ProjectListTable;