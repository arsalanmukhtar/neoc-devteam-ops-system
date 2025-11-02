import React, { useEffect, useState, useMemo } from 'react';
import { MantineReactTable, useMantineReactTable } from 'mantine-react-table';
import { Modal } from '@mantine/core';

const baseURL = 'http://localhost:3000';

const ProjectListTable = ({ api }) => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rowSelection, setRowSelection] = useState({});
    const [modalOpened, setModalOpened] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch(baseURL + api, {
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
            <div style={{ padding: '2rem', textAlign: 'center', color: '#3b82f6', background: '#f8fafc', borderRadius: '8px' }}>
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
                        {/* <span className="text-base font-normal text-gray-500">{selectedProject?.name}</span> */}
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
                    </div>
                )}
            </Modal>
        </>
    );
};

export default ProjectListTable;