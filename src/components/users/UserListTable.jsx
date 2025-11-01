import React, { useEffect, useState, useMemo } from 'react';
import { MantineReactTable, useMantineReactTable } from 'mantine-react-table';

const baseURL = 'http://localhost:3000';

const UserListTable = ({ api }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rowSelection, setRowSelection] = useState({});

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
                setUsers(Array.isArray(data) ? data : []);
                setLoading(false);
            });
    }, [api]);

    const columns = useMemo(
        () => [
            {
                accessorKey: 'first_name',
                header: 'First Name',
                mantineTableHeadCellProps: { sx: { color: '#2563eb' } },
                Cell: ({ cell }) => <span>{cell.getValue()}</span>,
            },
            {
                accessorKey: 'last_name',
                header: 'Last Name',
                mantineTableHeadCellProps: { sx: { color: '#2563eb' } },
                Cell: ({ cell }) => <span>{cell.getValue()}</span>,
            },
            {
                accessorKey: 'email',
                header: 'Email',
                mantineTableHeadCellProps: { sx: { color: '#2563eb' } },
                Cell: ({ cell }) => <span>{cell.getValue()}</span>,
            },
            {
                accessorKey: 'role_id',
                header: 'Role ID',
                mantineTableHeadCellProps: { sx: { color: '#2563eb' } },
                Cell: ({ cell }) => <span>{cell.getValue()}</span>,
            },
            {
                accessorKey: 'role_name',
                header: 'Role Name',
                mantineTableHeadCellProps: { sx: { color: '#2563eb' } },
                Cell: ({ cell }) => <span>{cell.getValue()}</span>,
            },
            {
                accessorKey: 'is_active',
                header: 'Active',
                mantineTableHeadCellProps: { sx: { color: '#2563eb' } },
                Cell: ({ cell }) => <span>{cell.getValue() ? 'Active' : 'Inactive'}</span>,
            },
        ],
        [],
    );

    const table = useMantineReactTable({
        columns,
        data: users,
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
        mantineTableBodyCellProps: {
            sx: { background: '#f8fafc' },
        },
        mantineTableHeadCellProps: {
            sx: {
                background: '#e0e7ef',
                display: 'flex',
                justifyContent: 'space-between', // This keeps header left, icons right
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

    if (!users.length) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#e53e3e', background: '#f8fafc', borderRadius: '8px' }}>
                No users found or unauthorized.
            </div>
        );
    }

    return <MantineReactTable table={table} />;
};

export default UserListTable;