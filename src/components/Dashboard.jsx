import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Workspace from './Workspace';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('users');
    const roleId = Number(localStorage.getItem('role_id')); // Ensure it's a number

    return (
        <div className="flex" style={{ height: 'calc(100vh - 5rem)' }}>
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <Workspace activeTab={activeTab} roleId={roleId} />
        </div>
    );
};

export default Dashboard;