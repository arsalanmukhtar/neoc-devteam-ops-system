import React, { useEffect, useState, useMemo } from 'react';
import { MantineReactTable, useMantineReactTable } from 'mantine-react-table';
import { Modal } from '@mantine/core';
import { formatDate } from '@src/utils/dateFormatter';

// const baseURL = 'http://localhost:3000';

// Status mapping and colors
const statusMap = {
    active: { label: 'Active', color: '#2563eb' },        // blue
    inactive: { label: 'Inactive', color: '#ef4444' },    // red
    in_progress: { label: 'In Progress', color: '#f59e0b' }, // amber
    planning: { label: 'Planning', color: '#06b6d4' },    // cyan
    completed: { label: 'Completed', color: '#22c55e' },  // green
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
                    const value = cell.getValue();
                    const status = statusMap[value] || { label: value, color: '#44403c' };
                    return (
                        <span style={{
                            color: status.color,
                            fontWeight: 'bold',
                            textTransform: 'capitalize'
                        }}>
                            {status.label}
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
                            <span className="span-label-style">Project Name</span>
                            <span className="text-lg font-bold text-blue-400">{selectedProject.name}</span>
                        </div>
                        {/* Description */}
                        <div className="sidebar-scroll flex flex-col h-96 overflow-y-auto">
                            <span className="span-label-style">Description</span>
                            <div
                                className="tiptap border border-gray-200 rounded p-3 bg-gray-50 text-gray-700"
                                dangerouslySetInnerHTML={{ __html: selectedProject.description }}
                            />
                        </div>
                        {/* Manager */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="flex flex-col">
                                <span className="span-label-style">Manager</span>
                                <span className="text-base text-gray-700">{selectedProject.manager_first_name} {selectedProject.manager_last_name}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="span-label-style">Status</span>
                                <span style={{
                                    color: statusMap[selectedProject.status]?.color || '#44403c',
                                    fontWeight: 'bold',
                                    textTransform: 'capitalize'
                                }}>
                                    {statusMap[selectedProject.status]?.label || selectedProject.status}
                                </span>
                            </div>
                        </div>
                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="flex flex-col">
                                <span className="span-label-style">Start Date</span>
                                <span className="text-base text-gray-700">{formatDate(selectedProject.start_date)}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="span-label-style">Due Date</span>
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