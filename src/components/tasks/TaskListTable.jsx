import React, { useEffect, useState, useMemo } from 'react';
import { MantineReactTable, useMantineReactTable } from 'mantine-react-table';
import { Modal, Button, Select } from '@mantine/core';

const baseURL = 'http://localhost:3000';

const statusColors = {
    pending: 'text-yellow-700',
    in_progress: 'text-blue-700',
    completed: 'text-green-700',
};

const priorityColors = {
    high: 'text-red-600 font-bold',
    medium: 'text-yellow-600 font-semibold',
    low: 'text-green-600',
};

const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
];

const priorityOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
];

const TaskListTable = ({ api = "/api/tasks/list" }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rowSelection, setRowSelection] = useState({});
    const [modalOpened, setModalOpened] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [roleId, setRoleId] = useState(null);
    const [userId, setUserId] = useState(null);
    const [modalStatus, setModalStatus] = useState("");
    const [modalPriority, setModalPriority] = useState("");
    const [saveLoading, setSaveLoading] = useState(false);

    // Get role_id and user_id from localStorage
    useEffect(() => {
        setRoleId(Number(localStorage.getItem("role_id")));
        setUserId(localStorage.getItem("user_id"));
    }, []);

    // Fetch tasks
    useEffect(() => {
        const token = localStorage.getItem('token');
        let url = baseURL + api;
        if (roleId === 3 && userId) {
            url += `?assigned_to_id=${userId}`;
        }
        fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
            .then(res => res.json())
            .then(data => {
                setTasks(Array.isArray(data) ? data : []);
                setLoading(false);
            });
    }, [api, roleId, userId]);

    const columns = useMemo(
        () => [
            {
                accessorKey: 'title',
                header: 'Title',
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
                            setSelectedTask(row.original);
                            setModalStatus(row.original.status);
                            setModalPriority(row.original.priority);
                            setModalOpened(true);
                        }}
                    >
                        {row.original.title}
                    </span>
                ),
            },
            {
                accessorKey: 'assigned_to_id',
                header: 'Assigned To',
                mantineTableHeadCellProps: { sx: { color: '#2563eb' } },
                Cell: ({ row }) => (
                    <span className="text-base text-gray-700">
                        {row.original.assigned_first_name} {row.original.assigned_last_name}
                    </span>
                ),
            },
            {
                accessorKey: 'project_name',
                header: 'Project',
                mantineTableHeadCellProps: { sx: { color: '#2563eb' } },
                Cell: ({ cell }) => <span>{cell.getValue()}</span>,
            },
            {
                accessorKey: 'priority',
                header: 'Priority',
                mantineTableHeadCellProps: { sx: { color: '#2563eb' } },
                Cell: ({ cell }) => (
                    <span className={priorityColors[cell.getValue()]}>
                        {cell.getValue()?.charAt(0).toUpperCase() + cell.getValue()?.slice(1)}
                    </span>
                ),
            },
            {
                accessorKey: 'status',
                header: 'Status',
                mantineTableHeadCellProps: { sx: { color: '#2563eb' } },
                Cell: ({ cell }) => (
                    <span className={`px-2 py-1 rounded font-semibold ${statusColors[cell.getValue()] || ''}`}>
                        {cell.getValue()?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                ),
            },
            {
                accessorKey: 'due_date',
                header: 'Due Date',
                mantineTableHeadCellProps: { sx: { color: '#2563eb' } },
                Cell: ({ cell }) => <span>{cell.getValue()}</span>,
            },
        ],
        []
    );

    const table = useMantineReactTable({
        columns,
        data: tasks,
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

    const handleDeleteTask = async () => {
        if (!selectedTask) return;
        setDeleteLoading(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${baseURL}/api/tasks/delete/${selectedTask.task_id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (res.ok) {
                setTasks(tasks.filter(task => task.task_id !== selectedTask.task_id));
                setModalOpened(false);
                setSelectedTask(null);
            }
        } catch (err) {
            // Optionally handle error
        }
        setDeleteLoading(false);
    };

    const handleSaveTask = async () => {
        if (!selectedTask) return;
        setSaveLoading(true);
        const token = localStorage.getItem('token');
        try {
            await fetch(`${baseURL}/api/tasks/update/${selectedTask.task_id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: modalStatus,
                    priority: modalPriority
                }),
            });
            setTasks(tasks =>
                tasks.map(task =>
                    task.task_id === selectedTask.task_id
                        ? { ...task, status: modalStatus, priority: modalPriority }
                        : task
                )
            );
            setModalOpened(false);
            setSelectedTask(null);
        } catch (err) {
            // Optionally handle error
        }
        setSaveLoading(false);
    };

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '8px' }}>
                Loading...
            </div>
        );
    }

    if (!tasks.length) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#e53e3e', background: '#f8fafc', borderRadius: '8px' }}>
                No tasks found or unauthorized.
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
                        <span className='text-stone-700 text-2xl'>Task Details</span>
                    </div>
                }
                centered
                size="lg"
                overlayProps={{ blur: 4 }}
                className='sidebar-scroll'
            >
                {selectedTask && (
                    <div className="p-4 bg-white rounded-lg shadow space-y-6">
                        {/* Title */}
                        <div className="flex flex-col">
                            <span className="text-xs font-semibold text-gray-400 uppercase mb-1">Title</span>
                            <span className="text-lg font-bold text-blue-400">{selectedTask.title}</span>
                        </div>
                        {/* Description */}
                        <div className="sidebar-scroll flex flex-col h-96 overflow-y-auto">
                            <span className="text-xs font-semibold text-gray-400 uppercase mb-1">Description</span>
                            <div
                                className="tiptap border border-gray-200 rounded p-3 bg-gray-50 text-gray-700"
                                dangerouslySetInnerHTML={{ __html: selectedTask.description }}
                            />
                        </div>
                        {/* Project */}
                        <div className="flex flex-col">
                            <span className="text-xs font-semibold text-gray-400 uppercase mb-1">Project</span>
                            <span className="text-base text-gray-700">{selectedTask.project_name}</span>
                        </div>
                        {/* Priority, Status, Due Date */}
                        <div className="grid grid-cols-3 gap-6">
                            {/* Assigned To */}
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-400 uppercase mb-1">Assigned To</span>
                                <span className="text-base text-gray-700">{selectedTask.assigned_first_name} {selectedTask.assigned_last_name}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-400 uppercase mb-1">Priority</span>
                                {roleId !== 3 ? (
                                    <Select
                                        data={priorityOptions}
                                        value={modalPriority}
                                        onChange={setModalPriority}
                                        classNames={{
                                            input: 'input-border font-sans',
                                            dropdown: 'font-sans',
                                            item: 'font-sans'
                                        }}
                                        size="sm"
                                        radius="xl"
                                        className="w-full"
                                    />
                                ) : (
                                    <span className={priorityColors[selectedTask.priority]}>
                                        {selectedTask.priority?.charAt(0).toUpperCase() + selectedTask.priority?.slice(1)}
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-400 uppercase mb-1">Status</span>
                                <Select
                                    data={statusOptions}
                                    value={modalStatus}
                                    onChange={setModalStatus}
                                    classNames={{
                                        input: 'input-border font-sans',
                                        dropdown: 'font-sans',
                                        item: 'font-sans'
                                    }}
                                    size="sm"
                                    radius="xl"
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            {/* Due Date */}
                            <div className="flex flex-col">
                                <span className="span-label-style">Due Date</span>
                                <span className="text-base text-gray-700">{selectedTask.due_date}</span>
                            </div>
                            {/* Created At */}
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-400 uppercase mb-1">Created At</span>
                                <span className="text-base text-gray-700">{selectedTask.created_at}</span>
                            </div>
                        </div>
                        {/* Modal Action Buttons */}
                        <div className="flex justify-center gap-4 mt-8">
                            <Button
                                color="gray"
                                variant="outline"
                                className="w-40 rounded-full"
                                onClick={() => setModalOpened(false)}
                                disabled={saveLoading || deleteLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                color="green"
                                className="w-40 rounded-full"
                                loading={saveLoading}
                                onClick={handleSaveTask}
                            >
                                Save
                            </Button>
                            {roleId !== 3 && (
                                <Button
                                    color="red"
                                    className="w-40 rounded-full"
                                    loading={deleteLoading}
                                    onClick={handleDeleteTask}
                                >
                                    Delete Task
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
};

export default TaskListTable;