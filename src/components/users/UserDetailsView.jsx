import React, { useEffect, useState } from 'react';
import { Select, Table } from '@mantine/core';

const baseURL = 'http://localhost:3000';

const UserDetailsView = ({ api }) => {
    const [users, setUsers] = useState([]);
    const [selectedId, setSelectedId] = useState('');
    const [details, setDetails] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch(baseURL + '/api/users/all', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
            .then(res => res.json())
            .then(data => setUsers(Array.isArray(data) ? data : []));
    }, []);

    useEffect(() => {
        if (selectedId) {
            const token = localStorage.getItem('token');
            fetch(`${baseURL}${api}/${selectedId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => res.json())
                .then(data => setDetails(data));
        }
    }, [selectedId, api]);

    return (
        <div className="w-full flex flex-col items-center font-sans">
            <div className="mb-4 w-full max-w-2xl">
                <label htmlFor="userSelect" className="block font-medium text-stone-700 mb-2 text-center">
                    Select User
                </label>
                <Select
                    id="userSelect"
                    name="userSelect"
                    placeholder="Choose a user"
                    data={
                        users.map(user => ({
                            value: user.user_id,
                            label: `${user.first_name} ${user.last_name}`
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
                        input: { width: '100%' },
                    }}
                    required
                />
            </div>
            {details && (
                <div className="w-full max-w-2xl">
                    <Table
                        striped
                        highlightOnHover
                        withColumnBorders
                        style={{
                            marginTop: '2rem',
                            width: '100%',
                            background: '#FBFCFA',
                            borderRadius: '1rem',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                            border: '1px solid #e2e8f0',
                            textAlign: 'left'
                        }}
                    >
                        <tbody>
                            <tr>
                                <td className="table-header-style"><strong>First Name</strong></td>
                                <td className="text-stone-600">{details.first_name}</td>
                            </tr>
                            <tr>
                                <td className="table-header-style"><strong>Last Name</strong></td>
                                <td className="text-stone-600">{details.last_name}</td>
                            </tr>
                            <tr>
                                <td className="table-header-style"><strong>Email</strong></td>
                                <td className="text-stone-600">{details.email}</td>
                            </tr>
                            <tr>
                                <td className="table-header-style"><strong>Role</strong></td>
                                <td className="text-stone-600">{details.role_id}</td>
                            </tr>
                            <tr>
                                <td className="table-header-style"><strong>Active</strong></td>
                                <td className={details.is_active ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'}>
                                    {details.is_active ? "Active" : "Inactive"}
                                </td>
                            </tr>
                        </tbody>
                    </Table>
                </div>
            )}
        </div>
    );
};

export default UserDetailsView;